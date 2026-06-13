# Implementation Packet 049K — Legacy-Authority Route Quarantine and Migration Tracking

## Issue
Packet 049J established the route-level consumer convergence target, but the system still needs an explicit containment mechanism for screens that continue to use legacy or mixed authority logic. Without quarantine, mixed-truth routes can remain invisible, continue rendering contradictory readiness or credential states, and silently weaken the SaaS ↔ LMS operating spine.

## Risk
If legacy-authority routes are not explicitly quarantined:
- mixed-truth behavior remains hidden in production-facing surfaces
- new gating logic can be added on top of stale route-local booleans
- SaaS and Academy can diverge despite normalized authority contracts existing in repo truth
- regressions become difficult to detect because route consumers are not classified by authority quality
- LMS provider truth can be visually undermined by stale local route logic without direct persistence mutation

## Non-Destructive Rule
Packet 049K is quarantine-and-tracking only.

Do **not** in this packet:
- overwrite lesson progression
- rewrite transcript, credential, or readiness persistence
- silently convert legacy routes to authoritative without explicit migration
- let local route booleans satisfy protected-action gates
- hide mixed-truth routes from reporting

## Objective
Define a canonical quarantine and migration-tracking system for any route that has not yet been fully migrated to normalized provider-truth authority consumption.

## Route Authority Classifications
Every relevant route must be classified as one of:
- `authoritative` — consumes normalized provider-truth authority helpers only
- `mixed` — consumes normalized authority plus local/fallback route logic
- `legacy` — primarily driven by route-local or stale authority logic
- `degraded` — consumes normalized authority but only through stale/missing provider truth states

## Quarantine Rule
Routes classified as `mixed` or `legacy` must be treated as quarantined until migrated.

Quarantined routes must:
- emit telemetry when rendered
- declare their authority status explicitly in dev/diagnostic surfaces
- be excluded from “fully converged” claims
- be blocked from receiving new protected gate behavior unless that behavior uses the normalized authority consumer

## Canonical Tracking Record
Each quarantined route should have a migration record shaped like:

```json
{
  "routeId": "string",
  "path": "string",
  "surfaceType": "saas|academy|shared|admin",
  "authorityClass": "mixed|legacy|degraded",
  "usesNormalizedAuthority": true,
  "usesLocalAuthority": true,
  "protectedActionsPresent": true,
  "riskLevel": "high|medium|low",
  "migrationTarget": "string",
  "blockingReasons": ["string"],
  "owner": "auricrux",
  "status": "quarantined|migrating|ready_for_cutover|completed"
}
```

## Priority Quarantine Order
Highest-risk routes for immediate classification and migration tracking:
1. protected SaaS workflow routes
2. Academy readiness / credential panels
3. proposal / estimate approval surfaces
4. Auricrux recommendation surfaces tied to gates
5. admin / elevated-control routes
6. dashboard summary routes that aggregate readiness or credential state

## Migration Rules
A quarantined route may only move to `authoritative` when all are true:
- route consumes the shared normalized authority helper
- route-local readiness / credential booleans are removed or reduced to non-authoritative display state
- gate decisions reference canonical signal IDs
- degraded and cached states are rendered explicitly
- telemetry confirms route no longer depends on legacy authority logic

## UI / Reporting Rules
- Quarantine status should be available to internal diagnostic or control-plane surfaces.
- Quarantined routes must not be described as fully converged.
- Mixed-truth warnings should be explicit in internal validation artifacts.
- Authoritative migration progress should be trackable route by route.

## Telemetry Rules
Additive telemetry events should include:
- `legacyAuthorityRouteRendered`
- `mixedAuthorityRouteRendered`
- `degradedAuthorityRouteRendered`
- `routeAuthorityMigrationStarted`
- `routeAuthorityMigrationCompleted`
- `routeAuthorityContradictionDetected`

Each event should capture:
- route path
- surface type
- authority class
- normalized signal availability
- protected action presence
- contradiction presence

## Additive Implementation Moves
1. Add a shared route-authority classification registry.
2. Add migration tracking record shape for quarantined routes.
3. Add telemetry helpers for route authority class rendering.
4. Add internal diagnostic consumption pattern for route authority status.
5. Add validation rules preventing new protected gate logic from landing on legacy-only routes.
6. Add explicit repo-truth artifact or registry documenting the migration queue.

## Validation Rules
A route cannot be counted as migrated if:
- it still derives readiness from route-local booleans for protected actions
- it renders credential pass state without canonical provider-backed signal support
- it suppresses degraded-authority warnings
- it contradicts Auricrux recommendation surfaces or gate overlays

## Non-Regression Checks
- `startLesson` unchanged
- `completeLesson` unchanged
- transcript persistence unchanged
- credential persistence unchanged
- Packet 049G cross-link rules preserved
- Packet 049H gate model preserved
- Packet 049I authority ordering preserved
- Packet 049J route-consumer convergence target preserved

## Acceptance Criteria
Packet 049K is complete when:
- one route-authority classification model exists in repo truth
- quarantine rules for mixed/legacy routes are defined
- a migration tracking record shape exists
- new protected gate behavior is explicitly barred from legacy-only routes
- telemetry expectations for route-authority class rendering are defined
- no LMS persistence path is modified

## Recommended File Targets
- shared route-authority registry/helper
- telemetry helper for route authority status
- diagnostic/control-plane route authority inventory surface
- migration tracking artifact or registry file
- validation contract for protected-gate eligibility

## Validation Checklist
- A route can be classified as authoritative, mixed, legacy, or degraded.
- Quarantined routes are excluded from convergence claims.
- Mixed/legacy route rendering emits telemetry.
- Protected-gate eligibility is denied to legacy-only routes.
- No LMS truth or persistence path is overwritten.

## Next Build Step
Packet 049L should implement the route-authority inventory and first migration queue so the highest-risk SaaS and Academy routes are explicitly listed, prioritized, and moved through authoritative convergence in a bounded sequence.
