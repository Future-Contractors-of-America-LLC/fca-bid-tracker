# FCA_PACKET_050E_WAVE2_EVIDENCE_INTERACTION_PATCH_PLAN

Status: Proposed  
Sequence: Follows 050D  
Scope: Concrete Wave 2 patch plan for shared evidence interaction depth, including exact target file classes, grouped-selector responsibilities, component responsibilities, apply order, validation/application order, and acceptance checks  
Truth boundary: This packet defines the Wave 2 evidence-interaction patch plan only. It does not claim that Wave 1 has already closed successfully, that Wave 2 code has already been applied, or that deploy/live convergence has been verified.

---

## 1. Issue

050D froze the Wave 2 execution boundary for shared evidence interaction depth. The next step is to convert that boundary into a concrete patch plan so implementation can proceed without drifting into schema changes, cosmetic-only UI motion, or duplicated evidence logic.

Without a patch plan:
- grouped evidence behavior may be implemented inconsistently across surfaces
- evidence summary logic may fragment into component-local calculations
- degraded-state behavior may diverge between readiness and credential surfaces
- apply order may introduce consumer patches before shared utilities exist

---

## 2. Decision

Convert the 050D execution boundary into one concrete patch plan organized into four bounded patch sets:

1. grouped evidence selectors and helpers
2. shared evidence interaction components
3. targeted surface adoption
4. validation and anti-regression artifacts

All patch sets must preserve one shared evidence truth path and one shared file spine.

---

## 3. Patch Set A — Grouped Evidence Selectors and Helpers

### Purpose
Establish one shared logic layer for grouped evidence interaction, summary state, and degraded/unresolved evidence state.

### Exact target file classes
- `src/lib/files/*`
- `src/lib/academy/*Evidence*`
- `src/lib/academy/selectors/*`

### Preferred new or extended responsibilities

#### `src/lib/files/*`
Add or extend shared selector/helper utilities for:
- grouped evidence collection
- evidence summary derivation
- evidence unresolved/degraded state mapping
- evidence sort/filter helpers

#### `src/lib/academy/selectors/*`
Add or extend selector entrypoints so readiness, credential, and recommendation surfaces can consume grouped evidence through canonical shapes instead of component-local logic.

### Exact grouped-selector responsibilities
Grouped evidence selector layer must provide, at minimum:
- `groupEvidenceByContext(...)`
- `buildEvidenceSummary(...)`
- `buildEvidenceDegradedState(...)`
- `selectGroupedReadinessEvidence(...)`
- `selectGroupedCredentialEvidence(...)`
- `selectGroupedRecommendationEvidence(...)` where canonical ids already exist

### Required behavior
- no selector may rely on raw URL arrays as evidence truth
- no selector may introduce academy-only alternate file schema
- degraded state must be explicit and structured

---

## 4. Patch Set B — Shared Evidence Interaction Components

### Purpose
Create or extend reusable UI components for grouped evidence rendering, evidence summary rendering, and degraded/missing evidence visibility.

### Exact target file classes
- `src/components/academy/*Evidence*`
- `src/components/academy/*Attachment*`
- `src/components/files/*`

### Exact component responsibilities
Components created or extended in this set should cover:

#### A. Evidence summary surface
Must display, where available:
- total linked evidence count
- unresolved/degraded count
- missing-evidence signal
- linked context label

#### B. Grouped evidence list surface
Must display grouped evidence under one or more supported context dimensions.

#### C. Evidence degraded / unresolved state surface
Must explicitly differentiate:
- no evidence exists
- evidence unresolved
- degraded linkage
- blocked/missing shared data

### Required behavior
- component state should be driven by shared selector output
- summary calculations should not be duplicated in component files
- empty-success rendering must not hide degraded state

---

## 5. Patch Set C — Targeted Surface Adoption

### Purpose
Adopt shared evidence interaction depth on the highest-value targeted surfaces already aligned in Wave 1.

### Exact target file classes
- `src/pages/academy/*Readiness*`
- `src/components/academy/*Readiness*`
- `src/pages/academy/*Credential*`
- `src/components/academy/*Credential*`
- limited recommendation/detail surfaces only where canonical ids already exist
- limited project/evidence surfaces only where shared file-spine truth already exists

### Exact adoption responsibilities

#### Readiness surfaces
- adopt grouped readiness evidence selector output
- render evidence summary
- render grouped evidence interaction surface
- render explicit unresolved/degraded state

#### Credential surfaces
- adopt grouped credential evidence selector output
- render evidence summary
- render grouped evidence interaction surface
- render explicit unresolved/degraded state

#### Recommendation-linked surfaces
- adopt grouped recommendation evidence only where canonical ids already exist
- do not fabricate linkage where canonical ids are missing

