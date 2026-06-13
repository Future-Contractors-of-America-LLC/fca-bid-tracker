# FCA_PACKET_049R_WAVE1_BRANCH_BY_BRANCH_EXECUTION_PLAN

Status: Proposed  
Sequence: Follows 049Q  
Scope: Branch-by-branch execution plan for Wave 1 Academy authority convergence, recommendation rail convergence, readiness/credential panel convergence, and shared file/evidence linkage  
Truth boundary: This packet defines the execution plan and branch sequencing only. It does not claim that the code patches have already been applied, merged, deployed, or validated live.

---

## 1. Issue

049Q fixed the exact patch targets, but execution can still drift unless the repo work is cut into controlled branches with explicit commit groupings, PR boundaries, and merge-readiness checks.

Without branch-by-branch control:
- normalization work can get mixed with UI rewrites
- recommendation convergence can drift ahead of readiness/credential truth
- evidence linkage can be added before shared contracts stabilize
- regression accountability becomes weak

---

## 2. Decision

Execute Wave 1 in **four implementation branches** and **one optional reconciliation branch**.

### Required branch order
1. `packet-049r-branch-a-shared-contracts-normalization`
2. `packet-049r-branch-b-dashboard-recommendation-convergence`
3. `packet-049r-branch-c-readiness-credential-panel-convergence`
4. `packet-049r-branch-d-evidence-linkage-validation`

### Optional branch
5. `packet-049r-branch-e-post-merge-reconciliation`

No later branch starts merge until earlier branch merge-readiness is satisfied or an explicit bounded exception is recorded.

---

## 3. Branch A — Shared Contracts and Normalization

### Branch name
`packet-049r-branch-a-shared-contracts-normalization`

### Purpose
Land the shared Academy authority/readiness/credential/recommendation contracts and normalization utilities before consumer patching.

### Scope
From 049Q Patch Set A only.

### Exact work groups

#### Commit group A1 — canonical types
Create:
- `src/lib/academy/authorityConsumerState.ts`
- `src/lib/academy/readinessState.ts`
- `src/lib/academy/credentialState.ts`
- `src/lib/academy/recommendationState.ts`
- `src/lib/academy/academyEvidenceLink.ts`

#### Commit group A2 — normalization utilities
Create:
- `src/lib/academy/normalizeAcademyStatus.ts`
- `src/lib/academy/normalizeAuthorityWarnings.ts`

#### Commit group A3 — shared selector/adaptor entrypoint
Create or patch shared selector/adaptor location, preferably:
- `src/lib/academy/selectors/index.ts`
- plus any required selector modules

### PR title
`Wave 1 Branch A: shared academy contracts and normalization`

### Merge readiness criteria
- all canonical types compile or are syntactically valid for the repo language mix
- no component files define duplicate normalized status enums
- selectors/adaptors expose degraded fallback paths
- no UI component patch is included except minimal import-safe wiring stubs

### Must not include
- dashboard JSX logic rewrites
- recommendation rendering changes
- readiness/credential UI changes
- file attachment components

---

## 4. Branch B — Dashboard and Recommendation Convergence

### Branch name
`packet-049r-branch-b-dashboard-recommendation-convergence`

### Purpose
Move dashboard-level consumers and recommendation rails onto shared authority and normalized recommendation state.

### Dependency
Branch A merged first.

### Scope
From 049Q Patch Set B only.

### Exact work groups

#### Commit group B1 — dashboard authority consumer replacement
Patch:
- academy dashboard overview page(s)
- academy overview card components
- shared authority warning rendering zones

#### Commit group B2 — recommendation state adoption
Patch:
- recommendation rail/list/card components
- provider/raw payload adapters removed from component-local logic

#### Commit group B3 — degraded and warning rendering
Patch:
- explicit unresolved authority states
- explicit empty-state vs degraded-state distinction

### PR title
`Wave 1 Branch B: dashboard and recommendation convergence`

### Merge readiness criteria
- no dashboard surface reads raw provider authority directly when selector exists
- recommendation components consume normalized recommendation state
- degraded warning state is visible and testable
- no readiness/credential panel rewrites included yet

### Must not include
- readiness panel convergence
- credential panel convergence
- evidence attachment rendering
- folder/file schema work beyond imports required for typing

---

## 5. Branch C — Readiness and Credential Panel Convergence

### Branch name
`packet-049r-branch-c-readiness-credential-panel-convergence`

### Purpose
Converge readiness and credential panels onto the shared state contract after overview consumers are stable.

### Dependency
Branch B merged first.

### Scope
From 049Q Patch Sets C and D.

### Exact work groups

#### Commit group C1 — readiness panel contract adoption
Patch:
- readiness page components
- readiness detail/summary panels
- readiness status badge rendering

#### Commit group C2 — credential panel contract adoption
Patch:
- credential page components
- credential detail/summary panels
- certificate/expiration/review zones

#### Commit group C3 — stale/unavailable/incomplete handling
Patch:
- warning regions
- canonical status badge mapping
- missing evidence and review-needed distinction

### PR title
`Wave 1 Branch C: readiness and credential panel convergence`

