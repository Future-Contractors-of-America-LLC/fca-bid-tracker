# Runs the FCA Academy LMS repair loop continuously on this machine.
# Machine-scoped receipts: auricrux/system/testing/machines/{hostname}/

param(
  [int]$IntervalMinutes = 30
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$MachineId = $env:COMPUTERNAME
$MachineDir = Join-Path $Root "auricrux\system\testing\machines\$MachineId"
New-Item -ItemType Directory -Force -Path $MachineDir | Out-Null

Write-Host "FCA Academy LMS continuous repair loop"
Write-Host "Root: $Root"
Write-Host "Machine: $MachineId"
Write-Host "Interval: $IntervalMinutes minutes"
Write-Host ""

Set-Location $Root

while ($true) {
  $stamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
  Write-Host "=== LMS repair loop cycle at $stamp ==="

  npm run sim:lms:loop
  $exitCode = $LASTEXITCODE

  $receiptSrc = Join-Path $Root "auricrux\system\lms_repair_receipt.json"
  if (Test-Path $receiptSrc) {
    $dest = Join-Path $MachineDir "lms-repair-receipt-$stamp.json"
    Copy-Item $receiptSrc $dest -Force
  }

  if ($exitCode -eq 0) {
    Write-Host "Cycle green. Sleeping $IntervalMinutes minutes..."
  } else {
    Write-Host "Cycle red (exit $exitCode). Sleeping $IntervalMinutes minutes..."
  }

  Start-Sleep -Seconds ($IntervalMinutes * 60)
}
