# FCA_PACKET_060X_RUNTIME_SMOKE_AND_CI_PROOF_REPAIR

Status: Active
Classification: Runtime smoke and CI proof repair
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `060X`
Next Packet: `060Y`
Target Packet: `060Z`

---

## Objective
Attack the next remaining blocker by closing the repo-truth gap between workflow intent and workflow-executable proof generation.

## Blockers found in repo truth
1. `.github/workflows/runtime-smoke-validation.yml` invoked `npm run capture:ci-proof-index`, but `package.json` did not expose that script.
2. `scripts/ci_proof_index.js` still hardcoded packet `060F`.
3. `scripts/runtime_smoke_check.js` still hardcoded packet `055A`.
4. The latest persisted runtime-smoke proof directory lacked both `runtime-smoke-check-report.*` and `ci-proof-index.*`, which is consistent with workflow/script drift rather than a complete proof lane.

## Root cause
The runtime-smoke proof lane had only been partially updated during earlier packet work. Build-evidence packet drift was fixed in `060W`, but sibling proof generators still carried stale packet constants and one workflow dependency was missing from package script wiring.

## Fix executed
1. Added `capture:ci-proof-index` to `package.json`.
2. Updated `scripts/ci_proof_index.js` to derive packet identity from the continuity ledger.
3. Updated `scripts/runtime_smoke_check.js` to derive packet identity from the continuity ledger.
4. Added `scripts/validate-runtime-smoke-proof-lane.mjs`.
5. Added `scripts/generate-runtime-smoke-proof-lane-report.mjs`.
6. Wired both new runtime-smoke proof-lane checks into `.github/workflows/runtime-smoke-validation.yml`.
7. Wired the new proof-lane report into runtime-smoke artifact persistence and summary publication.
8. Advanced the continuity ledger to `060X`.

## Gate result
**PASS in repo truth.**

The runtime-smoke proof lane is now materially more coherent in repository truth:
- runtime smoke packet identity is no longer stale by construction
- CI proof index packet identity is no longer stale by construction
- the runtime-smoke workflow now has explicit package-script support for its CI proof index step
- the runtime-smoke proof lane now has dedicated validation and reporting surfaces

## What this packet did NOT prove
- successful execution of the repaired runtime-smoke workflow on current head
- refreshed current-head runtime-smoke artifacts including `runtime-smoke-check-report.*` and `ci-proof-index.*`
- live deployment verifier success
- deployed managed-auth proof
- deployed commercial/runtime proof
- final `060Z` deployment-complete proof bundle

## Next required objective
Use `060Y` to inspect the next current-head proof commit and determine whether the repaired runtime-smoke proof lane now emits the missing artifacts and refreshed packet identity on `main`.
