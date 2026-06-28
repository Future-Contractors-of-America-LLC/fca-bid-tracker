#!/usr/bin/env pwsh
# One-time FCA academy media: Azure Blob container + optional Porkbun CNAME + GitHub CI vars.
param(
  [string]$ResourceGroup = "Auricrux_group",
  [string]$StorageAccount = "auricruxartifacts10046",
  [string]$Container = "fca-academy-media",
  [string]$MediaSubdomain = "media.futurecontractorsofamerica.com",
  [string]$GitHubRepo = "Future-Contractors-of-America-LLC/fca-bid-tracker",
  [string]$PorkbunApiKey = $env:PORKBUN_API_KEY,
  [string]$PorkbunSecretKey = $env:PORKBUN_SECRET_API_KEY
)

$ErrorActionPreference = "Stop"
$blobHost = "$StorageAccount.blob.core.windows.net"
$blobCdnBase = "https://$blobHost/$Container"
$mediaCdnBase = "https://$MediaSubdomain/$Container"

Write-Host "=== FCA Academy Media Infrastructure ===" -ForegroundColor Cyan
Write-Host "Storage account: $StorageAccount"
Write-Host "Container: $Container"
Write-Host "Blob CDN (immediate): $blobCdnBase"
Write-Host "Media CDN (after DNS): $mediaCdnBase"

Write-Host "`n[1/5] Enable blob public access on storage account..." -ForegroundColor Yellow
az storage account update `
  --resource-group $ResourceGroup `
  --name $StorageAccount `
  --allow-blob-public-access true `
  -o none

Write-Host "[2/5] Create public-read blob container..." -ForegroundColor Yellow
$conn = az storage account show-connection-string `
  --resource-group $ResourceGroup `
  --name $StorageAccount `
  --query connectionString `
  -o tsv

az storage container create `
  --name $Container `
  --connection-string $conn `
  --public-access blob `
  -o json

Write-Host "[3/5] Set GitHub secret FCA_BLOB_STORAGE_CONNECTION..." -ForegroundColor Yellow
$conn | gh secret set FCA_BLOB_STORAGE_CONNECTION --repo $GitHubRepo

Write-Host "[4/5] Porkbun DNS CNAME for $MediaSubdomain -> $blobHost ..." -ForegroundColor Yellow
$dnsReady = $false
if ($PorkbunApiKey -and $PorkbunSecretKey) {
  $body = @{
    secretapikey = $PorkbunSecretKey
    apikey       = $PorkbunApiKey
    name         = "media"
    type         = "CNAME"
    content      = $blobHost
    ttl          = "600"
  } | ConvertTo-Json
  try {
    $resp = Invoke-RestMethod `
      -Uri "https://api.porkbun.com/api/json/v3/dns/create/futurecontractorsofamerica.com" `
      -Method Post `
      -ContentType "application/json" `
      -Body $body
    if ($resp.status -eq "SUCCESS") {
      Write-Host "Porkbun CNAME created." -ForegroundColor Green
      $dnsReady = $true
    } else {
      Write-Warning "Porkbun response: $($resp | ConvertTo-Json -Compress)"
    }
  } catch {
    Write-Warning "Porkbun API failed: $($_.Exception.Message)"
  }
} else {
  Write-Host "Set PORKBUN_API_KEY and PORKBUN_SECRET_API_KEY to auto-create DNS, or add manually:" -ForegroundColor Yellow
  Write-Host "  Type: CNAME | Host: media | Answer: $blobHost | TTL: 600"
}

if (-not $dnsReady) {
  try {
    $resolved = [System.Net.Dns]::GetHostEntry($MediaSubdomain)
    if ($resolved.HostName -like "*$StorageAccount*" -or $resolved.HostName -like "*blob*") {
      $dnsReady = $true
      Write-Host "DNS already resolves for $MediaSubdomain" -ForegroundColor Green
    }
  } catch {
    Write-Host "DNS not ready yet for $MediaSubdomain" -ForegroundColor DarkYellow
  }
}

if ($dnsReady) {
  Write-Host "[5/5] Bind custom domain on Azure Blob + set media CDN variable..." -ForegroundColor Yellow
  az storage account blob-service-properties update `
    --account-name $StorageAccount `
    --resource-group $ResourceGroup `
    --custom-domain-name $MediaSubdomain `
    -o none
  gh variable set FCA_ACADEMY_MEDIA_CDN_BASE --repo $GitHubRepo --body $mediaCdnBase
  Write-Host "GitHub variable FCA_ACADEMY_MEDIA_CDN_BASE = $mediaCdnBase" -ForegroundColor Green
} else {
  Write-Host "[5/5] Set blob CDN variable until media subdomain DNS propagates..." -ForegroundColor Yellow
  gh variable set FCA_ACADEMY_MEDIA_CDN_BASE --repo $GitHubRepo --body $blobCdnBase
  Write-Host "GitHub variable FCA_ACADEMY_MEDIA_CDN_BASE = $blobCdnBase" -ForegroundColor Green
  Write-Host "Re-run this script after adding Porkbun CNAME to switch to $mediaCdnBase" -ForegroundColor Yellow
}

Write-Host "`nDone. Next: push to main or run SWA workflow to upload academy media and slim deploy." -ForegroundColor Cyan
