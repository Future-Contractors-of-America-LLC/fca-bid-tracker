# CHPS Compliance Sprint — Primary Machine Quickstart

This file is in the repo so it syncs to your Primary machine automatically.

## Step 1: Pull latest
```powershell
cd C:\Users\Michael_Bartholomew\Projects\fca-bid-tracker
git pull origin main
```

## Step 2: Run PR cleanup first (clears the backlog)
```powershell
powershell -ExecutionPolicy Bypass -File scripts\machine-sync\pr-cleanup-run.ps1
```
This will close ~70 stale PRs, merge #164, #167, #169, #162, #59, #38, #27, #31, #139, #170.

## Step 3: Review CHPS compliance docs
All docs are in `docs/legal/`:
- `FCA_CHPS_DATA_PRIVACY_AGREEMENT.md` — DPA to send to CHPS IT Director for signature
- `FCA_CHPS_COMPLIANCE_CHECKLIST.md` — Full compliance status matrix
- `FCA_CHPS_AUTH_REQUIREMENTS.md` — Technical requirements for auth hardening

## Step 4: Kick off auth hardening agent
From Primary, run:
```powershell
gh workflow run copilot-setup-steps.yml --repo Future-Contractors-of-America-LLC/fca-bid-tracker
```
Or assign Copilot to issue #CHPS-AUTH in GitHub UI.

## Step 5: Share committee review URL
Once auth hardening is deployed:
```
https://futurecontractorsofamerica.com/academy
```
Also prepare the GitHub PR link for code review:
```
https://github.com/Future-Contractors-of-America-LLC/fca-bid-tracker/pulls
```

## Open Items Before CHPS Committee Meeting
- [ ] Auth hardening sprint complete (`chps/auth-hardening` merged)
- [ ] 80 student accounts provisioned (`chps/student-accounts` merged)
- [ ] `/privacy` and `/terms` pages updated with COPPA/FERPA disclosures
- [ ] DPA signed by CHPS IT Director
- [ ] Live site deployed and verified at `https://futurecontractorsofamerica.com/academy`
- [ ] Committee review URL shared
