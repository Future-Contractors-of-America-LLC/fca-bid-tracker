# Provision FCA app + api subdomains on Azure (after DNS records exist at Porkbun/registrar).
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
Write-Host "DNS records required at registrar:" -ForegroundColor Yellow
Write-Host "APP:  CNAME app -> $SwaDefaultHost"
Write-Host "API:  CNAME api -> $ApiAzureHost"
Write-Host "API:  TXT asuid.api -> 6def6c4bdf9fb9d0605eb5c0ca095da661deb5298e9471b89b3ac9160a9ca9ab"
Write-Host ""

Write-Host "Registering app subdomain (CNAME validation)..." -ForegroundColor Cyan
az staticwebapp hostname set `
  -n $SwaName `
  -g $SwaRg `
  --hostname $AppHost `
  --validation-method cname-delegation `
  --no-wait

Write-Host "Registering api subdomain on Function App..." -ForegroundColor Cyan
az webapp config hostname add `
  --webapp-name $ApiAppName `
  --resource-group $ApiRg `
  --hostname $ApiHost

Write-Host "Creating managed SSL certificate for api..." -ForegroundColor Cyan
az webapp config ssl create -g $ApiRg -n $ApiAppName --hostname $ApiHost | Out-Null

$thumbprint = az webapp config ssl show -g $ApiRg --certificate-name $ApiHost --query thumbprint -o tsv
if ($thumbprint) {
  Write-Host "Binding SSL for $ApiHost..." -ForegroundColor Cyan
  az webapp config ssl bind -g $ApiRg -n $ApiAppName --certificate-thumbprint $thumbprint --ssl-type SNI --hostname $ApiHost | Out-Null
}

Write-Host "Adding app origin to API CORS..." -ForegroundColor Cyan
az functionapp cors add -g $ApiRg -n $ApiAppName --allowed-origins "https://$AppHost" | Out-Null

Write-Host ""
Write-Host "Current status:" -ForegroundColor Green
az staticwebapp hostname show -n $SwaName -g $SwaRg --hostname $AppHost --query "{app:domainName, status:status}" -o json
az webapp config hostname list --webapp-name $ApiAppName --resource-group $ApiRg --query "[?name=='$ApiHost'].{api:name, type:hostNameType}" -o json

Write-Host ""
Write-Host "Verify when live:"
Write-Host "  curl https://$ApiHost/api/health"
Write-Host "  curl -I https://$AppHost/portal/platform"
