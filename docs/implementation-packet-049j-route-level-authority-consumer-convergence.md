# Implementation Packet 049J — Route-Level Authority-Consumer Convergence

## Issue
Packet 049I defined a canonical provider-truth readiness and credential authority model, but the highest-value SaaS and Academy routes can still drift if each route consumes that authority differently. The remaining gap is not authority definition; it is authority consumption.

## Risk
If route-level consumers stay inconsistent:
- one route can use canonical authority while another still uses local booleans
- gate overlays can disagree with credential panels
- Auricrux recommendations can drift from route blockers
- Academy and SaaS can show conflicting readiness states for the same user
- LMS truth can be visually undermined without directly mutating persistence

## Non-Destructive Rule
Packet 049J is consumer-convergence only.

Do **not** in this packet:
- overwrite lesson progress
- rewrite transcript persistence
- replace provider/API truth with route-local fallbacks
- reintroduce per-route authority logic as an escape hatch
- allow route rendering success to count as readiness truth

## Objective
Make the highest-value SaaS and Academy screens consume one shared normalized authority helper so visible readiness, credential, gating, warning, and remediation states all resolve from the same source.

## Priority Route Set
### SaaS priority routes
1. platform dashboard
2. bid / opportunity detail
3. project workspace
4. estimate / proposal surfaces
5. files / briefing surfaces
6. admin or elevated-control surfaces

### Academy priority routes
1. academy home
2. course detail
3. lesson detail
4. readiness / credential panels
5. remediation / checklist surfaces

## Canonical Consumer Contract
Every priority route should consume a shared resolved object shaped like:

```json
{
  "authority": {
    "status": "authoritative|cached|degraded",
    "version": "string",
    "providerTimestamp": "iso-8601|null"
  },
  "signals": {
    "readiness": [],
    "credentials": [],
    "training": [],
    "telemetry": []
  },
  "gates": [],
  "recommendedRemediation": [],
  "warnings": []
}
```

Routes may adapt presentation, but they may not fork authority semantics.

## Route-Level Consumption Rules
- All priority routes must read from the shared authority consumer/helper layer.
- Route components may filter relevant signals, but not redefine their status meanings.
- Gate overlays, banners, badges, panels, and Auricrux recommendations must all reference canonical signal IDs.
- If a route only has cached or degraded authority, that state must be visibly labeled.
- If a route cannot obtain an authoritative signal required for a critical action, the route must not silently permit protected behavior.

## UI Convergence Rules
### Must converge visually across routes
- readiness status language
- credential status language
- degraded-authority warnings
- blocked-action explanation copy pattern
- remediation link affordance
- Auricrux recommendation reason labels

### Allowed to vary by route
- layout
- density
- surface-specific prioritization
- whether signals show as card, rail, banner, or modal

## Minimum Additive Implementation Moves
1. Add a shared route-consumer helper for normalized authority selection.
2. Add shared display utilities for signal status labels and degraded-state handling.
3. Update highest-value SaaS route surfaces to consume shared authority helpers.
4. Update highest-value Academy route surfaces to consume the same helpers.
5. Add a shared mapping between signal IDs and route-visible explanation states.
6. Add telemetry for routes still rendering with legacy/local authority logic.

## Legacy Logic Quarantine Rule
If an existing route still depends on local booleans or route-specific authority derivation:
- mark it as legacy authority consumption
- emit telemetry when it renders
- do not silently treat it as equivalent to normalized authority
- prioritize migration of that route before adding new gated behaviors there

## Auricrux Convergence Rule
Auricrux recommendation surfaces must consume the same normalized authority object used by the route:
- same signal IDs
- same block/warn interpretation
- same remediation targets
- same degraded-authority semantics

Auricrux must not recommend action contrary to an active gate state.

## Validation Targets
Packet 049J should make it possible to verify that:
- a credential panel and a gate overlay reference the same signal ID
- a blocked SaaS action and its Academy remediation route reference the same canonical authority source
- a degraded provider state appears consistently across dashboard, project, and Academy surfaces
- route warnings, gate decisions, and Auricrux panels do not contradict each other

## Non-Regression Checks
- `startLesson` unchanged
- `completeLesson` unchanged
- transcript persistence unchanged
- credential persistence unchanged
- Packet 049G cross-link contract preserved
- Packet 049H gate model preserved
- Packet 049I authority source ordering preserved

## Acceptance Criteria
Packet 049J is complete when:
- one shared route-consumer pattern exists in repo truth
- at least one SaaS priority route and one Academy priority route are defined to consume it
- degraded/cached/authoritative states are explicitly represented at route level
- legacy route-local authority logic is quarantined rather than treated as authoritative
- no LMS persistence path is modified

## Recommended File Targets
- shared route authority consumer/helper module
- shared signal display utility module
- one SaaS route integration target
- one Academy route integration target
- telemetry helper for legacy-authority route detection

## Validation Checklist
- Priority SaaS route reads normalized authority helper.
- Priority Academy route reads the same helper.
- Gate state, warning state, and recommendation state can all point to the same canonical signal IDs.
- Degraded provider truth renders explicitly.
- No route infers readiness purely from local UI state.

## Next Build Step
Packet 049K should implement legacy-authority route quarantine and migration tracking so remaining mixed-truth screens are explicitly surfaced, prioritized, and removed without regressing LMS or SaaS continuity.
