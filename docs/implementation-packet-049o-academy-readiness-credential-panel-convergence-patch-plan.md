# Implementation Packet 049O — Academy Readiness / Credential Panel Convergence Patch Plan

## Issue
Packet 049N defined the shared dashboard and recommendation-rail convergence patch scope, but Wave 1 remains incomplete until the Academy-facing readiness and credential panels consume the same normalized authority semantics. Without this patch plan, SaaS can move toward converged authority while Academy still presents parallel or cosmetically normalized truth.

## Risk
If Academy readiness / credential panels do not converge now:
- SaaS gate decisions can disagree with Academy learner-facing status panels
- credential expiry or missing-readiness states can render inconsistently across SaaS and LMS
- Academy remediation destinations can appear disconnected from the same authority signals driving blocked SaaS actions
- users can see “ready” in Academy while being blocked in SaaS, or vice versa

## Non-Destructive Rule
Packet 049O is a repo-ready patch-plan artifact only.

Do **not** in this packet:
- overwrite lesson progression
- rewrite transcript, credential, or readiness persistence
- invent completion or credential verification locally
- change provider/API write behavior
- mark Academy surfaces authoritative before migration and validation complete

## Objective
Define the concrete implementation patch scope for Academy-facing:
1. readiness summary panels
2. credential status panels
3. remediation entry points
4. degraded/cached/authoritative authority rendering

## Patch Scope
### Surface A — Academy readiness summary panel
**Likely paths:** `/academy`, `/academy/readiness`

**Target intent**
- consume normalized readiness authority
- display ready / warning / blocked states using canonical signal IDs
- show authoritative / cached / degraded truth explicitly
- align readiness semantics with SaaS gates and dashboard summaries

### Surface B — Academy credential panel
**Likely paths:** `/academy/credentials`, readiness-adjacent summary cards

**Target intent**
- consume normalized credential authority
- display active / expiring / expired / missing / unverified states
- surface jurisdiction / expiry / verification information from canonical signals
- align credential semantics with protected SaaS action requirements

### Surface C — Academy remediation launch surfaces
**Likely targets:** checklist cards, micro-remediation cards, pathway steps, lesson-detail entry links

**Target intent**
- launch from canonical remediation link objects
- preserve workspace / blocked-action context
- reflect the same reason codes shown in SaaS warning/block states
- never simulate remediation completion locally

## Required Shared Modules
### 1. `academyReadinessPanelConsumer`
Purpose:
- accept normalized authority payload
- derive readiness panel state from canonical readiness signals
- expose authoritative / cached / degraded state

Expected outputs:
- `readinessSummary`
- `blockedReadinessSignals`
- `warningReadinessSignals`
- `degradedAuthorityWarnings`

### 2. `academyCredentialPanelMapper`
Purpose:
- map normalized credential signals into panel-friendly display objects
- centralize active / expiring / expired / missing / unverified semantics
- preserve required-for relationships used by SaaS gates

Expected outputs:
- `credentialCards`
- `credentialWarnings`
- `expiringSoonSignals`
- `verificationNotices`

### 3. `academyRemediationEntryMapper`
Purpose:
- translate canonical remediation link objects into Academy-entry cards/buttons
- preserve source signal IDs and reason codes
- maintain workspace context for return-to-SaaS flow

Expected outputs:
- `remediationEntries`
- `linkedReasonLabels`
- `returnContext`

### 4. `academyAuthorityDisplay`
Purpose:
- ensure Academy-facing display semantics for authoritative/cached/degraded match SaaS dashboard/recommendation semantics

Expected outputs:
- consistent badge tokens
- consistent warning copy tokens
- consistent degraded-state banners

## Concrete Patch Plan
### Patch 1 — Academy authority-consumer binding
Create or bind one shared Academy-facing helper that:
- ingests normalized authority from Packet 049I
- exposes route-safe readiness and credential panel fields
- references canonical signal IDs only
- preserves degraded-state metadata

### Patch 2 — Readiness panel migration
Update Academy readiness summary surfaces so that:
- blocked / warning / ready state comes from canonical readiness signals
- route-local readiness assumptions are removed or quarantined
- degraded/cached state is visible to the user

### Patch 3 — Credential panel migration
Update Academy credential surfaces so that:
- credential status is derived from canonical credential signals
- expiry / verification messaging uses shared semantics
- required-for relationships remain visible where gating relevance exists

### Patch 4 — Remediation entry convergence
Update Academy remediation launch surfaces so that:
- entry cards and buttons use canonical remediation link objects from Packet 049G
- displayed reason labels align with Packet 049H gate reason codes
- return context to SaaS surfaces is preserved when relevant

### Patch 5 — Residual local logic quarantine
If readiness or credential panels still depend on local route booleans or display-only inference:
- isolate that logic
- tag the route as mixed/legacy per Packet 049K
- emit route-authority telemetry
- do not treat the panel as fully converged

## Suggested Repo Targets
These are patch-target categories, not yet claims of exact live file locations:
- Academy readiness summary component(s)
- Academy credential panel component(s)
- Academy remediation card / checklist / pathway entry components
- shared authority helper/state consumer modules
- shared display utility for authority-state and signal-label rendering
- telemetry helper for contradictory or degraded Academy authority rendering

## Required Data Contracts
### Academy readiness panel input
- normalized readiness signals
- degraded/provider metadata
- gate relevance metadata where applicable
- Auricrux reason metadata for learner-facing explanations

### Academy credential panel input
- normalized credential signals
- issuer / jurisdiction / expiry / verification fields
- required-for mappings
- degraded/provider metadata

### Academy remediation entry input
- canonical remediation link objects
- reason codes and labels
- source signal IDs
- workspace / return context

## Required Validation Rules
The patch is only acceptable if:
- Academy readiness panels point to canonical readiness signal IDs
- Academy credential panels point to canonical credential signal IDs
- Academy display semantics match SaaS dashboard and gate semantics
- remediation entries remain provider-truth aligned and do not simulate completion
- degraded authority renders explicitly on Academy surfaces
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
- Packet 049M Wave 1 migration targets preserved
- Packet 049N dashboard/recommendation patch scope preserved

## Acceptance Criteria
Packet 049O is complete when:
- one explicit patch scope exists for Academy readiness panel convergence
- one explicit patch scope exists for Academy credential panel convergence
- one explicit patch scope exists for Academy remediation entry convergence
- shared module responsibilities are named
- validation and non-regression boundaries are explicit
- no LMS persistence path is modified

## Validation Checklist
- Readiness panel patch scope is explicit.
- Credential panel patch scope is explicit.
- Remediation entry patch scope is explicit.
- Shared Academy authority-display convergence is explicit.
- Residual mixed/legacy logic quarantine is explicit.
- No LMS truth or persistence path is overwritten.

## Next Build Step
Packet 049P should define the combined Wave 1 implementation cut plan so dashboard, recommendation rail, readiness, and credential panel convergence can be executed as one bounded migration set without undoing LMS progress or SaaS authority alignment.
