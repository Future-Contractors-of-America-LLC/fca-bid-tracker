param(
  [string]$Org = "Future-Contractors-of-America-LLC",
  [string[]]$Repos = @("auricrux-central", "fca-bid-tracker")
)

Write-Host "Auricrux CI secret bootstrap"
Write-Host "Requires: gh CLI authenticated with org admin access"
Write-Host ""

$status = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Error "gh auth status failed. Run 'gh auth login' first."
  exit 1
}

$token = Read-Host "Paste classic PAT with repo scope (input hidden)" -AsSecureString
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
)

if (-not $plain) {
  Write-Error "Token is required."
  exit 1
}

$repoList = ($Repos | ForEach-Object { "$Org/$_" }) -join ","
Write-Host "Setting org secret on: $repoList"

$plain | gh secret set AURICRUX_GITHUB_TOKEN --org $Org --visibility selected --repos ($Repos -join ",")

Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Authorize the PAT for SSO on the org if prompted."
Write-Host "2. Enable 'Allow GitHub Actions to create and approve pull requests' on both repos."
Write-Host "3. Run: bash scripts/ci/verify-auricrux-token.sh (with token exported locally to test)."
