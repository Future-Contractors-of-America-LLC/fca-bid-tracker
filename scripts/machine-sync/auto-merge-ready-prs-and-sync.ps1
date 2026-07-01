# Auto-merge ready PRs and complete repo/live sync for FCA frontend.
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\machine-sync\auto-merge-ready-prs-and-sync.ps1
# Optional dry run (no write operations):
#   powershell -ExecutionPolicy Bypass -File scripts\machine-sync\auto-merge-ready-prs-and-sync.ps1 -DryRun

[CmdletBinding()]
param(
  [string]$Repo = "Future-Contractors-of-America-LLC/fca-bid-tracker",
  [int[]]$PrNumbers = @(176, 177, 178),
  [string]$WorkflowFile = "azure-static-web-apps-delightful-mushroom-0de67860f.yml",
  [int]$PollSeconds = 20,
  [int]$TimeoutMinutes = 25,
  [string]$ReportPath = "workspace/final-sync-state-report.json",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$FeatureMap = @{
  176 = @("Academy portal integration")
  177 = @("SWA smoke verification non-blocking", "Deployment diagnostics", "Recovery documentation")
  178 = @("Repo cleanup stale-branch inventory", "Deployment state snapshot")
}

function Invoke-Gh {
  param(
    [Parameter(Mandatory = $true)] [string[]]$Args,
    [switch]$Json,
    [switch]$AllowFailure
  )

  $raw = & gh @Args 2>&1
  $exitCode = $LASTEXITCODE
  $text = ($raw -join "`n")

  if ($exitCode -ne 0 -and -not $AllowFailure) {
    throw "gh $($Args -join ' ') failed: $text"
  }

  if ($Json) {
    if ([string]::IsNullOrWhiteSpace($text)) {
      return $null
    }
    return $text | ConvertFrom-Json
  }

  return $text
}

function Invoke-GhWrite {
  param([Parameter(Mandatory = $true)] [string[]]$Args)
  if ($DryRun) {
    Write-Host "[dry-run] gh $($Args -join ' ')" -ForegroundColor Yellow
    return ""
  }
  return Invoke-Gh -Args $Args
}

function Wait-MainRunsIdle {
  param([int]$Attempts = 15)
  for ($i = 1; $i -le $Attempts; $i++) {
    $countText = Invoke-Gh -Args @("api", "repos/$Repo/actions/runs?branch=main&status=in_progress", "--jq", ".total_count")
    $count = 0
    [void][int]::TryParse($countText.Trim(), [ref]$count)
    if ($count -eq 0) {
      Write-Host "No active main workflow runs." -ForegroundColor Green
      return
    }

    Write-Host "Active main runs: $count. Waiting 20s ($i/$Attempts)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 20
  }

  throw "Timed out waiting for active main workflow runs to finish."
}

function Merge-ReadyPr {
  param([int]$Number)

  $pr = Invoke-Gh -Args @("pr", "view", "$Number", "--repo", $Repo, "--json", "number,title,isDraft,state,url") -Json
  if (-not $pr) {
    throw "Unable to read PR #$Number"
  }

  if ($pr.state -ne "OPEN") {
    Write-Host "PR #$Number is $($pr.state); skipping merge." -ForegroundColor Yellow
    return $null
  }

  if ($pr.isDraft) {
    Invoke-GhWrite -Args @("pr", "ready", "$Number", "--repo", $Repo) | Out-Null
    Start-Sleep -Seconds 3
  }

  Write-Host "Merging #$Number — $($pr.title)" -ForegroundColor Cyan
  Invoke-GhWrite -Args @("pr", "merge", "$Number", "--repo", $Repo, "--squash", "--delete-branch") | Out-Null

  if ($DryRun) {
    return [pscustomobject]@{
      number = $Number
      title = $pr.title
      mergedAt = "dry-run"
      mergeCommit = [pscustomobject]@{ oid = "dry-run" }
      url = $pr.url
    }
  }

  Start-Sleep -Seconds 3
  return Invoke-Gh -Args @("pr", "view", "$Number", "--repo", $Repo, "--json", "number,title,mergedAt,mergeCommit,url") -Json
}

function Get-StaleBranchesFromPr178 {
  $pr178 = Invoke-Gh -Args @("pr", "view", "178", "--repo", $Repo, "--json", "body") -Json
  $body = if ($pr178 -and $pr178.body) { [string]$pr178.body } else { "" }

  $matches = [regex]::Matches($body, "(?im)\bauricrux/[a-z0-9._\-/]+")
  $branches = @($matches | ForEach-Object { $_.Value.Trim() } | Sort-Object -Unique)

  if ($branches.Count -gt 0) {
    return $branches
  }

  Write-Host "No explicit stale branches found in PR #178 body; using remote auricrux/* branches fallback." -ForegroundColor Yellow
  $remote = Invoke-Gh -Args @("api", "repos/$Repo/branches?per_page=100") -Json
  return @($remote | Where-Object { $_.name -like "auricrux/*" } | ForEach-Object { $_.name } | Sort-Object -Unique)
}

function Delete-StaleBranches {
  param([string[]]$Branches)

  $openPrHeads = @(Invoke-Gh -Args @("pr", "list", "--repo", $Repo, "--state", "open", "--limit", "200", "--json", "headRefName") -Json | ForEach-Object { $_.headRefName })
  $deleted = New-Object System.Collections.Generic.List[string]
  $skipped = New-Object System.Collections.Generic.List[string]

  foreach ($branch in $Branches) {
    if ([string]::IsNullOrWhiteSpace($branch)) { continue }
    if ($branch -eq "main") {
      $skipped.Add($branch)
      continue
    }
    if ($openPrHeads -contains $branch) {
      Write-Host "Skipping branch in active PR: $branch" -ForegroundColor Yellow
      $skipped.Add($branch)
      continue
    }

    Write-Host "Deleting stale branch: $branch"
    if ($DryRun) {
      Write-Host "[dry-run] gh api -X DELETE repos/$Repo/git/refs/heads/$branch" -ForegroundColor Yellow
      $deleted.Add($branch)
      continue
    }

    $out = Invoke-Gh -Args @("api", "-X", "DELETE", "repos/$Repo/git/refs/heads/$branch") -AllowFailure
    if ($LASTEXITCODE -eq 0) {
      $deleted.Add($branch)
    } else {
      Write-Host "Could not delete $branch (already gone or protected): $out" -ForegroundColor Yellow
      $skipped.Add($branch)
    }
  }

  return [pscustomobject]@{ deleted = @($deleted); skipped = @($skipped) }
}

function Trigger-And-WaitWorkflow {
  $startedAt = (Get-Date).ToUniversalTime()
  Invoke-GhWrite -Args @("workflow", "run", $WorkflowFile, "--repo", $Repo, "--ref", "main") | Out-Null

  if ($DryRun) {
    return [pscustomobject]@{
      id = "dry-run"
      status = "completed"
      conclusion = "success"
      headSha = "dry-run"
      createdAt = $startedAt.ToString("o")
      updatedAt = $startedAt.ToString("o")
      url = "https://github.com/$Repo/actions"
    }
  }

  $deadline = (Get-Date).AddMinutes($TimeoutMinutes)
  $run = $null

  do {
    Start-Sleep -Seconds 8
    $runs = Invoke-Gh -Args @("run", "list", "--repo", $Repo, "--workflow", $WorkflowFile, "--branch", "main", "--limit", "10", "--json", "databaseId,status,conclusion,headSha,createdAt,updatedAt,url") -Json
    $run = @($runs | Where-Object { [datetime]$_.createdAt -ge $startedAt.AddMinutes(-1) } | Select-Object -First 1)
  } while (-not $run -and (Get-Date) -lt $deadline)

  if (-not $run) {
    throw "Timed out locating workflow run for $WorkflowFile after dispatch."
  }

  do {
    $current = Invoke-Gh -Args @("run", "view", "$($run.databaseId)", "--repo", $Repo, "--json", "databaseId,status,conclusion,headSha,createdAt,updatedAt,url") -Json
    Write-Host "Workflow run $($run.databaseId): status=$($current.status) conclusion=$($current.conclusion)"
    if ($current.status -eq "completed") {
      if ($current.conclusion -ne "success") {
        $failedLogs = Invoke-Gh -Args @("run", "view", "$($run.databaseId)", "--repo", $Repo, "--log-failed") -AllowFailure
        throw "Workflow run failed: $($current.conclusion)`n$failedLogs"
      }
      return $current
    }
    Start-Sleep -Seconds $PollSeconds
  } while ((Get-Date) -lt $deadline)

  throw "Timed out waiting for workflow run $($run.databaseId) completion."
}

Write-Host "=== Auto-merge + repo/live sync ===" -ForegroundColor Cyan
Write-Host "Repo: $Repo"
Invoke-Gh -Args @("auth", "status") | Out-Null

Wait-MainRunsIdle

$merged = New-Object System.Collections.Generic.List[object]
foreach ($prNumber in $PrNumbers) {
  $mergedPr = Merge-ReadyPr -Number $prNumber
  if ($mergedPr) {
    $merged.Add($mergedPr)
  }
}

$staleBranches = Get-StaleBranchesFromPr178
$branchResult = Delete-StaleBranches -Branches $staleBranches

$deployment = Trigger-And-WaitWorkflow

$openPrs = Invoke-Gh -Args @("pr", "list", "--repo", $Repo, "--state", "open", "--limit", "20", "--json", "number,title,isDraft,url") -Json
$openIssues = Invoke-Gh -Args @("issue", "list", "--repo", $Repo, "--state", "open", "--limit", "30", "--json", "number,title,labels,url") -Json
$blockingIssues = @($openIssues | Where-Object { @($_.labels | ForEach-Object { $_.name }) -match "blocker|blocked|critical" })

$nextActions = @()
if ($blockingIssues.Count -gt 0) {
  $nextActions += [pscustomobject]@{ priority = "high"; action = "Resolve blocker-labeled open issues"; count = $blockingIssues.Count }
}
if (@($openPrs).Count -gt 0) {
  $nextActions += [pscustomobject]@{ priority = "medium"; action = "Review and merge remaining open pull requests"; count = @($openPrs).Count }
}
if ($nextActions.Count -eq 0) {
  $nextActions += [pscustomobject]@{ priority = "low"; action = "Monitor next SWA deploy cycle for drift"; count = 0 }
}

$featuresNowLive = New-Object System.Collections.Generic.List[string]
foreach ($pr in $merged) {
  $n = [int]$pr.number
  if ($FeatureMap.ContainsKey($n)) {
    foreach ($feature in $FeatureMap[$n]) {
      $featuresNowLive.Add("PR #${n}: $feature")
    }
  } else {
    $featuresNowLive.Add("PR #${n}: $($pr.title)")
  }
}

$report = [pscustomobject]@{}
$report | Add-Member -NotePropertyName "generatedAt" -NotePropertyValue ((Get-Date).ToUniversalTime().ToString("o"))
$report | Add-Member -NotePropertyName "repository" -NotePropertyValue $Repo
$report | Add-Member -NotePropertyName "mergedPullRequests" -NotePropertyValue (@($merged | ForEach-Object { $_ }))
$report | Add-Member -NotePropertyName "staleBranchesDeleted" -NotePropertyValue (@($branchResult.deleted | ForEach-Object { $_ }))
$report | Add-Member -NotePropertyName "staleBranchesSkipped" -NotePropertyValue (@($branchResult.skipped | ForEach-Object { $_ }))

$deploymentReport = [pscustomobject]@{}
$deploymentReport | Add-Member -NotePropertyName "workflow" -NotePropertyValue $WorkflowFile
$deploymentRunId = $null
if ($deployment -and ($deployment.PSObject.Properties.Name -contains "databaseId")) {
  $deploymentRunId = $deployment.databaseId
} elseif ($deployment -and ($deployment.PSObject.Properties.Name -contains "id")) {
  $deploymentRunId = $deployment.id
}
$deploymentReport | Add-Member -NotePropertyName "runId" -NotePropertyValue $deploymentRunId
$deploymentReport | Add-Member -NotePropertyName "status" -NotePropertyValue $deployment.status
$deploymentReport | Add-Member -NotePropertyName "conclusion" -NotePropertyValue $deployment.conclusion
$deploymentReport | Add-Member -NotePropertyName "headSha" -NotePropertyValue $deployment.headSha
$deploymentReport | Add-Member -NotePropertyName "createdAt" -NotePropertyValue $deployment.createdAt
$deploymentReport | Add-Member -NotePropertyName "updatedAt" -NotePropertyValue $deployment.updatedAt
$deploymentReport | Add-Member -NotePropertyName "url" -NotePropertyValue $deployment.url
$report | Add-Member -NotePropertyName "deployment" -NotePropertyValue $deploymentReport

$remainingOpenWork = [pscustomobject]@{}
$remainingOpenWork | Add-Member -NotePropertyName "openPullRequests" -NotePropertyValue @($openPrs | Select-Object number, title, isDraft, url)
$remainingOpenWork | Add-Member -NotePropertyName "blockingIssues" -NotePropertyValue @($blockingIssues | Select-Object number, title, url)
$report | Add-Member -NotePropertyName "featuresNowLive" -NotePropertyValue (@($featuresNowLive | ForEach-Object { $_ }))
$report | Add-Member -NotePropertyName "remainingOpenWork" -NotePropertyValue $remainingOpenWork
$report | Add-Member -NotePropertyName "nextActions" -NotePropertyValue @($nextActions)

$reportDir = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDir)) {
  New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

$report | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path $ReportPath
Write-Host "Final state report written: $ReportPath" -ForegroundColor Green
