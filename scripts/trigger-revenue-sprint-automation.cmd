@echo off
REM Trigger revenue sprint GitHub Actions (requires gh CLI authenticated)
set GH="C:\Program Files\GitHub CLI\gh.exe"

echo Triggering SWA emergency deploy...
%GH% workflow run swa-emergency-direct-deploy.yml --repo Future-Contractors-of-America-LLC/fca-bid-tracker --ref main

echo Triggering control-plane engine mode...
%GH% workflow run auricrux-control-plane.yml --repo Future-Contractors-of-America-LLC/fca-bid-tracker --ref main -f mode=engine

echo Done. Check GitHub Actions for run status.
