# FCA Packet 062I — Stacked Run Observation Gate

## Issue
`062A` through `062H` have expanded repo truth faster than observed run truth. The stack now contains stronger package-route alignment, stronger functional depth, and a dedicated governance workflow, but those improvements still outrank no unresolved deployment-proof class until actual runs are observed.

## Risk
- stacked packet depth could be mistaken for merged and observed truth
- governance-lane existence could be mistaken for governance-lane success
- build-validation wiring could be mistaken for current-stack run success
- further expansion could continue while the stack still lacks locked observed run truth

## Fix
062I converts the stack into an explicit observation gate:

1. lock exact workflow lanes that matter for this stack
2. distinguish repo-wired, stack-head observed, main observed, and live deployment observed
3. record current observed truth without exaggeration
4. require merge-and-observe before further packet expansion

## Required workflow lanes
- `.github/workflows/build-validation.yml`
- `.github/workflows/alignment-proof-governance.yml`
- `.github/workflows/azure-static-web-apps-delightful-mushroom-0de67860f.yml`
- `.github/workflows/runtime-smoke-validation.yml`
- `.github/workflows/live-deployment-proof-stamp.yml`
- `.github/workflows/live-deployment-run-witness.yml`

## Truth classes
- `repo-wired`
- `stack-head observed`
- `main observed`
- `live deployment observed`

## Rule
No `062*` packet may be treated as reducing the unresolved `061Z` blocker set unless the relevant workflow lane has moved beyond repo-wired into observed run truth.

## Result
Further slice expansion is now subordinate to observed run truth.

## Next build step
062J should record the first exact stacked observation matrix and explicitly state which lanes remain only repo-wired versus actually observed.