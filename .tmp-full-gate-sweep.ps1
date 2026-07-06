$ErrorActionPreference = 'Continue'
$gates = @(
  'qc:product',
  'qc:saas',
  'qc:lms',
  'qc:market',
  'qc:ecosystem:leaders',
  'validate:fca-total-integrity',
  'validate:enterprise-parity',
  'validate:phase4-ecosystem',
  'validate:phase3-zero-trust-audit',
  'validate:system-security-hardening',
  'validate:finance-ops-readiness',
  'validate:managed-auth-commercial-runtime',
  'validate:execution-context-propagation',
  'validate:matrix-shell-connector-parity',
  'validate:nonlms-contract-envelope',
  'validate:project-event-contracts',
  'validate:product-surfaces',
  'validate:routes',
  'validate:public-package-route-groups',
  'validate:public-conversion-surface-route-truth',
  'validate:ux-language-quality',
  'validate:runtime-smoke',
  'validate:runtime-proof-integrity',
  'validate:auricrux-live-campaign-readiness:strict'
)

$results = @()
foreach ($gate in $gates) {
  Write-Host "`n=== RUN $gate ==="
  npm run $gate
  $code = $LASTEXITCODE
  $status = if ($code -eq 0) { 'PASS' } else { 'FAIL' }
  $results += [PSCustomObject]@{ gate = $gate; status = $status; exitCode = $code }
  Write-Host "=== $status ($code): $gate ==="
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outFile = "docs/qc/full-ecosystem-gate-sweep-$timestamp.json"
$results | ConvertTo-Json -Depth 3 | Set-Content -Encoding UTF8 $outFile

Write-Host "`n===== GATE SWEEP SUMMARY ====="
$results | Format-Table -AutoSize
Write-Host "Saved summary: $outFile"

if (($results | Where-Object { $_.status -eq 'FAIL' }).Count -gt 0) {
  exit 2
}
exit 0
