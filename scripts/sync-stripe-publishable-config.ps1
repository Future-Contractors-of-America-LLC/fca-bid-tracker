# Resolve Stripe publishable key for the catalog account and store in local Stripe CLI config.
# Uses the public payment-link page (publishable keys are client-side by design).
# Does not print key values.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\sync-stripe-publishable-config.ps1

$ErrorActionPreference = "Stop"

$cfgPath = Join-Path $env:USERPROFILE ".config\stripe\config.toml"
$catalogPath = Join-Path $PSScriptRoot "..\public\config\stripe-catalog.json"

if (-not (Test-Path $cfgPath)) {
  throw "Stripe config not found: $cfgPath (run stripe login first)"
}
if (-not (Test-Path $catalogPath)) {
  throw "Catalog not found: $catalogPath"
}

$catalog = Get-Content $catalogPath -Raw | ConvertFrom-Json
$mode = if ($catalog.mode -eq "live") { "live" } else { "test" }
$paymentLink = $catalog.workspace.startup.paymentLinkUrl
if (-not $paymentLink) {
  throw "No startup payment link found in stripe catalog."
}

$raw = Get-Content $cfgPath -Raw
$field = if ($mode -eq "test") { "test_mode_pub_key" } else { "live_mode_pub_key" }
if ($raw -match "${field}\s*=\s*`"(pk_[^`"]+)`"") {
  Write-Host "Stripe config already has $field."
  exit 0
}

$response = Invoke-WebRequest -Uri $paymentLink -UseBasicParsing
$pattern = if ($mode -eq "test") { "pk_test_[A-Za-z0-9]+" } else { "pk_live_[A-Za-z0-9]+" }
if ($response.Content -notmatch $pattern) {
  throw "Could not resolve publishable key from payment link page."
}
$publishable = $Matches[0]

if ($raw -match "${field}\s*=") {
  $raw = $raw -replace "${field}\s*=\s*`"[^`"]+`"", "${field} = `"$publishable`""
} else {
  $raw = $raw.TrimEnd() + "`n${field} = `"$publishable`"`n"
}

Set-Content -Path $cfgPath -Value $raw -NoNewline
Write-Host "Stored $field in Stripe CLI config from catalog payment link."
