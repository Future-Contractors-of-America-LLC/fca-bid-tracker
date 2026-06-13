# Implementation Packet 049N — Shared Dashboard Authority Consumer and Recommendation Rail Convergence Patch Plan

## Issue
Packet 049M identified the Wave 1 migration targets, but execution still needs a concrete patch-plan artifact for the first repo-facing implementation scope: the shared dashboard authority consumer and the shared Auricrux recommendation rail. Without a bounded patch plan, Wave 1 remains directional rather than executable.

## Risk
If the first code-facing convergence patch is not explicitly bounded:
- dashboard summaries can continue using mixed or route-local truth
- recommendation rails can continue drifting from gate and readiness state
- Academy remediation links can be suggested without matching current authority signals
- subsequent route migration work can fan out inconsistently across SaaS and LMS surfaces

## Non-Destructive Rule
Packet 049N is a repo-ready patch-plan artifact only.

Do **not** in this packet:
- overwrite lesson progression
- rewrite transcript, credential, or readiness persistence
- mark surfaces authoritative before implementation and validation complete
- change provider/API write semantics
- introduce local-only fallback as final truth for summary or recommendation surfaces

## Objective
Define the concrete implementation patch scope for:
1. shared dashboard authority consumption
2. shared recommendation rail convergence
3. shared summary-state rendering semantics
4. signal-ID aligned remediation links

## Patch Scope
### Surface A — Shared dashboard summary / status surface
**Target intent**
- consume normalized authority object
- display authoritative/cached/degraded state
- summarize blocked/warned/ready conditions
- surface canonical readiness and credential state without route-local derivation

### Surface B — Shared Auricrux recommendation rail
**Target intent**
- consume same normalized authority object used by dashboard and gates
- show recommended next actions, warnings, and remediation targets
- never contradict active block or warning states
- preserve Packet 049G cross-link structure for Academy links

## Required Shared Modules
### 1. `dashboardAuthorityConsumer`
Purpose:
- accept normalized authority payload
- derive summary cards/badges/banners from canonical signal IDs
- expose authoritative/cached/degraded status

Expected outputs:
- `summaryState`
- `blockedActions`
- `warningActions`
- `readySignals`
- `degradedWarnings`

### 2. `recommendationRailMapper`
Purpose:
- convert canonical signals + gate decisions into recommendation items
- preserve remediation link targets
- align recommendation reason labels with gate reason codes

Expected outputs:
- `recommendations`
- `remediationLinks`
- `blockedReasonLabels`
- `degradedAuthorityNotice`

### 3. `summaryAuthorityDisplay`
Purpose:
- centralize rendering semantics for authoritative/cached/degraded
- centralize status labels for ready/warning/blocked and credential states

Expected outputs:
- consistent badges
- consistent banners
- consistent warning copy tokens

## Concrete Patch Plan
### Patch 1 — Shared authority-consumer adapter
Create or normalize one helper that:
- ingests canonical authority object from Packet 049I
- exposes route-safe summary fields
- references canonical signal IDs
- preserves degraded-state metadata

### Patch 2 — Dashboard summary migration
Update the shared dashboard surface so that:
- summary cards use authority-consumer output
- blocked/warned states are derived from canonical signals only
- local route booleans are removed from protected summary decisions or clearly quarantined

### Patch 3 — Recommendation rail migration
Update the shared recommendation surface so that:
- recommendations map from the same signal IDs used by gates
- remediation links use Packet 049G cross-link objects
- blocked actions and warnings use the same reason codes as Packet 049H gate decisions
- degraded authority is shown explicitly when provider truth is stale or missing

### Patch 4 — Shared display convergence
Move dashboard and recommendation copy/status rendering onto one shared display utility so semantics remain identical across SaaS and Academy-adjacent surfaces.

### Patch 5 — Quarantine residual local logic
If either surface still depends on local route booleans:
- isolate that path
- tag it as mixed/legacy per Packet 049K
- emit route-authority telemetry
- do not treat the surface as fully converged

## Suggested Repo Targets
These are target categories, not yet claimed as exact live file paths:
- shared authority helper module under a common state / helpers area
- shared dashboard component or dashboard summary panel
- shared Auricrux recommendation rail / panel component
- shared display utility for authority-state and status-label rendering
- telemetry helper for contradiction / degraded / legacy-authority detection

## Required Data Contracts
### Dashboard authority consumer input
- normalized readiness signals
- normalized credential signals
- normalized training signals
- normalized telemetry signals
- gate decisions
- degraded/provider metadata

### Recommendation rail input
- same normalized authority payload
- gate decisions
- remediation target links
- route/workspace context
- Auricrux reason metadata

## Required Validation Rules
The patch is only acceptable if:
- dashboard badges and recommendation items can point to canonical signal IDs
- recommendation rails do not contradict active gate decisions
- degraded authority renders explicitly on both surfaces
- Academy remediation links remain provider-truth aligned and do not simulate completion
- no LMS progress or credential persistence path is modified

## Non-Regression Checks
- `startLesson` unchanged
- `completeLesson` unchanged
- transcript persistence unchanged
- credential persistence unchanged
- Packet 049G cross-link rules preserved
- Packet 049H gate model preserved
- Packet 049I authority ordering preserved
- Packet 049J route-consumer convergence preserved
- Packet 049K quarantine rules preserved
- Packet 049L inventory/queue preserved
- Packet 049M Wave 1 migration targeting preserved

## Acceptance Criteria
Packet 049N is complete when:
- one explicit patch scope exists for dashboard authority consumption
- one explicit patch scope exists for recommendation rail convergence
- shared module responsibilities are named
- validation rules and non-regression boundaries are explicit
- no LMS persistence path is modified

## Validation Checklist
- Dashboard patch scope is explicit.
- Recommendation rail patch scope is explicit.
- Shared status-display convergence is explicit.
- Residual mixed/legacy logic quarantine is explicit.
- No LMS truth or persistence path is overwritten.

## Next Build Step
Packet 049O should define the concrete Academy readiness/credential panel convergence patch plan so the Academy-facing half of Wave 1 migrates under the same normalized authority semantics as the dashboard and recommendation rail.
