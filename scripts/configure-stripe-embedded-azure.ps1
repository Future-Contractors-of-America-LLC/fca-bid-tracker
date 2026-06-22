# Configure Azure for embedded Stripe checkout (SWA API + client keys).
# Reads Stripe test/live secret from ~/.config/stripe/config.toml when -FromStripeConfig is set.
# Does not print secret or publishable key values.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\configure-stripe-embedded-azure.ps1 -FromStripeConfig
#   powershell -ExecutionPolicy Bypass -File scripts\configure-stripe-embedded-azure.ps1 -FromStripeConfig -Mode test

param(
  [switch]$FromStripeConfig,
  [ValidateSet("test", "live", "auto")]
  [string]$Mode = "auto",
  [string]$StripeSecretKey = "",
  [string]$StripePublishableKey = "",
  [string]$SwaName = "fca-frontend",
  [string]$SwaRg = "fca-frontend_group",
  [string]$CentralName = "Auricrux-Central",
  [string]$CentralRg = "Auricrux_group"
)

$ErrorActionPreference = "Stop"

function Read-StripeConfigKeys {
  param([string]$PreferredMode = "auto")

  $cfgPath = Join-Path $env:USERPROFILE ".config\stripe\config.toml"
  if (-not (Test-Path $cfgPath)) {
    return @{ SecretKey = ""; PublishableKey = "" }
  }

  $raw = Get-Content $cfgPath -Raw
  $secret = ""
  $publishable = ""

  if ($PreferredMode -eq "live" -and $raw -match 'live_mode_api_key\s*=\s*"(sk_[^"]+)"') {
    $secret = $Matches[1]
  } elseif ($PreferredMode -eq "test" -and $raw -match 'test_mode_api_key\s*=\s*"(sk_[^"]+)"') {
    $secret = $Matches[1]
  } else {
    if ($raw -match 'test_mode_api_key\s*=\s*"(sk_[^"]+)"') {
      $secret = $Matches[1]
    } elseif ($raw -match 'api_key\s*=\s*"(sk_[^"]+)"') {
      $secret = $Matches[1]
    } elseif ($raw -match 'live_mode_api_key\s*=\s*"(sk_[^"]+)"') {
      $secret = $Matches[1]
    }
  }

  if ($raw -match 'test_mode_pub_key\s*=\s*"(pk_[^"]+)"') {
    $publishable = $Matches[1]
  } elseif ($raw -match 'live_mode_pub_key\s*=\s*"(pk_[^"]+)"') {
    $publishable = $Matches[1]
  } elseif ($raw -match 'publishable_key\s*=\s*"(pk_[^"]+)"') {
    $publishable = $Matches[1]
  }

  return @{ SecretKey = $secret; PublishableKey = $publishable }
}

function Resolve-StripePublishableKey {
  param(
    [string]$SecretKey,
    [string]$KnownPublishableKey
  )

  if ($KnownPublishableKey) {
    return $KnownPublishableKey
  }
  if (-not $SecretKey) {
    return ""
  }

  $mode = if ($SecretKey -match '^sk_test_') { "test" } elseif ($SecretKey -match '^sk_live_') { "live" } else { "" }
  if (-not $mode) {
    return ""
  }

  try {
    $headers = @{ Authorization = "Bearer $SecretKey" }
    $account = Invoke-RestMethod -Method Get -Uri "https://api.stripe.com/v1/account" -Headers $headers
    if ($account.settings -and $account.settings.dashboard -and $account.settings.dashboard.display_name) {
      # Account reachable; publishable key still comes from dashboard/config.
    }
  } catch {
    throw "Stripe secret key validation failed. Confirm Stripe CLI login and key mode."
  }

  $swaJson = az staticwebapp appsettings list --name $SwaName --resource-group $SwaRg -o json 2>$null
  if ($swaJson) {
    $swa = $swaJson | ConvertFrom-Json
    $candidates = @(
      $swa.properties.STRIPE_PUBLISHABLE_KEY,
      $swa.properties.VITE_STRIPE_PUBLISHABLE_KEY
    ) | Where-Object { $_ }

    foreach ($candidate in $candidates) {
      if ($mode -eq "test" -and $candidate -like "pk_test_*") { return $candidate }
      if ($mode -eq "live" -and $candidate -like "pk_live_*") { return $candidate }
    }
  }

  return ""
}

if ($FromStripeConfig) {
  $cfgKeys = Read-StripeConfigKeys -PreferredMode $Mode
  if (-not $StripeSecretKey) { $StripeSecretKey = $cfgKeys.SecretKey }
  if (-not $StripePublishableKey) { $StripePublishableKey = $cfgKeys.PublishableKey }
}

if (-not $StripeSecretKey) {
  throw "Stripe secret key is required. Pass -StripeSecretKey or use -FromStripeConfig."
}

$StripePublishableKey = Resolve-StripePublishableKey -SecretKey $StripeSecretKey -KnownPublishableKey $StripePublishableKey
if (-not $StripePublishableKey) {
  throw @"
Could not resolve a matching Stripe publishable key for the configured secret key mode.
Add test_mode_pub_key or live_mode_pub_key to $env:USERPROFILE\.config\stripe\config.toml, or pass -StripePublishableKey.
"@
}

$swaSettings = @(
  "STRIPE_SECRET_KEY=$StripeSecretKey",
  "STRIPE_PUBLISHABLE_KEY=$StripePublishableKey",
  "VITE_STRIPE_PUBLISHABLE_KEY=$StripePublishableKey"
)

Write-Host "Setting embedded Stripe settings on SWA ($SwaName)..."
az staticwebapp appsettings set `
  --name $SwaName `
  --resource-group $SwaRg `
  --setting-names $swaSettings | Out-Null

Write-Host "Ensuring Auricrux-Central has STRIPE_SECRET_KEY..."
az functionapp config appsettings set `
  --name $CentralName `
  --resource-group $CentralRg `
  --settings "STRIPE_SECRET_KEY=$StripeSecretKey" | Out-Null

Write-Host "Done. Embedded checkout Azure settings applied (values not logged)."
