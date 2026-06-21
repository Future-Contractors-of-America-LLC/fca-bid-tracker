# Provision FCA app + api subdomains on Azure (after DNS records exist).
# Run from fca-bid-tracker-work with Azure CLI logged in.

$ErrorActionPreference = "Stop"

$SwaName = "fca-frontend"
$SwaRg = "fca-frontend_group"
$ApiAppName = "Auricrux-Central"
$ApiRg = "Auricrux_group"
$PrimaryDomain = "futurecontractorsofamerica.com"
$AppHost = "app.$PrimaryDomain"
$ApiHost = "api.$PrimaryDomain"
$SwaDefaultHost = "delightful-mushroom-0de67860f.7.azurestaticapps.net"
$ApiAzureHost = "auricrux-central.azurewebsites.net"

Write-Host "=== FCA subdomain provisioning ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "DNS records required at your registrar (GoDaddy / Cloudflare / etc.):" -ForegroundColor Yellow
Write-Host ""
Write-Host "APP (product SPA on Static Web Apps):"
Write-Host "  CNAME  app  ->  $SwaDefaultHost"
Write-Host "  TXT    asuid.app  ->  _zvyda4m1u9dkxhp7jas5o4gx4n1c7qy"
Write-Host ""
Write-Host "API (Auricrux Central Function App):"
Write-Host "  CNAME  api  ->  $ApiAzureHost"
Write-Host "  TXT    asuid.api  ->  6def6c4bdf9fb9d0605eb5c0ca095da661deb5298e9471b89b3ac9160a9ca9ab"
Write-Host ""

function Show-AppValidationToken {
  az staticwebapp hostname show `
    -n $SwaName `
    -g $SwaRg `
    --hostname $AppHost `
    --query "{status:status, validationToken:validationToken}" `
    -o json
}

Write-Host "Checking app subdomain registration..." -ForegroundColor Cyan
Show-AppValidationToken

Write-Host ""
Write-Host "Registering app subdomain (TXT validation, no-wait)..." -ForegroundColor Cyan
az staticwebapp hostname set `
  -n $SwaName `
  -g $SwaRg `
  --hostname $AppHost `
  --validation-method dns-txt-token `
  --no-wait

Start-Sleep -Seconds 5
Write-Host "App validation token (add as TXT asuid.app):" -ForegroundColor Green
Show-AppValidationToken

Write-Host ""
Write-Host "Registering api subdomain on Function App..." -ForegroundColor Cyan
az webapp config hostname add `
  --webapp-name $ApiAppName `
  --resource-group $ApiRg `
  --hostname $ApiHost

Write-Host ""
Write-Host "Enable managed certificates after DNS propagates:" -ForegroundColor Yellow
Write-Host "  az webapp config ssl bind -g $ApiRg -n $ApiAppName --certificate-thumbprint <thumbprint> -s SniEnabled"
Write-Host "  Azure Portal -> Static Web App -> Custom domains -> Validate app.$PrimaryDomain"
Write-Host ""
Write-Host "Verify when live:"
Write-Host "  curl https://$ApiHost/api/health"
Write-Host "  curl -I https://$AppHost/portal/platform"
