# Implementation Packet 049L — Route-Authority Inventory and First Migration Queue

## Issue
Packet 049K established the quarantine model for mixed and legacy authority routes, but the system still lacks an explicit inventory of real route surfaces and a bounded first migration queue. Without an inventory, convergence remains conceptual rather than executable.

## Risk
If route inventory and migration order are not explicit:
- highest-risk mixed-truth routes can remain unaddressed
- SaaS ↔ LMS convergence work cannot be tracked against concrete surfaces
- protected gate logic may continue landing on partially migrated routes
- founder review burden increases because state is implied instead of recorded
- false completion risk rises because no explicit queue separates migrated routes from unclassified ones

## Non-Destructive Rule
Packet 049L is inventory-and-queue only.

Do **not** in this packet:
- overwrite lesson progression
- rewrite transcript, credential, or readiness persistence
- mark routes authoritative without evidence of shared normalized authority consumption
- let unclassified routes inherit authoritative status by omission
- claim live deployment convergence without route-level verification

## Objective
Create the canonical route-authority inventory structure and define the first bounded migration queue covering the highest-risk SaaS and Academy surfaces.

## Canonical Inventory Record
Each route inventory entry should carry:

```json
{
  "routeId": "string",
  "path": "string",
  "surfaceType": "saas|academy|shared|admin|public",
  "authorityClass": "authoritative|mixed|legacy|degraded|unclassified",
  "usesNormalizedAuthority": false,
  "usesLocalAuthority": false,
  "protectedActionsPresent": false,
  "academyLinksPresent": false,
  "auricruxRecommendationsPresent": false,
  "riskLevel": "high|medium|low",
  "migrationWave": "wave-1|wave-2|wave-3|backlog",
  "status": "queued|in_progress|blocked|ready_for_cutover|completed",
  "notes": []
}
```

## Inventory Coverage Requirement
The inventory must cover at minimum:
- flagship SaaS workflow routes
- Academy readiness / credential routes
- shared recommendation or gate surfaces
- admin / elevated-control routes
- any route with protected actions

## First Migration Queue
### Wave 1 — highest-risk convergence targets
These routes should be explicitly queued first because they either carry protected actions, operational gating, or Academy-linked remediation significance:

1. `platform-dashboard`
   - path: `/platform`
   - surfaceType: `shared`
   - riskLevel: `high`
   - reason: summary surface likely to aggregate readiness, gate, recommendation, and workflow state

2. `portal-bid-detail`
   - path: `/portal/bids/:bidId`
   - surfaceType: `saas`
   - riskLevel: `high`
   - reason: likely tied to opportunity progression, estimate/proposal continuity, and recommended actions

3. `portal-project-workspace`
   - path: `/portal/projects/:projectId`
   - surfaceType: `saas`
   - riskLevel: `high`
   - reason: flagship workspace surface and likely home of protected downstream actions

4. `portal-estimate-proposal`
   - path: `/portal/estimates/:estimateId` and/or `/portal/proposals/:proposalId`
   - surfaceType: `saas`
   - riskLevel: `high`
   - reason: protected approval/submission and strong readiness implications

5. `academy-home`
   - path: `/academy`
   - surfaceType: `academy`
   - riskLevel: `high`
   - reason: entry surface for remediation, readiness, and recommendation convergence

6. `academy-readiness-credentials`
   - path: `/academy/readiness` and/or `/academy/credentials`
   - surfaceType: `academy`
   - riskLevel: `high`
   - reason: canonical learner-facing authority state surface

7. `academy-lesson-detail`
   - path: `/academy/lessons/:lessonId`
   - surfaceType: `academy`
   - riskLevel: `medium`
   - reason: remediation destination and progress-truth consumer

8. `auricrux-recommendation-surface`
   - path: shared recommendation panel / rail
   - surfaceType: `shared`
   - riskLevel: `high`
   - reason: must not contradict gate or credential truth

### Wave 2 — follow-on convergence targets
- files / briefing route
- admin elevated-control route
- checklist / remediation route
- dashboard subpanels with local readiness summaries

### Wave 3 — backlog and lower-risk routes
- passive informational routes
- routes with no protected actions and no authority-derived messaging

## Queue Rules
- A route cannot enter `completed` without passing the Packet 049J and 049K convergence rules.
- Any route with protected actions defaults to at least `medium` risk until proven otherwise.
- Any route with both gate behavior and Academy links defaults to `high` risk.
- Unclassified routes are not eligible for convergence claims.

## Migration Prioritization Heuristics
Prioritize routes in this order:
1. protected action presence
2. Academy remediation dependency
3. credential / readiness display responsibility
4. Auricrux recommendation dependency
5. summary/aggregator surface impact

## Reporting Rules
- The inventory must distinguish `unclassified` from `legacy`; unknown state is not the same as confirmed stale logic.
- Completed routes should record the migration wave they came from.
- Blocked routes should record the concrete blocker, not just a generic blocked label.
- Inventory should be usable by internal control-plane or diagnostic surfaces.

## Additive Implementation Moves
1. Add a canonical route-authority inventory artifact or registry file.
2. Seed the first migration queue with Wave 1 route entries.
3. Add migration-wave and status fields to route tracking records.
4. Add a helper or validation contract that rejects “fully converged” claims if any high-risk route remains unclassified or quarantined.
5. Add telemetry/reporting expectation for route inventory coverage gaps.

## Validation Rules
A route may not be marked authoritative in the inventory unless:
- it consumes normalized shared authority
- it no longer relies on local readiness/credential booleans for protected behavior
- it renders degraded/cached states explicitly
- it does not contradict Auricrux recommendation surfaces

## Non-Regression Checks
- `startLesson` unchanged
- `completeLesson` unchanged
- transcript persistence unchanged
- credential persistence unchanged
- Packet 049G cross-link rules preserved
- Packet 049H gate model preserved
- Packet 049I authority ordering preserved
- Packet 049J consumer convergence target preserved
- Packet 049K quarantine rules preserved

## Acceptance Criteria
Packet 049L is complete when:
- one canonical inventory record shape exists in repo truth
- a first migration queue is explicitly defined
- highest-risk SaaS and Academy routes are named and prioritized
- unclassified routes are excluded from authoritative completion claims
- no LMS persistence path is modified

## Recommended File Targets
- route-authority inventory artifact
- migration queue registry or markdown tracker
- validation contract for convergence-claim eligibility
- diagnostic/control-plane consumer for inventory visibility

## Validation Checklist
- Inventory distinguishes authoritative, mixed, legacy, degraded, and unclassified routes.
- Wave 1 queue contains highest-risk SaaS and Academy routes.
- Protected routes are not omitted from the inventory.
- No route is treated as authoritative by default.
- No LMS truth or persistence path is overwritten.

## Next Build Step
Packet 049M should define the first concrete migration execution packet for Wave 1 routes, starting with the shared dashboard / recommendation / readiness surfaces that most strongly affect both SaaS and Academy continuity.
