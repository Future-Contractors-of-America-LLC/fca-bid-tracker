# SWA Deploy Failure Triage

## Classification
Deployment-lane triage artifact

## Branch
`auricrux/deploy-lane-swa-investigation`

## Blocking Check
`Build, Deploy, and Smoke Verify Job`

## Confirmed Repo Truth
- Workflow file: `.github/workflows/azure-static-web-apps-delightful-mushroom-0de67860f.yml`
- Build validation runs before deploy.
- `verify:live-deployment` currently maps to `node no-op.js`, so the current known failure is less likely to be the smoke command itself.
- PR #55 auth/tenant hardening branch does not alter this workflow, `build.sh`, or the smoke command target.

## Most Likely Failure Zone
The highest-probability failing zone is the `Build And Deploy` step:
- `Azure/static-web-apps-deploy@v1`
- target token / target app continuity
- SWA environment or deploy target drift
- API packaging assumptions inside deploy action

## Lower-Probability Zones
- `Assert SWA deployment target configuration` (only if secret missing)
- `Verify build artifact exists` (would imply payload drift, but current issue framing suggests deploy-lane failure)
- `Post-deploy live domain smoke verification` (currently no-op target)

## Immediate Review Sequence
1. Open the failed workflow run for PR #55.
2. Confirm which exact step failed:
   - Assert SWA deployment target configuration
   - Install dependencies
   - Run governed build validation
   - Verify build artifact exists
   - Build And Deploy
   - Post-deploy live domain smoke verification
3. If `Build And Deploy` failed, capture whether failure was:
   - invalid or expired SWA token
   - wrong SWA target
   - API packaging/deploy mismatch
   - Azure-side deployment service error
4. Do not mix route hardening remediation into this lane unless the workflow log directly proves a payload break introduced by route changes.

## Recommended Smallest Safe Remediation Target
If the failure is confirmed at `Build And Deploy`, patch only the SWA workflow lane first:
- improve step-level diagnostics
- preserve current product branch separation
- avoid editing PR #55 auth/tenant hardening files

## Truth Boundary
This artifact does not prove the failing step yet.
It narrows the likely failure domain using current repo truth only.
