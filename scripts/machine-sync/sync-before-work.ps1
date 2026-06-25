# Multi-machine sync guard — run at START of every session on any PC.
# Source of truth: GitHub (origin). OneDrive is NOT used for git repos.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\sync-before-work.ps1

$githubRoot = "C:\Users\MichaelBartholomew\Documents\GitHub"
$repoRoot = Split-Path $PSScriptRoot -Parent
if (Test-Path (Join-Path $repoRoot ".git")) {
  $detected = Split-Path $repoRoot -Parent
  if (Test-Path (Join-Path $detected "fca-bid-tracker")) {
    $githubRoot = $detected
  }
}

$repos = @(
  @{ Name = "fca-bid-tracker";     DefaultBranch = "main"; WorkBranch = "feat/phase-1k-customer-bid-status" },
  @{ Name = "auricrux-central";    DefaultBranch = "main"; WorkBranch = $null },
  @{ Name = "auricrux-bid-api-node"; DefaultBranch = "main"; WorkBranch = $null }
)

Write-Host "`n=== FCA multi-machine sync check ===" -ForegroundColor Cyan
Write-Host "GitHub root: $githubRoot`n"

foreach ($repo in $repos) {
  $path = Join-Path $githubRoot $repo.Name
  if (-not (Test-Path $path)) {
    Write-Host "[SKIP] $($repo.Name) — folder not found" -ForegroundColor Yellow
    continue
  }

  Push-Location $path
  Write-Host "--- $($repo.Name) ---" -ForegroundColor Green

  git fetch origin 2>&1 | Out-Null
  $branch = git branch --show-current 2>$null
  $status = git status -sb 2>$null
  Write-Host $status

  if ($branch -eq $repo.DefaultBranch) {
    $behind = [int](git rev-list --count "HEAD..origin/$($repo.DefaultBranch)" 2>$null)
    $ahead  = [int](git rev-list --count "origin/$($repo.DefaultBranch)..HEAD" 2>$null)
    Write-Host "  main: behind origin by $behind, ahead by $ahead"
    if ($behind -gt 0 -and $repo.Name -eq "fca-bid-tracker") {
      Write-Host "  NOTE: main moves fast (Auricrux automation). Prefer branch: $($repo.WorkBranch)" -ForegroundColor Yellow
    }
  } elseif ($branch) {
    $upstream = git rev-parse --abbrev-ref "@{u}" 2>$null
    if ($upstream) {
      $behind = [int](git rev-list --count "HEAD..@{u}" 2>$null)
      $ahead  = [int](git rev-list --count "@{u}..HEAD" 2>$null)
      Write-Host "  $branch : behind $upstream by $behind, ahead by $ahead"
      if ($behind -gt 0) {
        Write-Host "  ACTION: git pull --rebase origin $branch" -ForegroundColor Yellow
      }
      if ($ahead -gt 0) {
        Write-Host "  ACTION: git push origin $branch" -ForegroundColor Yellow
      }
    }
  }

  $dirty = git status --porcelain 2>$null
  if ($dirty) {
    Write-Host "  WARNING: uncommitted changes — commit or stash before switching machines" -ForegroundColor Red
  }

  Pop-Location
  Write-Host ""
}

Write-Host "=== OneDrive reminder ===" -ForegroundColor Cyan
Write-Host "  Code: Documents\GitHub (NOT inside OneDrive sync folders)"
Write-Host "  Work files: michael@futurecontractorsofamerica.com OneDrive"
Write-Host "  Before leaving any PC: git push your feature branch"
Write-Host "  Before starting work:  git fetch && git pull --rebase`n"
