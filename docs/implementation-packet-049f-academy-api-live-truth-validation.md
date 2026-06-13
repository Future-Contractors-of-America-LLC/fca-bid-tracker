# Implementation Packet 049F — Academy API / Live Truth Validation

## Issue
Packet 049E normalized the remaining academy-linked UI authority surfaces, but Packet 049F must verify that those surfaces are still bound to the real Academy provider/API lane rather than drifting back to local or cosmetic truth.

## Risk
The primary regression risk is accidental overwrite or rollback of LMS progression work delivered in Packet 048W / 048X and later authority packets.

## Non-Destructive Rule
Packet 049F is validation-first and additive only.

Do **not** in this packet:
- replace lesson progression API handlers
- remove `startLesson` / `completeLesson`
- demote API-backed lesson status to local fallback truth
- rewrite transcript, cohort, credential, or readiness persistence contracts
- reset seeded or durable LMS progress records
- change backend write semantics unless a mismatch is proven and the fix is additive

## Preserve These Existing Truth Surfaces
- shared Academy provider lane
- API-backed lesson progression contract
- transcript / cohort / credential authority normalization
- provider-truth telemetry pattern used by academy surfaces
- fallback-only local store quarantine posture

## Packet 049F Scope
1. Verify Academy UI surfaces consume provider-backed truth consistently.
2. Verify Academy API payloads still expose the fields expected by the normalized UI.
3. Surface any repo/live mismatch explicitly.
4. Add warning telemetry where provider truth is absent, stale, or degraded.
5. Preserve all existing LMS progress pathways.

## Acceptance Criteria
- No LMS write path is removed or weakened.
- No lesson progress state source is changed from API truth back to local truth.
- Any missing provider/API field is surfaced as a warning, not papered over.
- Packet 049F changes are additive, read-first, and audit-safe.

## Execution Rule
If a mismatch is found, fix the boundary around it without undoing previous LMS convergence work.

## Next Build Step
Inspect academy provider hooks, academy API view models, readiness/credential surfaces, and any live-state validation helpers for non-destructive Packet 049F alignment.
