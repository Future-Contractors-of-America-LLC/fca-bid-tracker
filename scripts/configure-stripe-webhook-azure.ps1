# Ensure Stripe webhook endpoint exists for Auricrux-Central and store signing secret in Azure.
# Does not print secret values.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\configure-stripe-webhook-azure.ps1 -FromStripeConfig

param(
  [switch]$FromStripeConfig,
  [string]$StripeSecretKey = "",
  [string]$WebhookUrl = "https://auricrux-central.azurewebsites.net/api/stripe/webhook",
  [string]$CentralName = "Auricrux-Central",
  [string]$CentralRg = "Auricrux_group",
  [string]$SwaName = "fca-frontend",
  [string]$SwaRg = "fca-frontend_group"
)

$ErrorActionPreference = "Stop"

if ($FromStripeConfig) {
  $cfgPath = Join-Path $env:USERPROFILE ".config\stripe\config.toml"
  if (Test-Path $cfgPath) {
    $raw = Get-Content $cfgPath -Raw
    if ($raw -match 'test_mode_api_key\s*=\s*"(sk_[^"]+)"') {
      $StripeSecretKey = $Matches[1]
    } elseif ($raw -match 'api_key\s*=\s*"(sk_[^"]+)"') {
      $StripeSecretKey = $Matches[1]
    }
  }
}

if (-not $StripeSecretKey) {
  throw "Stripe secret key required. Use -FromStripeConfig or pass -StripeSecretKey."
}

$headers = @{ Authorization = "Bearer $StripeSecretKey" }
$events = @(
  "checkout.session.completed",
  "invoice.paid",
  "customer.subscription.created",
  "customer.subscription.updated"
)

$list = Invoke-RestMethod -Method Get -Uri "https://api.stripe.com/v1/webhook_endpoints?limit=100" -Headers $headers
$existing = $list.data | Where-Object { $_.url -eq $WebhookUrl } | Select-Object -First 1

$centralSettings = az functionapp config appsettings list --name $CentralName --resource-group $CentralRg -o json | ConvertFrom-Json
$existingSecret = ($centralSettings | Where-Object { $_.name -eq "STRIPE_WEBHOOK_SECRET" }).value

if ($existingSecret) {
  Write-Host "Reusing existing STRIPE_WEBHOOK_SECRET from Azure ($CentralName)."
  $secret = $existingSecret
} elseif ($existing) {
  throw "Webhook endpoint exists in Stripe but signing secret is not stored in Azure. Recreate the endpoint in Stripe Dashboard and pass -WebhookSecret, or delete the endpoint and rerun."
} else {
  $body = @{
    url = $WebhookUrl
    "enabled_events[0]" = $events[0]
    "enabled_events[1]" = $events[1]
    "enabled_events[2]" = $events[2]
    "enabled_events[3]" = $events[3]
  }
  $created = Invoke-RestMethod -Method Post -Uri "https://api.stripe.com/v1/webhook_endpoints" -Headers $headers -Body $body
  $secret = $created.secret
  if (-not $secret) {
    throw "Stripe webhook signing secret unavailable after endpoint creation."
  }
  Write-Host "Created Stripe webhook endpoint for $WebhookUrl"
}

Write-Host "Setting STRIPE_WEBHOOK_SECRET on $CentralName and $SwaName..."
az functionapp config appsettings set `
  --name $CentralName `
  --resource-group $CentralRg `
  --settings "STRIPE_WEBHOOK_SECRET=$secret" | Out-Null

az staticwebapp appsettings set `
  --name $SwaName `
  --resource-group $SwaRg `
  --setting-names "STRIPE_WEBHOOK_SECRET=$secret" | Out-Null

Write-Host "Stripe webhook Azure configuration complete."
