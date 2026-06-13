# FCA_PACKET_050C_WAVE2_STARTER_EVIDENCE_INTERACTION_DEPTH

Status: Proposed  
Sequence: Follows 050B  
Scope: First bounded Wave 2 starter focused on shared evidence interaction depth and operational utility across the unified SaaS + LMS spine  
Truth boundary: This packet defines the first Wave 2 starter only. It does not claim that Wave 1 has already closed successfully, that Wave 2 code is already implemented, or that deploy/live convergence has been verified.

---

## 1. Issue

050B established Wave 2 entry criteria and recommended evidence interaction depth as the first Wave 2 lane. The system now needs an exact starter boundary so evidence utility can deepen without fragmenting the shared file spine, reintroducing local truth, or drifting into unrelated redesign.

Without an exact Wave 2 starter:
- evidence may remain merely attached rather than operationally useful
- Academy and SaaS evidence surfaces may deepen inconsistently
- folder-aware evidence interaction may split into parallel product lanes
- utility work may sprawl beyond the flagship Contractor Command spine

---

## 2. Decision

Freeze the first bounded Wave 2 lane as **shared evidence interaction depth**.

### Wave 2 starter objective
Improve evidence usability across shared SaaS + LMS surfaces while preserving:
- one auth boundary
- one entitlement model
- one shared file spine
- one audit/evidence model
- one unified product direction

### Why this lane first
Wave 1 established shared state and first-pass evidence linkage. The highest-value next move is to make evidence operationally useful to real users in context.

---

## 3. Wave 2 Starter Boundary

### Allowed in 050C lane
- evidence drawer/panel utility depth
- grouped evidence views by readiness / credential / project context
- stronger evidence filtering and sorting behavior
- evidence-summary presentation improvements tied to shared selectors
- remediation-to-evidence interaction reinforcement
- evidence validation hardening tied to shared selectors

### Not allowed in 050C lane
- alternate file storage architecture
- academy-only or SaaS-only evidence schemas
- broad unrelated UI redesign
- new unrelated product lanes
- deploy-surface redesign
- production/live readiness claims without verification artifacts

---

## 4. Product Spine Alignment

This lane is valid only because it strengthens the flagship FCA Contractor Command shared spine:

- lead / opportunity continuity indirectly through evidence readiness
- project / job evidence handling directly
- qualification / remediation utility directly
- client / internal trust surfaces directly
- auditability and explanation depth directly

This lane must remain shared between SaaS and LMS wherever the same evidence objects are in play.

---

## 5. Canonical Wave 2 Target Outcomes

Wave 2 starter should deepen evidence interaction in the following ways:

### 5.1 Evidence visibility
Users can see what evidence is linked, why it matters, and what object it supports.

### 5.2 Evidence grouping
Evidence can be grouped by at least one or more of:
- readiness state
- credential state
- recommendation state
- project context
- academy context
- folder grouping if available from shared file spine

### 5.3 Evidence actionability
Evidence surfaces should support operational next steps such as:
- open
- inspect summary
- identify missing evidence
- follow linked remediation
- follow linked readiness/credential object

### 5.4 Evidence degradation clarity
Users must be able to distinguish:
- no evidence exists
- evidence exists but is unresolved
- evidence linkage is degraded
- evidence is blocked by permissions or missing shared data

---

## 6. Suggested Exact Wave 2 Surface Classes

Inspect and target only evidence-interaction surfaces tied to the existing shared spine.

### Candidate target classes
- `src/components/academy/*Evidence*`
- `src/components/academy/*Attachment*`
- `src/components/files/*`
- `src/pages/academy/*Readiness*`
- `src/pages/academy/*Credential*`
- `src/components/academy/*Readiness*`
- `src/components/academy/*Credential*`
- limited shared project/context evidence viewers where the same shared file spine is already referenced

