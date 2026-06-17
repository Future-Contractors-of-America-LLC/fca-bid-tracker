# FCA Packet 062E — Public Conversion Route-Truth Sweep

## Issue
062D aligned pricing, home, login, and contact to the shared package route-group truth source, but platform and Auricrux still carried cross-system product language without explicitly consuming the same shared route-truth surface.

## Risk
- public conversion surfaces could still drift in the exact place where FCA explains the whole system story
- Platform and Auricrux could sell product depth without showing the same route-backed package truth used elsewhere
- founder explanation burden could rise because high-level entry pages would still require verbal reconciliation

## Fix
062E completes the highest-leverage public conversion sweep:

1. wire `PublicPackageRouteGroupsPanel` into `src/pages/website/Platform.jsx`
2. wire `PublicPackageRouteGroupsPanel` into `src/pages/website/Auricrux.jsx`
3. add `scripts/validate-public-conversion-route-truth.mjs`
4. add `scripts/generate-public-conversion-route-truth-report.mjs`
5. expose the validator/report in `package.json`
6. advance the continuity ledger to truthful `062E` state while preserving unresolved `061Z` deployment truth

## Enforced truth
The highest-leverage public conversion surfaces now use one shared route-group truth source:
- pricing
- home
- login
- contact
- platform
- auricrux

## Truth boundary
This packet does **not** claim 061Z deployment closeout.
It hardens public conversion truth against repo state only.

## Next build step
062F should decide whether any remaining non-conversion public surfaces warrant the same package route-group exposure or whether the public conversion layer is now sufficiently locked and should return focus to 061Z deployment-truth observation.
