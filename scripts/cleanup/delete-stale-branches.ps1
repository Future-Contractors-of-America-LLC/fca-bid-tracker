#!/usr/bin/env pwsh

# Delete stale branches - run with: pwsh scripts/cleanup/delete-stale-branches.ps1

$staleBranches = @(
    'auricrux/audit-deeplink-target',
    'auricrux/audit-persistence-authority-alignment',
    'auricrux/auth-boundary-alignment',
    'auricrux/auto-cycle',
    'auricrux/auto-maintenance',
    'auricrux/auto-update',
    'auricrux/briefing-artifact-persistence',
    'auricrux/briefing-deeplink-consolidated',
    'auricrux/briefing-spine',
    'auricrux/cc-execution-baseline',
    'auricrux/complete-spine-single-release-packet-047',
    'auricrux/coverage-matrix-enforcement',
    'auricrux/delete-swa-orange-coast-workflow',
    'auricrux/deploy-lane-swa-investigation',
    'auricrux/executive',
    'auricrux/fca-academy-lms-shell',
    'auricrux/fca-coverage-matrix',
    'auricrux/file-briefing-actions',
    'auricrux/file-briefing-detail-target',
    'auricrux/file-persistence-authority-alignment',
    'auricrux/file-target-highlight',
    'auricrux/fix-061z-two-failures',
    'auricrux/fix-autonomous-workflow',
    'auricrux/fix-build-system-and-qualification-packet',
    'auricrux/fix-delightful-mushroom-workflow',
    'auricrux/fix-executive-workflow',
    'auricrux/fix-executive-workflow-v2',
    'auricrux/fix-remaining-workflows-executive',
    'auricrux/fix-swa-delightful-mushroom',
    'auricrux/fix-swa-workflow-connection'
)

Write-Host "🗑️  Deleting $($staleBranches.Count) stale branches..." -ForegroundColor Yellow

$deleted = 0
$failed = @()

foreach ($branch in $staleBranches) {
    $result = git push origin --delete $branch 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deleted: $branch" -ForegroundColor Green
        $deleted++
    } else {
        Write-Host "❌ Failed: $branch" -ForegroundColor Red
        if ($result) {
            Write-Host "   $result" -ForegroundColor DarkGray
        }
        $failed += $branch
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Deleted: $deleted/$($staleBranches.Count)" -ForegroundColor Green

if ($failed.Count -gt 0) {
    Write-Host "  Failed: $($failed.Count)" -ForegroundColor Red
    Write-Host "  Branches: $($failed -join ', ')" -ForegroundColor Red
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
