# Machine audit - writes JSON report for troubleshooting
$report = @{
    timestamp = (Get-Date -Format o)
    os = [System.Environment]::OSVersion.VersionString
    computerName = $env:COMPUTERNAME
    user = $env:USERNAME
}

function Test-Tool {
    param([string]$Name, [string]$Cmd)
    try {
        $out = Invoke-Expression $Cmd 2>&1 | Out-String
        return @{ name = $Name; ok = $true; output = $out.Trim() }
    } catch {
        return @{ name = $Name; ok = $false; output = $_.Exception.Message }
    }
}

$tools = @(
    @{ n = 'git'; c = 'git --version' }
    @{ n = 'node'; c = 'node --version' }
    @{ n = 'npm'; c = 'npm --version' }
    @{ n = 'pnpm'; c = 'pnpm --version' }
    @{ n = 'python'; c = 'python --version' }
    @{ n = 'py312'; c = 'py -3.12 --version' }
    @{ n = 'dotnet'; c = 'dotnet --version' }
    @{ n = 'docker'; c = 'docker --version' }
    @{ n = 'az'; c = 'az version' }
    @{ n = 'gh'; c = 'gh --version' }
    @{ n = 'stripe'; c = 'stripe --version' }
    @{ n = 'func'; c = 'func --version' }
    @{ n = 'winget'; c = 'winget --version' }
    @{ n = 'wsl'; c = 'wsl --status' }
)

$report.tools = @($tools | ForEach-Object { Test-Tool -Name $_.n -Cmd $_.c })

# Auth checks
$report.ghAuth = (gh auth status 2>&1 | Out-String).Trim()
$report.azAccount = try { (az account show 2>&1 | Out-String).Trim() } catch { 'not logged in' }

# Disk
$disk = Get-PSDrive C -ErrorAction SilentlyContinue
if ($disk) {
    $report.diskFreeGB = [math]::Round($disk.Free / 1GB, 1)
}

# RAM
$report.ramGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 1)

# Git repos
$githubRoot = Join-Path $env:USERPROFILE 'Documents\GitHub'
$report.repos = @()
if (Test-Path $githubRoot) {
    Get-ChildItem $githubRoot -Directory | ForEach-Object {
        $repo = @{ name = $_.Name; path = $_.FullName }
        Push-Location $_.FullName
        if (Test-Path '.git') {
            $repo.branch = (git branch --show-current 2>&1 | Out-String).Trim()
            $repo.status = (git status -sb 2>&1 | Out-String).Trim()
            git fetch origin 2>&1 | Out-Null
            $repo.aheadBehind = (git rev-list --left-right --count HEAD...@{u} 2>&1 | Out-String).Trim()
        }
        Pop-Location
        $report.repos += $repo
    }
}

# OneDrive accounts
$report.oneDrive = @()
$odPath = Join-Path $env:LOCALAPPDATA 'Microsoft\OneDrive\settings\Personal'
if (Test-Path $odPath) {
    $report.oneDrive += @{ type = 'Personal'; path = (Join-Path $env:USERPROFILE 'OneDrive') }
}
$bizPath = Join-Path $env:USERPROFILE 'Future Contractors of America LLC'
if (Test-Path $bizPath) { $report.oneDrive += @{ type = 'Business'; path = $bizPath } }

# Pending reboot
$report.pendingReboot = (Test-Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update\RebootRequired')

# PATH npm global
$report.npmPrefix = (npm config get prefix 2>&1 | Out-String).Trim()

$outFile = Join-Path $PSScriptRoot 'machine-audit-report.json'
$report | ConvertTo-Json -Depth 6 | Set-Content -Path $outFile -Encoding UTF8
Write-Output $outFile