### Required behavior
- no targeted surface may revert to local attachment truth
- no targeted surface may duplicate grouped-evidence calculations already defined in shared helpers
- no targeted surface may mask degraded evidence as success-like emptiness

---

## 6. Patch Set D — Validation and Anti-Regression

### Purpose
Make evidence-depth execution auditable and enforce anti-schema-drift and unresolved-state visibility.

### Exact target file classes
- `docs/*`
- `scripts/*` only if lightweight and safe

### Required responsibilities
- record Wave 2 evidence-depth validation checklist
- record anti-schema-drift check
- record unresolved/degraded evidence visibility check
- record acceptance pass/fail outcome

### Required outputs
At minimum, create a repo-visible validation artifact such as:
- `docs/FCA_PACKET_050E_WAVE2_EVIDENCE_INTERACTION_VALIDATION.md`

Optional lightweight script allowed only if it directly supports the above checks without expanding scope.

---

## 7. Exact Apply Order

Apply 050E in this order:

1. inspect current shared file/evidence utilities
2. patch grouped evidence selectors/helpers
3. patch degraded/unresolved evidence state helpers
4. patch shared evidence interaction components
5. patch readiness adoption surfaces
6. patch credential adoption surfaces
7. patch recommendation-linked adoption only where canonical ids already exist
8. create validation artifact
9. run validation checks
10. confirm no forbidden scope entered the patch set

### Apply rule
No targeted surface adoption begins before grouped selectors and degraded-state helpers exist.

---

## 8. Validation / Application Order

Use this exact validation order.

### Validation 1 — shared truth validation
Confirm:
- grouped selectors route through shared file/evidence truth
- no raw URL arrays or local-only attachment truth were introduced

### Validation 2 — component responsibility validation
Confirm:
- evidence summary logic is not duplicated in multiple component files
- grouped rendering uses shared selector output
- degraded states are not swallowed by empty-state logic

### Validation 3 — adopting surface validation
Confirm:
- readiness surfaces use grouped readiness evidence path
- credential surfaces use grouped credential evidence path
- recommendation-linked evidence remains attributable where used

### Validation 4 — anti-schema-drift validation
Confirm:
- no academy-only alternate evidence/file schema was introduced
- no surface-specific ad hoc evidence object became canonical

### Validation 5 — truth-boundary validation
Confirm:
- all documentation and status language remains repo-truth-bounded
- no deploy/live completion claim is made without separate proof

---

## 9. Acceptance Checks

050E patching is acceptable only if all checks pass:

- grouped evidence selector layer exists
- evidence summary helper layer exists
- degraded/unresolved evidence helper layer exists
- shared evidence interaction components exist or are extended coherently
- readiness evidence interaction depth improved on targeted surfaces
- credential evidence interaction depth improved on targeted surfaces
- no targeted surface regressed to local attachment truth
- validation artifact exists
- no forbidden scope entered the lane

---

## 10. Forbidden Scope Reminder

The following remain out of bounds during 050E:
- storage-provider implementation changes
- academy-only evidence/file schema
- unrelated dashboard redesign
- unrelated auth or route work
- deploy-pipeline redesign
- live or deploy success claims without separate verification

If any appears in the patch, the patch plan is out of compliance.

---

## 11. Recommended Execution Output Format

For each 050E execution cycle, report:

### Issue
What evidence-depth defect or limitation was being addressed.

### Risk
What drift, false utility, or schema-fragmentation risk existed.

### Fix
What selector/component/surface patch set was applied.

### Validation
Which acceptance and anti-drift checks passed or failed.

### Updated system state
What is now true in repo truth and what remains unresolved.

### Next action
The exact next bounded patch or follow-on Wave 2 artifact.

---

## 12. Founder Hands-Off Rule

050E execution should not require founder routing under normal conditions.

Do not escalate for:
- ordinary grouped-selector design
- ordinary component responsibility enforcement
- ordinary validation artifact creation

Escalate only if:
- repo truth for shared evidence linkage cannot be determined
- a required patch would materially fork product direction
- deploy verification is required and externally blocked

---

## 13. Definition of Done

050E is complete when:
- patch sets are frozen
- grouped-selector responsibilities are frozen
- component responsibilities are frozen
- target surface adoption responsibilities are frozen
- exact apply order is frozen
- validation/application order is frozen
- acceptance checks are frozen
- next artifact is identified

---

## 14. Next Artifact

**FCA_PACKET_050F_WAVE2_EVIDENCE_INTERACTION_BRANCH_STARTER.md**

This next artifact must convert the 050E patch plan into an execution-starter packet with exact branch scope, PR starter, validation note, merge gate summary, and post-merge repo-truth statement for the first Wave 2 evidence-depth branch.
