$ErrorActionPreference = 'Continue'
$cmds = @(
  @{ name='validate-claim-certainty.mjs'; cmd='node scripts/validate-claim-certainty.mjs' },
  @{ name='validate-auricrux-live-campaign-readiness --require-env'; cmd='node scripts/validate-auricrux-live-campaign-readiness.mjs --require-env' },
  @{ name='validate-azure-live-governance-and-routes'; cmd='npm run validate:azure-live-governance-and-routes' },
  @{ name='test:ecosystem'; cmd='npm run test:ecosystem' },
  @{ name='test:ecosystem:live'; cmd='npm run test:ecosystem:live' }
)
foreach ($c in $cmds) {
  Write-Host "`n===== RUN $($c.name) ====="
  Invoke-Expression $c.cmd
  Write-Host "===== EXIT $LASTEXITCODE :: $($c.name) ====="
}
