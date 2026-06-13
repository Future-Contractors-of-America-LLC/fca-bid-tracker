# Implementation Packet 049I — Provider-Truth Readiness and Credential Convergence

## Issue
Packet 049H established a canonical gate/remediation model, but gate decisions are only trustworthy if readiness, credential, and training-completion signals converge on one provider-backed authority surface. Right now the primary risk is fragmented truth: one route may read readiness from a local panel model, another from transcript state, another from provider-backed lesson status, and a fourth from fallback heuristics.

## Authority Basis
FCA system law requires SaaS and Academy to operate as one system with shared data, shared logic, shared execution flow, and Auricrux orchestration rather than disconnected applications. The Academy is fully integrated with SaaS, and SaaS productivity / operational errors are supposed to feed Academy remediation, recommendations, gating, and recertification behavior. fileciteturn3file6 fileciteturn3file14

The uploaded matrix also requires live SaaS telemetry, training recommendations, feature-gate restriction overlays, credential-sensitive locks, and just-in-time remediation patterns tied to real workspace context. fileciteturn3file1 fileciteturn3file13

## Risk
Without provider-truth convergence:
- gate decisions can disagree across SaaS routes
- users can appear ready on one surface and blocked on another
- credentials can be cosmetically displayed but not operationally enforced
- LMS progress can be overwritten by local state shortcuts
- SaaS→Academy cross-links drift into advisory-only behavior

## Non-Destructive Rule
Packet 049I is convergence-first and additive.

Do **not** in this packet:
- overwrite lesson progression
- invent credential completions
- infer transcript completion from UI state alone
- replace provider/API truth with local cache truth
- mark readiness satisfied solely because a route renders without error
- collapse distinct signals unless the authority mapping is explicit

## Objective
Define one canonical provider-truth contract for readiness and credential state so all SaaS gates, LMS surfaces, and Auricrux recommendations evaluate against the same normalized authority.

## Canonical Authority Model
All readiness and credential decisions must resolve through a normalized authority object:

```json
{
  "tenantId": "string",
  "userId": "string",
  "authorityVersion": "string",
  "providerTimestamp": "iso-8601",
  "signals": {
    "readiness": [],
    "credentials": [],
    "training": [],
    "telemetry": []
  },
  "degraded": false,
  "degradationReason": null,
  "source": "academy-provider|academy-api|canonical-aggregator"
}
```

## Signal Classes
### 1. Readiness signals
Use for operational eligibility:
- route readiness
- workflow readiness
- safety readiness
- role-specific readiness
- advanced feature readiness

### 2. Credential signals
Use for formal qualification state:
- held credential
- expiration date
- renewal due state
- jurisdiction restriction
- verification status

### 3. Training signals
Use for provider-backed completion state:
- course completion
- lesson completion
- checklist completion
- pathway progression
- remediation completion

### 4. Telemetry signals
Use for dynamic operational correction:
- repeated process errors
- blocked workflow attempts
- low-confidence operation patterns
- competency-risk flags

## Convergence Rule
A route or feature must not compute readiness independently if canonical provider truth is available.

Order of authority:
1. provider-backed Academy/API truth
2. canonical aggregated authority object
3. degraded-warning state
4. degraded-block state for critical actions

Local UI state is **never** final authority.

## Normalized Readiness Signal Schema
```json
{
  "signalId": "string",
  "signalType": "readiness",
  "scope": "global|route|action|project|credential|safety",
  "status": "ready|warning|blocked|expired|unknown",
  "code": "string",
  "label": "string",
  "source": "provider|api|telemetry-rule",
  "verified": true,
  "expiresAt": "iso-8601|null",
  "relatedTargets": ["string"]
}
```

## Normalized Credential Signal Schema
```json
{
  "signalId": "string",
  "signalType": "credential",
  "credentialType": "license|certificate|training|safety|internal-clearance",
  "status": "active|expiring|expired|missing|unverified",
  "issuer": "string|null",
  "jurisdiction": "string|null",
  "verified": true,
  "issuedAt": "iso-8601|null",
  "expiresAt": "iso-8601|null",
  "requiredFor": ["string"]
}
```

## Initial Surfaces That Must Converge On This Authority
### SaaS
- protected workspace actions
- proposal / estimate approval surfaces
- readiness banners / gate overlays
- Auricrux recommendation panels
- admin clearance-sensitive controls

### Academy
- learner home readiness panels
- credential displays
- transcript / pathway readiness indicators
- remediation / checklist surfaces
- course and lesson detail blockers

## API / Data Rules
- Provider truth must be fetched, normalized, and reused rather than recomputed ad hoc per route.
- A route may cache normalized authority briefly for UX, but cache must be marked non-authoritative and time-bounded.
- If provider truth is stale, the UI must surface degraded authority state.
- Gate decisions must include the signal IDs they depended on.

## Degraded-State Rules
When provider truth is unavailable:
- non-critical actions may show `warn` with explicit degraded-authority messaging
- critical actions must show `block` or `warn` according to policy severity
- degraded state must emit telemetry
- degraded state must never silently pass a protected action

## Additive Implementation Moves
1. Add shared `readinessAuthority` / `credentialAuthority` normalized contract.
2. Add one canonical aggregation helper for provider-backed readiness and credential payloads.
3. Add UI helpers that distinguish `authoritative`, `cached`, and `degraded` truth.
4. Add gate-evaluation wiring so Packet 049H decisions consume normalized authority signals.
5. Add telemetry for stale, missing, or contradictory authority states.
6. Add audit payload shape for Auricrux actions that recommend or enforce based on converged signals.

## Contradiction Handling Rule
If two surfaces disagree on readiness or credential state:
- provider-backed normalized authority wins
- contradiction emits telemetry
- route should display warning that previous state was superseded
- local state must not overwrite normalized authority

## Non-Regression Checks
- `startLesson` unchanged
- `completeLesson` unchanged
- transcript persistence unchanged
- credential persistence unchanged
- route gating still does not mutate LMS progress directly
- Academy provider truth remains the source of completion state

## Acceptance Criteria
Packet 049I is complete when:
- one normalized provider-truth contract exists for readiness and credentials
- gate decisions can reference normalized signal IDs rather than ad hoc route booleans
- SaaS and Academy surfaces can both represent authoritative vs degraded truth explicitly
- contradiction telemetry is defined
- no LMS progress or credential record is overwritten by local UI state

## Recommended File Targets
- shared authority contract/helper module
- gate evaluation consumer surfaces
- Academy readiness / credential panels
- telemetry / audit helper for contradictory or degraded authority states
- canonical payload docs for readiness and credential signal normalization

## Validation Checklist
- A protected SaaS action uses normalized authority instead of route-local booleans.
- A credential panel and a gate overlay can point to the same canonical signal ID.
- Stale provider truth produces degraded messaging and telemetry.
- Contradictory cached/local states do not override provider truth.
- Existing LMS progress APIs remain untouched.

## Next Build Step
Packet 049J should implement route-level authority-consumer convergence so the highest-value SaaS and Academy screens all render from the same normalized readiness / credential helpers rather than mixed local logic.
