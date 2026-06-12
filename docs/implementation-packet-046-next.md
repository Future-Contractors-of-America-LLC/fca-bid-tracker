# Implementation Packet 046 — Unified SaaS + LMS Spine Continuation

## Issue
The repository now contains real SaaS routes, Academy/LMS routes, customer login surfaces, seeded server-session auth endpoints, governed lead intake, opportunity qualification, opportunity-to-project conversion, and project/file workspace surfaces. But the product truth is still split across parallel runtime layers:
- lead and opportunity conversion live in `api/leads-store.js`
- project workspace reads still come from `api/workspace-read-models.js`
- SaaS and LMS are visually connected, but their shared execution state is not yet enforced as one canonical spine
- the current auth path is valid for seeded validation, but not yet a managed first-customer release path

## Risk
If work continues as separate SaaS and LMS fragments, FCA will drift back into disconnected surfaces:
- opportunity conversion can claim project creation without guaranteeing the converted project appears in the canonical workspace read model
- Academy can present a strong LMS surface without being tied to live project readiness, assignments, and controlled feature access
- login can appear real while still stopping short of a single release-grade customer entry path
- founder dependence rises because continuity must be manually interpreted instead of system-enforced

## Decision
Proceed with a single bounded next packet focused on the shared SaaS + LMS spine, not broad feature expansion.

### Packet 046 scope lock
Packet 046 should connect these four truths into one governed runtime path:
1. **Lead / Opportunity / Project handoff**
2. **Project workspace read model alignment**
3. **Academy assignment tied to live project readiness**
4. **Customer login entitlement truth across SaaS, LMS, and Auricrux**

This is the highest-priority continuation because it strengthens:
- founder hands-off operation
- flagship product definition
- deployment truth vs repo truth alignment
- customer-facing utility
- release readiness for one unified SaaS + LMS product

## Exact build target

### A. Canonical conversion bridge
When `POST /api/opportunities/{opportunityId}/convert-to-project` succeeds, the created project must be available from the same canonical project workspace layer used by:
- `/api/projects`
- `/api/projects/{projectId}/workspace`
- portal project list/detail routes

### B. LMS-to-project readiness bridge
Academy assignment and readiness must stop being narrative-only. The next packet should define and wire a governed assignment/readiness object with at least:
- `assignmentId`
- `tenantId`
- `projectId`
- `programKey`
- `learnerId`
- `status`
- `dueAt`
- `completionPercent`
- `credentialImpact`
- `featureGateEffect`
- audit events

### C. Auth-to-entitlement truth bridge
The current seeded server-session path is acceptable for bounded validation, but Packet 046 must ensure the customer session returned by API truth is the same source used by:
- route protection
- product access status panels
- Academy readiness overlays
- Auricrux launch controls

### D. Unified release gate
No “SaaS release” and “LMS release” split. Packet 046 should prepare one release gate stating FCA ships when:
- customer can authenticate
- customer can enter SaaS workspace
- customer can enter Academy/LMS
- Academy readiness affects real workflow state
- Auricrux can explain and route next action across both

## Repo-facing implementation plan

### Step 1 — Project read-model reconciliation
Create or patch the canonical read layer so converted opportunities are materialized into the same project store used by workspace endpoints.

**Files most likely involved**
- `api/opportunity-convert.js`
- `api/leads-store.js`
- `api/projects.js`
- `api/projects-workspace.js`
- `api/workspace-read-models.js`

**Acceptance result**
A converted opportunity appears in both project listing and project workspace detail without parallel-store ambiguity.

### Step 2 — Academy assignment store and endpoint
Add a governed Academy assignment path so LMS readiness is attached to real project context rather than static page content.

**Suggested files**
- `api/academy-store.js` or sibling governed module
- `api/academy-lms.js`
- new endpoint such as `api/academy-assignments.js`
- optional `api/projects/{projectId}/academy-readiness` follow-on path in later packet if needed

**Minimum behaviors**
- assign learner to project-linked program
- update assignment progress
- emit audit trail
- return feature gate / readiness signal for workspace usage

### Step 3 — Workspace state consumption alignment
Patch front-end workspace state consumers so Academy and SaaS surfaces read the same live readiness signal.

**Files most likely involved**
- `src/pages/academy/AcademyHome.jsx`
- `src/components/AcademyReadinessOverlay.jsx`
- `src/components/ProductAccessStatusPanel.jsx`
- `src/hooks/useWorkspaceState.js`
- `src/systemState.js`

**Acceptance result**
The Academy surface shows project-linked readiness from runtime data, not only seeded static display content.

### Step 4 — Release contract artifact
Add one explicit release-gate artifact for the unified SaaS + LMS launch.

**Suggested doc**
- `docs/unified-saas-lms-release-gate.md`

## Validation required before calling Packet 046 complete
1. `POST /api/opportunities/{id}/convert-to-project` returns success.
2. The converted project appears in `/api/projects`.
3. The same `projectId` resolves through `/api/projects/{projectId}/workspace`.
4. An Academy assignment can be created against that `projectId`.
5. Academy readiness state is visible on at least one SaaS surface and one LMS surface.
6. Customer session still grants/blocks SaaS, LMS, and Auricrux correctly.
7. No regression to `/api/run-task`, `/api/customer-login`, `/api/customer-session`, or existing portal routes.

## Boundary truth
This packet is intentionally not trying to finish all LMS accreditation, all trades, or all construction lifecycle modules at once. It is the spine packet that makes SaaS + LMS one product instead of two adjacent surfaces.

## Next build step
Execute Packet 046 in code with this order:
1. canonical project conversion bridge
2. academy assignment/readiness API path
3. front-end workspace state reconciliation
4. unified release gate artifact

Until that is done, FCA should be described truthfully as **a seeded but increasingly real unified SaaS + LMS runtime under active spine hardening**, not as a fully release-ready managed customer platform.
