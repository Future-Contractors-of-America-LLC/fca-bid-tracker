# Run at END of session before switching machines.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\sync-end-session.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

$branch = git branch --show-current
Write-Host "Branch: $branch"

$dirty = git status --porcelain
if ($dirty) {
  Write-Host "Uncommitted changes:" -ForegroundColor Red
  git status -sb
  Write-Host "`nCommit or stash before push. Aborting." -ForegroundColor Red
  exit 1
}

git fetch origin
$upstream = git rev-parse --abbrev-ref "@{u}" 2>$null
if (-not $upstream) {
  Write-Host "No upstream. Push with: git push -u origin $branch"
  exit 0
}

$ahead = git rev-list --count "@{u}..HEAD"
if ([int]$ahead -gt 0) {
  Write-Host "Pushing $ahead commit(s) to origin/$branch ..."
  git push origin $branch
  if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: push failed (exit $LASTEXITCODE). Work is NOT on GitHub. Do NOT switch machines." -ForegroundColor Red
    exit 1
  }
  Write-Host "Push succeeded." -ForegroundColor Green
} else {
  Write-Host "Already in sync with origin/$branch" -ForegroundColor Green
}

Write-Host "Safe to switch machines." -ForegroundColor Green