### Supporting selector/utilities
- `src/lib/files/*`
- `src/lib/academy/*Evidence*`
- `src/lib/academy/selectors/*`

### Forbidden target classes at this stage
- unrelated dashboard redesign files
- unrelated routing/auth files
- storage provider/environment configuration
- unrelated payment/commercial modules

---

## 7. Required Wave 2 Starter Behaviors

### Evidence grouping behavior
Evidence rendering should support grouped display by at least one canonical context dimension.

### Evidence summary behavior
Where safe, evidence surfaces should display concise shared summary state such as:
- count
- latest linked item
- unresolved count
- missing-evidence signal

### Evidence navigation behavior
Evidence surfaces should support navigation from:
- readiness → evidence
- credential → evidence
- recommendation → evidence where canonical ids already exist
- evidence → linked source object

### Evidence truth behavior
Evidence interaction must remain selector-driven and file-spine-driven.
No raw URL arrays or local-only attachment truth may re-enter targeted surfaces.

---

## 8. Wave 2 Starter Entry Checks

Before starting 050C implementation or deeper Wave 2 artifacts, confirm:

- [ ] Wave 1 closeout passed or equivalent repo-truth pass is recorded
- [ ] shared file/evidence linkage is authoritative on targeted Wave 1 surfaces
- [ ] no academy-only alternate file schema exists
- [ ] no targeted surface regressed to local/provider-shaped truth
- [ ] chosen Wave 2 evidence depth work remains bounded to the flagship spine

If any check fails, do not begin Wave 2 execution. Produce remediation or re-audit instead.

---

## 9. Wave 2 Starter PR / Artifact Direction

The next concrete Wave 2 artifact after 050C should convert this starter into an exact execution boundary with:
- exact target files
- exact apply order
- exact validation rules
- exact acceptance criteria
- truth-boundary language

This should happen before implementation branching begins.

---

## 10. Validation Rules for 050C Lane

Any later Wave 2 evidence-depth work must satisfy all of the following:

### Rule 1 — shared spine only
No targeted evidence surface may bypass the shared file/evidence selector path.

### Rule 2 — no schema drift
No academy-only alternate evidence schema may be introduced.

### Rule 3 — degradation clarity
No targeted evidence surface may hide unresolved evidence behind a success-like empty state.

### Rule 4 — utility over polish
Evidence interaction improvements must improve real user utility, not just visual polish.

### Rule 5 — bounded continuation
Every deeper evidence artifact must end with explicit next-step boundary and acceptance criteria.

---

## 11. Wave 2 Starter Output Format

When advancing this lane, use:

### Issue
What evidence-utility problem remains after Wave 1.

### Risk
What drift or false-utility risk exists.

### Fix
What bounded evidence-depth improvement is being introduced.

### Validation
What selector, grouping, unresolved-state, and anti-schema-drift checks were applied.

### Updated system state
What is now true in repo-planning or repo truth, and what remains unresolved.

### Next action
The exact next Wave 2 artifact or bounded implementation branch.

---

## 12. Founder Hands-Off Rule

This Wave 2 starter should not require founder routing under normal conditions.

Do not escalate for:
- ordinary evidence utility scoping
- ordinary repo-truth continuity checks
- ordinary anti-drift validation

Escalate only if:
- a proposed evidence-depth step materially forks product strategy
- repo truth for shared evidence linkage cannot be determined
- deployment verification is required and externally blocked

---

## 13. Definition of Done

050C is complete when:
- the first Wave 2 lane is frozen
- scope boundary is frozen
- product-spine justification is frozen
- required target surface classes are frozen
- validation rules are frozen
- next artifact is identified

---

## 14. Next Artifact

**FCA_PACKET_050D_WAVE2_EVIDENCE_INTERACTION_EXECUTION_BOUNDARY.md**

This next artifact must convert the Wave 2 evidence-depth starter into exact execution scope, exact target files/classes, apply order, validation gates, and acceptance criteria.
