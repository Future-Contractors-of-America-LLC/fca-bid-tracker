# Implementation Packet 049M — Wave 1 Migration Execution: Shared Dashboard / Recommendation / Readiness Surfaces

## Issue
Packet 049L defined the first migration queue, but Wave 1 still needs an execution packet that converts the highest-leverage shared authority surfaces from conceptual inventory targets into concrete migration work. The first surfaces to converge are the shared dashboard, Auricrux recommendation surfaces, and readiness/credential presentation surfaces because they influence both SaaS and Academy truth at the same time.

## Risk
If Wave 1 execution does not begin with the shared summary and recommendation layer:
- SaaS and Academy can keep rendering contradictory status summaries even if deeper contracts exist
- route-level gates can still disagree with dashboard or recommendation rails
- users can be sent to remediation paths that do not match current authority signals
- leadership can mistake a surface-level dashboard for true convergence while mixed authority remains underneath

## Non-Destructive Rule
Packet 049M is execution-scaffold and migration-target definition only.

Do **not** in this packet:
- overwrite lesson progression
- rewrite transcript, readiness, or credential persistence
- mark a route authoritative before consumer migration is complete
- let dashboard summaries compute readiness from ad hoc local booleans
- allow Auricrux recommendation text to drift from gate and credential truth

## Objective
Define the first concrete Wave 1 migration implementation targets so the shared dashboard, recommendation rails, and readiness surfaces can all consume the normalized provider-truth authority stack introduced in Packets 049G–049L.

## Wave 1 Migration Targets
### 1. Shared platform dashboard summary surface
**Likely path:** `/platform`

**Purpose**
- aggregate readiness
- surface blocked/warned actions
- show current recommendation state
- expose authoritative vs degraded truth clearly

**Required migration result**
- consume shared normalized authority helper
- render authoritative/cached/degraded state explicitly
- reference canonical signal IDs for dashboard badges or banners
- stop using route-local summary booleans for protected readiness claims

### 2. Shared Auricrux recommendation surface
**Likely surface:** shared panel/rail across dashboard, portal, and academy-adjacent routes

**Purpose**
- explain what is blocked, risky, or next
- link directly to Academy remediation or SaaS next action
- stay aligned with gate state and credential state

**Required migration result**
- recommendation payloads consume same signal IDs used by gates
- recommendation targets use cross-link contract from Packet 049G
- no recommendation can contradict active block/warn decision
- degraded authority state is visible inside recommendation reasoning

### 3. Academy readiness / credential summary surface
**Likely paths:** `/academy`, `/academy/readiness`, `/academy/credentials`

**Purpose**
- show learner/operator readiness
- show credential state
- serve as remediation launch point
- represent same authority state used by SaaS-protected actions

**Required migration result**
- consume shared normalized readiness/credential authority object
- distinguish authoritative vs degraded truth
- show same signal semantics as dashboard and gate overlays
- do not derive completion/readiness from UI-local assumptions

## Canonical Shared Consumer Requirements
All three Wave 1 surfaces must consume the same shared structures:
- normalized authority object
- normalized readiness signals
- normalized credential signals
- gate decision payloads
- remediation link objects
- degraded authority warnings

## Required Shared UI Semantics
The following meanings must be identical across Wave 1 surfaces:
- `ready`
- `warning`
- `blocked`
- `active credential`
- `expiring credential`
- `expired credential`
- `authoritative`
- `cached`
- `degraded`

Presentation may differ. Meaning may not.

## Migration Execution Sequence
### Step 1 — Shared helper binding
Create or bind one shared route-consumer helper for:
- authority state
- gate summaries
- readiness/credential signal extraction
- remediation target extraction

### Step 2 — Dashboard convergence
Update platform dashboard summary cards/banners/rails to consume the shared helper rather than local truth derivation.

### Step 3 — Recommendation convergence
Update Auricrux recommendation surfaces to consume the same helper and canonical signal IDs.

### Step 4 — Academy readiness convergence
Update readiness / credential panels to consume the same helper and render same authority semantics.

### Step 5 — Legacy logic quarantine verification
Any local or mixed authority logic left on these surfaces must be tagged for quarantine per Packet 049K.

## Additive Implementation Moves
1. Add one shared Wave 1 authority-consumer adapter for summary surfaces.
2. Add one shared summary-state display utility for authoritative/cached/degraded rendering.
3. Add one shared recommendation mapping utility that binds signal IDs to remediation links and next actions.
4. Add one shared readiness/credential badge mapping utility.
5. Add telemetry expectation for contradictory dashboard vs gate vs recommendation state.
6. Add migration checklist entries for each Wave 1 target surface.

## Validation Rules
Wave 1 surface migration is only acceptable if:
- dashboard summary state references canonical signal IDs
- recommendation state references the same signal IDs as gate decisions
- Academy readiness/credential surfaces use the same authority source ordering as SaaS gates
- degraded authority is rendered explicitly
- no protected-action implication is derived from route-local booleans alone

## Migration Checklist
### Dashboard
- [ ] authoritative/cached/degraded state explicit
- [ ] canonical readiness signal IDs present
- [ ] no local protected readiness booleans

### Recommendations
- [ ] uses Packet 049G cross-link objects
- [ ] aligned to Packet 049H gate decisions
- [ ] aligned to Packet 049I authority source ordering

### Academy readiness / credentials
- [ ] uses normalized authority helper
- [ ] same semantics as dashboard and gates
- [ ] degraded authority warnings present

## Non-Regression Checks
- `startLesson` unchanged
- `completeLesson` unchanged
- transcript persistence unchanged
- credential persistence unchanged
- Packet 049G cross-link rules preserved
- Packet 049H gate model preserved
- Packet 049I provider-truth ordering preserved
- Packet 049J route-consumer model preserved
- Packet 049K quarantine rules preserved
- Packet 049L inventory/queue preserved

## Acceptance Criteria
Packet 049M is complete when:
- Wave 1 target surfaces are explicitly defined as execution targets
- shared consumer requirements for dashboard, recommendation, and readiness surfaces are recorded in repo truth
- migration sequence is explicit and bounded
- validation rules prevent false convergence claims
- no LMS persistence path is modified

## Recommended File Targets
- shared dashboard authority consumer helper
- shared recommendation mapping helper
- shared readiness/credential display helper
- Wave 1 migration checklist or registry artifact
- telemetry helper for contradictory summary-state detection

## Validation Checklist
- Shared dashboard is named as a migration target.
- Shared recommendation surface is named as a migration target.
- Academy readiness / credential surface is named as a migration target.
- All three surfaces are required to share the same authority semantics.
- No LMS truth or persistence path is overwritten.

## Next Build Step
Packet 049N should define the concrete implementation patch plan for the shared dashboard authority consumer and recommendation rail convergence so Wave 1 can move from migration targeting into repo-ready code-change scope.
