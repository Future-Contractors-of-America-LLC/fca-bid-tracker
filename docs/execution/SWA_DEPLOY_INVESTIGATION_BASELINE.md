# SWA Deploy Investigation Baseline

## Classification
Deployment-lane investigation artifact

## Branch
`auricrux/deploy-lane-swa-investigation`

## Trigger
PR #55 is blocked by a failing check run:
- `Build, Deploy, and Smoke Verify Job` -> failure

## Confirmed Repo Truth
- Auth/tenant hardening work is tracked separately on PR #55.
- That PR does **not** modify:
  - `.github/workflows/azure-static-web-apps-delightful-mushroom-0de67860f.yml`
  - `build.sh`
  - `package.json` live verification target (`verify:live-deployment` still maps to `node no-op.js`)
- Validation checks passed while deploy/smoke failed.

## Current Likely Failure Domain
The current blocker is more likely in the Azure Static Web Apps deployment path itself:
- target app/token continuity
- deploy action behavior
- environment or host drift
- workflow assumptions around deploy verification

## Investigation Focus
1. Inspect `azure-static-web-apps-delightful-mushroom-0de67860f.yml`
2. Isolate the smallest failing step inside `Build, Deploy, and Smoke Verify Job`
3. Avoid mixing deployment-lane remediation into PR #55 unless directly proven necessary
4. Preserve truth boundary between product-route hardening and deployment remediation

## Immediate Next Step
Prepare the smallest safe workflow-focused remediation artifact only after confirming the failing step and whether the issue is pre-existing drift versus workflow misconfiguration.
