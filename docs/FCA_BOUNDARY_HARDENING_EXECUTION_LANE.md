# FCA Boundary Hardening Execution Lane

## Objective

Align frontend API behavior with backend authority so repository truth, generated deploy truth, and runtime truth stay synchronized.

## Recommended Run Window

- Target duration: 2-3 hours
- Run in repeating batches of 20-30 minutes
- For unattended runs, use the loop command: `npm run lane:boundary-hardening:loop`
- Optional strict mode for external checks: `node scripts/run-boundary-hardening-lane.mjs --cycles 6 --fail-on-soft`

## Batch 0 - Preflight (10-15 min)

1. Confirm working tree state:
   - `git status --short`
2. Confirm dependency baseline:
   - `npm install`
3. Confirm baseline build:
   - `npm run build`

## Batch 1 - Proxy Alignment Guard (15-20 min)

1. Validate all flat handlers are proxy-aligned:
   - `npm run validate:flat-api-proxy-alignment`
2. Review report artifact:
   - `docs/qc/flat-api-proxy-alignment.json`
3. Fix any non-proxy regression immediately before continuing.

## Batch 2 - Generated Deploy Surface (15-20 min)

1. Re-generate deployable API surface:
   - `node scripts/prepare-api-functions.mjs`
2. Confirm obsolete local store modules are absent from generated output.
3. Confirm generated surface still includes required function folders.

## Batch 3 - Runtime Contract Checks (20-30 min)

1. Verify central API connectivity and shape:
   - `npm run verify:central-api`
2. Run bounded central smoke:
   - `npm run smoke:central-spine`
3. Record failures with route + status + payload excerpt.

## Batch 4 - Build and Packaging Integrity (15-20 min)

1. Full build + post-build packaging:
   - `npm run build`
2. SWA deploy packaging prep:
   - `npm run prepare:swa-deploy`
3. Validate route continuity overlays and generated manifests.

## Batch 5 - End-to-End Lane Command (10-15 min)

1. Run orchestrated lane:
   - `npm run lane:boundary-hardening`
   - Or multi-cycle run: `npm run lane:boundary-hardening:loop`
2. Capture output and exit status as checkpoint evidence.
3. Review lane summary artifact:
   - `docs/qc/boundary-hardening-lane.json`

## Batch 6 - Commit Preparation (15-25 min)

1. Separate commit scopes:
   - API proxy/boundary code
   - build-generated artifacts
   - unrelated media/UI edits (exclude from boundary commit)
2. Produce checkpoint summary with:
   - changed files
   - build result
   - central verification result
   - remaining blockers

## Fast Retry Loop

When any batch fails:

1. Fix failing route/script only.
2. Re-run `npm run validate:flat-api-proxy-alignment`.
3. Re-run `npm run build`.
4. Resume at the failed batch.

## Exit Criteria

- Flat handlers proxy-aligned and validated.
- `api_generated` excludes obsolete local workflow/commercial/finance/warranty flat stores.
- Build is green.
- Central API verification and central smoke pass (or have explicit deferred note with reason).
- Clean checkpoint summary is ready for commit/deploy handoff.
