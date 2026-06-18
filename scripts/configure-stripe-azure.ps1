# Configure Stripe webhook secrets on SWA + Auricrux-Central.
# Usage: .\scripts\configure-stripe-azure.ps1 -StripeSecretKey "sk_live_..." -WebhookSecret "whsec_..."

param(
  [Parameter(Mandatory = $true)][string]$StripeSecretKey,
  [Parameter(Mandatory = $true)][string]$WebhookSecret
)

$ErrorActionPreference = "Stop"

$swaName = "fca-frontend"
$swaRg = "fca-frontend_group"
$centralName = "Auricrux-Central"
$centralRg = "Auricrux_group"

Write-Host "Setting Stripe app settings on SWA ($swaName)..."
az staticwebapp appsettings set `
  --name $swaName `
  --resource-group $swaRg `
  --setting-names `
    STRIPE_SECRET_KEY=$StripeSecretKey `
    STRIPE_WEBHOOK_SECRET=$WebhookSecret

Write-Host "Setting Stripe app settings on Auricrux-Central..."
az functionapp config appsettings set `
  --name $centralName `
  --resource-group $centralRg `
  --settings `
    STRIPE_SECRET_KEY=$StripeSecretKey `
    STRIPE_WEBHOOK_SECRET=$WebhookSecret

Write-Host ""
Write-Host "Stripe webhook endpoints (configure ONE in Stripe Dashboard):"
Write-Host "  Primary:  https://auricrux-central.azurewebsites.net/api/stripe/webhook"
Write-Host "  Fallback: https://futurecontractorsofamerica.com/api/stripe-webhook"
Write-Host ""
Write-Host "Events: checkout.session.completed"
Write-Host "Done."
