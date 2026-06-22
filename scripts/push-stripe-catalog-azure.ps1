# Push workspace payment-link URLs from stripe-catalog.json to Azure app settings.
# Does not print or log secret keys. Pass -StripeSecretKey only when rotating/configuring Central.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\push-stripe-catalog-azure.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\push-stripe-catalog-azure.ps1 -FromStripeConfig

param(
  [switch]$FromStripeConfig,
  [string]$CatalogPath = (Join-Path $PSScriptRoot "..\public\config\stripe-catalog.json"),
  [string]$StripeSecretKey = "",
  [string]$StripePublishableKey = "",
  [string]$CentralName = "Auricrux-Central",
  [string]$CentralRg = "Auricrux_group",
  [string]$SwaName = "fca-frontend",
  [string]$SwaRg = "fca-frontend_group"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $CatalogPath)) {
  throw "Catalog not found: $CatalogPath"
}

$catalog = Get-Content $CatalogPath -Raw | ConvertFrom-Json
$planEnv = @{
  "startup" = "STRIPE_STARTUP_PAYMENT_LINK"
  "starter-team" = "STRIPE_STARTER_TEAM_PAYMENT_LINK"
  "pilot" = "STRIPE_PILOT_PAYMENT_LINK"
  "team" = "STRIPE_TEAM_PAYMENT_LINK"
  "operations" = "STRIPE_OPERATIONS_PAYMENT_LINK"
  "growth" = "STRIPE_GROWTH_PAYMENT_LINK"
  "scale" = "STRIPE_SCALE_PAYMENT_LINK"
  "enterprise" = "STRIPE_ENTERPRISE_PAYMENT_LINK"
}

$centralSettings = @()
foreach ($entry in $planEnv.GetEnumerator()) {
  $url = $catalog.workspace.($entry.Key).paymentLinkUrl
  if ($url) {
    $centralSettings += "$($entry.Value)=$url"
  }
}

if ($FromStripeConfig) {
  $cfg = Join-Path $env:USERPROFILE ".config\stripe\config.toml"
  if (Test-Path $cfg) {
    $raw = Get-Content $cfg -Raw
    if ($raw -match 'api_key\s*=\s*"(sk_[^"]+)"') {
      $StripeSecretKey = $Matches[1]
    }
  }
}

if ($StripeSecretKey) {
  $centralSettings += "STRIPE_SECRET_KEY=$StripeSecretKey"
}

if ($centralSettings.Count -eq 0) {
  throw "No workspace payment links found in catalog."
}

Write-Host "Setting $($centralSettings.Count) Stripe settings on $CentralName..."
az functionapp config appsettings set `
  --name $CentralName `
  --resource-group $CentralRg `
  --settings $centralSettings | Out-Null

$startupUrl = $catalog.workspace.startup.paymentLinkUrl
$swaSettings = @()
if ($startupUrl) {
  $swaSettings += "VITE_STRIPE_STARTUP_CHECKOUT_URL=$startupUrl"
}
if ($StripePublishableKey) {
  $swaSettings += "VITE_STRIPE_PUBLISHABLE_KEY=$StripePublishableKey"
}
if ($swaSettings.Count -gt 0) {
  Write-Host "Setting $($swaSettings.Count) Stripe SWA settings on $SwaName..."
  az staticwebapp appsettings set `
    --name $SwaName `
    --resource-group $SwaRg `
    --setting-names $swaSettings | Out-Null
}

Write-Host "Done. Catalog mode: $($catalog.mode) | workspace links: $($catalog.workspace.PSObject.Properties.Count)"