### Merge readiness criteria
- readiness panels use `ReadinessState`
- credential panels use `CredentialState`
- canonical statuses only
- `expired`, `missing_evidence`, `needs_review`, and `in_progress` are not collapsed together
- recommendation link hooks remain compatible with shared IDs

### Must not include
- evidence attachment component creation beyond temporary stubs
- broad dashboard rewrites
- selector contract redesign already handled by Branch A

---

## 6. Branch D — Evidence Linkage and Validation

### Branch name
`packet-049r-branch-d-evidence-linkage-validation`

### Purpose
Bind readiness/credential/recommendation surfaces to shared file spine references and add anti-regression validation.

### Dependency
Branch C merged first.

### Scope
From 049Q Patch Set E and validation rules.

### Exact work groups

#### Commit group D1 — shared evidence selector layer
Create:
- `src/lib/files/academyEvidenceSelectors.ts`

Patch existing shared file selectors if needed.

#### Commit group D2 — academy evidence components
Create:
- `src/components/academy/AcademyEvidenceAttachmentList.jsx` or `.tsx`
- `src/components/academy/AcademyEvidenceAttachmentSummary.jsx` or `.tsx`

#### Commit group D3 — panel linkage
Patch:
- readiness panels to render supporting evidence
- credential panels to render evidence attachments
- recommendation panels where applicable to render linked source evidence

#### Commit group D4 — anti-regression validation artifact
Create repo-visible validation artifact, preferably one or more of:
- `docs/FCA_PACKET_049R_WAVE1_VALIDATION_CHECKLIST.md`
- lightweight script under `scripts/` for static checks if safe

### PR title
`Wave 1 Branch D: academy evidence linkage and validation`

### Merge readiness criteria
- all evidence attachment rendering resolves through shared file/evidence selectors
- no ad hoc academy-only file shape introduced
- unresolved evidence state is explicit
- validation artifact is present and readable

### Must not include
- unrelated storage provider rewrites
- unrelated deployment changes
- broad aesthetic redesign

---

## 7. Optional Branch E — Post-Merge Reconciliation

### Branch name
`packet-049r-branch-e-post-merge-reconciliation`

### Purpose
Only used if merge sequencing reveals small conflicts, import cleanup, or duplicated warning text that should be reconciled after Branches A–D.

### Acceptable scope
- import cleanup
- dead-code cleanup created by the branch sequence
- final warning copy harmonization
- selector path cleanup

### Forbidden scope
- new features
- new persistence model
- new route behavior
- dashboard redesign

---

## 8. PR Order

### Required PR order
1. Branch A PR
2. Branch B PR
3. Branch C PR
4. Branch D PR
5. optional Branch E PR

### Review posture
- request Copilot review after each PR creation if available
- merge only after branch-specific readiness criteria are confirmed
- do not stack hidden changes into later PRs to “save time”

---

## 9. Validation Handoff Steps

### After Branch A
Validate:
- canonical type surface exists
- normalized status map exists
- degraded authority helper exists

### After Branch B
Validate:
- dashboard and recommendation consumers use selectors/adaptors
- authority warning behavior is visible

### After Branch C
Validate:
- readiness and credential panels use canonical normalized states
- status distinctions remain intact

### After Branch D
Validate:
- evidence linkage routes through shared file selectors
- unresolved evidence is not silent
- validation checklist artifact exists

---

## 10. Merge Readiness Gate Template

Each PR in this sequence must be checked against the same gate:

### Gate fields
- Scope stayed inside branch boundary: yes/no
- Shared contract integrity preserved: yes/no
- Warning/degraded behavior explicit: yes/no
- No ad hoc academy-only state shape introduced: yes/no
- No unrelated UI redesign mixed in: yes/no
- Validation artifact or checklist updated where applicable: yes/no

If any field is `no`, merge is blocked until corrected or explicitly bounded.

---

## 11. Anti-Drift Rules

- No branch may redefine canonical statuses once Branch A lands.
- No branch may introduce component-local file/evidence truth.
- No branch may consume raw provider authority directly after Branch A.
- No branch may silently downgrade unresolved state to success-like UI.
- No branch may claim live production convergence without separate deployment verification.

---

## 12. Founder Hands-Off Enforcement

This execution plan is designed to reduce founder routing.

Escalate only if blocked by:
- repo permission failure
- missing storage/auth credentials needed for real patching
- uncertainty about legal meaning of credential issuance language
- inability to determine actual source-of-truth objects from existing repo code

Normal branch sequencing is not an escalation reason.

---

## 13. Definition of Done

049R is complete when:
- branch sequence is fixed
- commit groupings are fixed
- PR order is fixed
- validation handoff order is fixed
- merge readiness gates are fixed
- next execution artifact is identified

---

## 14. Next Artifact

**FCA_PACKET_049S_WAVE1_EXECUTION_CHECKLIST_AND_MERGE_GATE.md**

This next artifact must convert 049R into:
- operator checklist for each branch
- per-PR merge gate checklist
- required validation statements
- stop conditions
- merge approval criteria
- post-merge continuation rule
