@echo off
REM Configures Azure Table persistence for fca-frontend Static Web App API.
REM Uses existing storage in Auricrux_group ù run once after clone.

set STORAGE_ACCOUNT=auricruxartifacts10046
set RESOURCE_GROUP=Auricrux_group
set SWA_NAME=fca-frontend
set SWA_RG=fca-frontend_group

for /f "delims=" %%i in ('az storage account show-connection-string --name %STORAGE_ACCOUNT% --resource-group %RESOURCE_GROUP% --query connectionString -o tsv') do set CONN=%%i

if "%CONN%"=="" (
  echo Failed to resolve storage connection string.
  exit /b 1
)

az staticwebapp appsettings set --name %SWA_NAME% --resource-group %SWA_RG% --setting-names FCA_TABLE_STORAGE_CONNECTION="%CONN%"
echo FCA_TABLE_STORAGE_CONNECTION configured on %SWA_NAME%
