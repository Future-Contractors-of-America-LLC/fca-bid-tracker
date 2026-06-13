# Implementation Packet 049G — SaaS ↔ LMS Cross-Link Enforcement

## Issue
SaaS and Academy/LMS must advance simultaneously through one shared operational spine rather than as adjacent products. Current risk is route-level or panel-level drift where Academy exists visually, but SaaS actions are not actually linked to lessons, checklists, readiness, or credential truth.

## Authority Basis
This packet follows the FCA system requirement that SaaS and Academy are two fully integrated divisions with shared execution, data, and user experience, not separate applications. It also follows the prescribed continuity rule that every "Next Action" in SaaS can link to a course module, micro-lesson, or checklist so the system behaves as one operating environment.

## Risk
If cross-links remain optional or cosmetic:
- SaaS and LMS drift into parallel lanes
- Academy becomes support content instead of workforce system
- feature gating and remediation cannot operate from real work context
- user progress and operational correction lose continuity

## Packet Boundary
Packet 049G is additive and connective.

Do **not** in this packet:
- overwrite LMS lesson progress
- demote provider/API truth to local state
- replace existing Academy authority normalization work
- add fake training completions or seeded readiness claims
- hardcode Academy links without workspace context

## Objective
Enforce a canonical cross-link contract so SaaS surfaces can attach operational work to Academy learning objects and Academy surfaces can reflect SaaS-derived guidance without breaking LMS truth.

## Required Shared Objects
The following objects must remain authoritative across both lanes:
- `tenant`
- `user`
- `project`
- `bid` / `opportunity`
- `task` / `nextAction`
- `academyCourse`
- `academyLesson`
- `academyChecklist`
- `readinessSignal`
- `credentialSignal`
- `auditEvent`
- `auricruxAction`

## Canonical Cross-Link Contract
Every eligible SaaS action surface should be able to emit a normalized link object:

```json
{
  "sourceType": "bid|project|takeoff|estimate|proposal|rfi|redline|change|qc|billing",
  "sourceId": "string",
  "tenantId": "string",
  "projectId": "string|null",
  "userId": "string",
  "academyTargetType": "course|lesson|checklist|pathway",
  "academyTargetId": "string",
  "reasonCode": "readiness_gap|process_error|recommended_training|required_gate|credential_requirement",
  "reasonLabel": "string",
  "recommendedBy": "auricrux|rule|system",
  "blocking": true,
  "evidence": {
    "route": "string",
    "surface": "string",
    "signalIds": ["string"]
  }
}
```

## Initial SaaS Surfaces That Must Support Cross-Linking
1. Bid / opportunity workspace
2. Project workspace
3. Estimate / proposal workflow
4. Files / document briefing surfaces
5. Qualification / readiness surfaces
6. Auricrux recommendation panels

## Initial LMS Targets That Must Accept Cross-Link Context
1. Academy home recommendation rail
2. Course detail
3. Lesson detail
4. Checklist / micro-remediation views
5. Credential / readiness panels

## UI Enforcement Rules
- If SaaS shows a recommended next action and training exists, the UI must surface a concrete Academy target.
- If a SaaS action is blocked by readiness or credential state, the blocker must link directly to the relevant Academy target.
- If no provider-backed Academy target exists, show a warning state rather than fake availability.
- All links must preserve tenant and relevant workspace context.

## API / Data Rules
- SaaS must not infer Academy completion locally.
- Academy must not infer SaaS competency completion without provider/API truth.
- Cross-link objects must be serializable, auditable, and safe to replay.
- Missing Academy targets must produce warning telemetry.

## Minimum Additive Implementation Moves
1. Add a shared `academyLinking` contract/helper module.
2. Add route-level support for `recommendedTraining`, `requiredTraining`, or `academyChecklist` payload keys on SaaS-facing view models.
3. Add Academy-side handlers for inbound workspace context.
4. Add warning telemetry for missing or stale Academy targets.
5. Add audit event emission when Auricrux recommends or enforces a learning action from a SaaS surface.

## Validation Checks
- A SaaS next-action card can deep-link to a real Academy target.
- A blocked SaaS feature can surface a real Academy gate target without mutating progress.
- Academy surfaces can render inbound workspace context without replacing LMS truth.
- Missing target behavior emits warning telemetry and does not silently fall back.
- Existing lesson progression APIs remain unchanged.

## Explicit Non-Regression Checks
- `startLesson` remains intact.
- `completeLesson` remains intact.
- transcript / cohort / credential persistence remains intact.
- Academy provider-backed truth remains the source of lesson status.

## Acceptance Criteria
Packet 049G is complete when:
- one shared cross-link contract exists in repo truth
- at least one SaaS workspace surface and one Academy surface can exchange real context through that contract
- no LMS progress path is overwritten or downgraded
- warning telemetry exists for missing Academy link targets

## Recommended File Targets
- shared state / contract module for SaaS↔LMS link payloads
- SaaS workspace recommendation panels
- Academy recommendation / intake context panels
- telemetry helper used by Academy authority surfaces

## Next Build Step
Packet 049H should implement feature-gate and micro-remediation integration so blocked SaaS surfaces can route users into the correct Academy action without breaking LMS provider truth.
