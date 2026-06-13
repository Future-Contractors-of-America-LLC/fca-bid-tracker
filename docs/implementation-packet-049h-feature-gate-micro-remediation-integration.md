# Implementation Packet 049H — Feature-Gate and Micro-Remediation Integration

## Issue
Packet 049G defined the SaaS ↔ LMS cross-link contract, but the system still needs a canonical enforcement layer that can block protected SaaS actions when readiness, credential, or competence requirements are not met, and then route the user directly into the correct Academy remediation target.

## Authority Basis
This packet follows the FCA requirement that SaaS and Academy operate as one system under a shared spine, and the matrix directive that Academy recommendations, just-in-time learning, feature gate restriction overlays, and SaaS-to-Academy feedback loops must be driven by real operational context rather than separate training-only flows.

## Risk
Without a canonical gate/remediation layer:
- SaaS surfaces can expose protected actions prematurely
- Academy remains advisory instead of operationally integrated
- readiness blocking becomes inconsistent by route
- users can encounter failure states with no corrective path
- LMS progress may be mutated incorrectly if gating is implemented through local shortcuts

## Non-Destructive Rule
Packet 049H is additive and enforcement-oriented.

Do **not** in this packet:
- overwrite lesson progress
- mark remediation complete from SaaS UI alone
- bypass provider/API lesson truth
- hardcode fake credentials or readiness passes
- silently hide blocked functionality without explanation
- create local-only gate decisions that drift from canonical signals

## Objective
Implement a shared gate-and-remediation contract so protected SaaS features can:
1. evaluate readiness and credential signals
2. declare whether access is allowed, warned, or blocked
3. present a direct Academy remediation path when blocked
4. emit audit and telemetry records for every enforcement decision

## Canonical Gate Decision Model
Every gate evaluation should resolve to one of:
- `allow`
- `warn`
- `block`

### Normalized gate payload
```json
{
  "gateId": "string",
  "tenantId": "string",
  "userId": "string",
  "surface": "bid|project|files|takeoff|estimate|proposal|academy|admin",
  "action": "string",
  "decision": "allow|warn|block",
  "reasonCode": "missing_credential|readiness_gap|required_training|competency_risk|provider_truth_unavailable",
  "reasonLabel": "string",
  "signalIds": ["string"],
  "academyRemediation": {
    "targetType": "course|lesson|checklist|pathway",
    "targetId": "string",
    "title": "string",
    "blocking": true
  },
  "providerTruth": {
    "source": "academy-provider|api|telemetry-rule",
    "verified": true,
    "stale": false
  }
}
```

## Shared Signal Inputs
Gate decisions must draw from canonical signals only:
- credential state
- readiness state
- provider-backed lesson / checklist status
- role / entitlement state
- SaaS telemetry-derived operational risk signals
- route or action classification

## Initial Protected SaaS Actions
These actions should be first-class gate targets:
1. proposal submission
2. estimate approval / conversion
3. protected project workflow actions
4. admin or elevated operational controls
5. Academy-gated advanced workflow entry points

## UI Enforcement Rules
- `allow`: action remains available with no blocking overlay.
- `warn`: action remains available, but warning banner/panel explains risk and offers remediation links.
- `block`: action control is disabled or intercepted by a visible gate overlay that links directly to Academy remediation.
- A blocked state must always explain **why** the user is blocked and what exact remediation target exists.
- If provider truth is unavailable, do not fake a pass; show degraded-warning or degraded-block state according to severity.

## Micro-Remediation Rules
Micro-remediation targets should be lightweight, context-aware, and directly actionable.

Allowed target types:
- short lesson
- checklist
- remediation card sequence
- required pathway step

Micro-remediation must carry:
- workspace context
- reason code
- source surface
- blocked action intent

## Audit / Telemetry Rules
Every gate decision must be recordable as:
- `gateEvaluated`
- `gateBlocked`
- `gateWarned`
- `remediationSuggested`
- `remediationOpened`

Telemetry must capture:
- route
- action
- decision
- signal source
- academy target presence/absence
- degraded provider truth state when present

## Additive Implementation Moves
1. Add shared `featureGateDecision` contract/helper module.
2. Add a reusable gate evaluation function that accepts canonical signals and returns the normalized decision payload.
3. Add a shared gate overlay/panel surface for blocked and warned states.
4. Add Academy remediation intake support for blocked-action context.
5. Add telemetry helpers for gate decisions and remediation openings.
6. Add audit emission contract for Auricrux recommendations tied to blocked or warned actions.

## Non-Regression Checks
- `startLesson` remains unchanged.
- `completeLesson` remains unchanged.
- provider-backed lesson status remains authoritative.
- transcript / credential / readiness persistence remains unchanged.
- blocked SaaS actions do not mutate LMS truth directly.

## Acceptance Criteria
Packet 049H is complete when:
- one shared gate decision contract exists in repo truth
- at least one protected SaaS action can evaluate to allow/warn/block via canonical signals
- a blocked action can link directly to a real Academy remediation target
- warning/block telemetry is defined
- no LMS progress path is overwritten or simulated

## Recommended File Targets
- shared gating contract/helper module
- protected SaaS action surfaces
- shared warning / block overlay component
- Academy remediation context intake surface
- telemetry / audit helper used by both SaaS and Academy surfaces

## Validation Checklist
- Protected action correctly blocks when required training signal is absent.
- Protected action warns when competency risk exists but access is still allowed.
- Remediation link preserves tenant/user/workspace context.
- Missing Academy remediation target produces warning telemetry, not silent failure.
- Existing LMS progress APIs remain untouched.

## Next Build Step
Packet 049I should implement provider-truth-backed readiness and credential surface convergence so all gate decisions evaluate against the same canonical authority signals across SaaS and Academy.
