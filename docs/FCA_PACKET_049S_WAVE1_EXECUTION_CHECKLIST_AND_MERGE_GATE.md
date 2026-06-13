# FCA_PACKET_049S_WAVE1_EXECUTION_CHECKLIST_AND_MERGE_GATE

Status: Proposed  
Sequence: Follows 049R  
Scope: Operator checklist, per-PR merge gate, validation statements, stop conditions, merge approval criteria, and post-merge continuation rule for Wave 1 Academy authority convergence  
Truth boundary: This packet defines execution controls only. It does not claim that Wave 1 branch work has already been implemented, merged, deployed, or verified live.

---

## 1. Issue

049R fixed branch order and execution sequencing, but branch discipline will still drift unless each branch has an explicit operator checklist and a mandatory merge gate that can be applied without interpretation drift.

Without this packet:
- branches can appear ready without actual validation
- warning and degraded-state behavior can be skipped during review
- shared file/evidence linkage can be accepted cosmetically
- merge decisions can fall back to founder interpretation rather than governed gates

---

## 2. Decision

Wave 1 branch execution is governed by a single checklist and merge-gate standard applied to every branch in sequence.

Required covered branches:
- Branch A — shared contracts and normalization
- Branch B — dashboard and recommendation convergence
- Branch C — readiness and credential panel convergence
- Branch D — evidence linkage and validation
- optional Branch E — post-merge reconciliation

No branch is considered merge-ready until both:
1. branch execution checklist is completed
2. per-PR merge gate is passed

---

## 3. Universal Operator Checklist

Apply this checklist to every Wave 1 branch before PR creation.

### 3.1 Scope containment
- [ ] Work stayed inside the defined branch scope from 049R.
- [ ] No unrelated UI redesign was introduced.
- [ ] No unrelated deploy or infrastructure changes were introduced.
- [ ] No unrelated persistence model changes were introduced.

### 3.2 Shared contract integrity
- [ ] Branch uses canonical shared types where required.
- [ ] No duplicate local status vocabularies were introduced.
- [ ] No component-local authority object shape replaced canonical types.
- [ ] Degraded / unresolved state remains explicit.

### 3.3 Warning behavior
- [ ] Warning states are visible, not suppressed.
- [ ] Empty state is not being used to mask degraded state.
- [ ] Unavailable, unresolved, stale, and blocked states remain distinguishable where required.

### 3.4 Evidence and file discipline
- [ ] No ad hoc academy-only file object shape was introduced.
- [ ] No raw URL list was used as evidence truth.
- [ ] Evidence references route through shared file/evidence selectors when required by branch scope.

### 3.5 Reviewability
- [ ] Patch can be explained branch-by-branch and file-by-file.
- [ ] Validation notes are recorded in the PR body or linked artifact.
- [ ] Truth boundary is preserved: no claim of live completion without verification.

---

## 4. Branch-Specific Checklists

### Branch A — Shared Contracts and Normalization

#### Required execution checklist
- [ ] Canonical authority, readiness, credential, recommendation, and evidence-link types created or normalized.
- [ ] Status normalization map created.
- [ ] Authority warning normalization created.
- [ ] Selector/adaptor entrypoint exists or is explicitly patched.
- [ ] No UI behavior rewrite beyond minimal integration-safe stubs.

#### Required validation statement
"Branch A establishes canonical shared state and normalization only; no consumer convergence or UI truth claim is included in this branch."

#### Stop conditions
Stop Branch A and do not merge if:
- duplicate normalized status enums still exist in component space
- degraded fallback object is missing
- branch contains dashboard or panel logic rewrites beyond minimal safe wiring

---

### Branch B — Dashboard and Recommendation Convergence

#### Required execution checklist
- [ ] Dashboard authority consumers read normalized selector/adaptor output.
- [ ] Recommendation rail consumers read normalized recommendation state.
- [ ] Degraded and warning states are visibly rendered.
- [ ] Raw provider authority is no longer read directly in Wave 1 dashboard surfaces where selector exists.
- [ ] No readiness/credential detail rewrites were mixed into this branch.

#### Required validation statement
"Branch B converges dashboard and recommendation consumers onto shared authority contracts without yet changing detailed readiness or credential panel contracts."

#### Stop conditions
Stop Branch B and do not merge if:
- direct provider reads still drive overview consumers where normalized selector exists
- recommendation rails still construct local display-only fake state
- degraded state is silently rendered as success-like empty state

---

### Branch C — Readiness and Credential Panel Convergence

#### Required execution checklist
- [ ] Readiness panels consume `ReadinessState`.
- [ ] Credential panels consume `CredentialState`.
- [ ] Canonical statuses only are used.
- [ ] `expired`, `missing_evidence`, `needs_review`, and `in_progress` remain distinct.
- [ ] Warning and incomplete states render explicitly.
- [ ] No evidence component redesign outside branch scope.

#### Required validation statement
"Branch C converges detail panels onto canonical shared state and normalized status vocabulary without introducing separate evidence truth or non-canonical panel status logic."

#### Stop conditions
Stop Branch C and do not merge if:
- panel components define new local status enums
- credential or readiness panels collapse materially different statuses together
- evidence rendering depends on ad hoc local object shapes

---

### Branch D — Evidence Linkage and Validation

#### Required execution checklist
- [ ] Shared academy evidence selector layer exists.
- [ ] Shared academy evidence attachment components exist.
- [ ] Readiness and credential surfaces render evidence via shared selectors.
- [ ] Recommendation-linked evidence, where implemented, uses shared linkage.
- [ ] Validation artifact exists in repo.
- [ ] Unresolved evidence state is explicit.

#### Required validation statement
"Branch D binds Wave 1 surfaces to shared file/evidence linkage and records validation controls; it does not redefine the storage provider or create a separate academy file lane."

#### Stop conditions
Stop Branch D and do not merge if:
- evidence attachments still use raw URLs or ad hoc arrays as truth
- academy-only file schema is introduced
- validation artifact is missing
- unresolved evidence silently disappears from UI

---

### Optional Branch E — Post-Merge Reconciliation

#### Required execution checklist
- [ ] Scope limited to reconciliation only.
- [ ] No new features introduced.
- [ ] No new persistence behavior introduced.
- [ ] Cleanup is traceable to prior branch sequence conflicts or dead code.

#### Required validation statement
"Branch E is limited to post-merge reconciliation and does not expand Wave 1 scope."

#### Stop conditions
Stop Branch E and do not merge if:
- new feature work appears
- route behavior changes materially
- UI redesign or persistence changes are bundled into reconciliation

---

## 5. Per-PR Merge Gate

Every Wave 1 PR must pass all gates below.

### Gate 1 — Scope gate
- [ ] PR contents match the intended branch scope only.
- [ ] PR does not pull future-branch work forward.
- [ ] PR does not contain hidden redesign work.

### Gate 2 — Shared truth gate
- [ ] Canonical shared contracts remain authoritative.
- [ ] No component-level authority truth bypass exists.
- [ ] No branch-specific object shape silently overrides shared types.

### Gate 3 — Warning and degraded-state gate
- [ ] Unresolved state is visible.
- [ ] Warnings are not suppressed.
- [ ] Empty state is not used as false success state.

### Gate 4 — Evidence discipline gate
- [ ] File/evidence references use shared selectors where applicable.
- [ ] No academy-only evidence schema drift was introduced.
- [ ] No raw URL list acts as evidence truth.

### Gate 5 — Validation gate
- [ ] Validation notes are attached to PR body, comment, or artifact.
- [ ] Required branch-specific validation statement is present.
- [ ] Stop conditions were checked and did not trigger.

### Gate 6 — Truth-boundary gate
- [ ] PR does not claim production/live success without separate verification.
- [ ] PR describes repo truth only.
- [ ] Any unresolved boundary is stated explicitly.

If any gate fails, merge is blocked.

---

## 6. Required Validation Statements by PR

Each PR body must include all of the following sections:

### A. Scope statement
- exact branch scope
- excluded scope

### B. Truth statement
- what is changed in repo truth
- what is not yet verified in deploy/live truth

### C. Validation statement
- what was checked
- what remains unresolved

### D. Stop-condition statement
- confirm stop conditions were checked
- note any bounded exception, if one exists

---

## 7. Merge Approval Criteria

A Wave 1 PR is approved for merge only when all are true:
- branch checklist complete
- per-PR merge gate complete
- required validation statement present
- no open stop condition triggered
- branch remains sequenced correctly relative to prior branches
- no material unresolved architectural contradiction remains hidden

Recommended approval note template:

> Merge approved for branch scope only. Shared contract integrity preserved. Warning/degraded behavior remains explicit. No unauthorized scope expansion detected. Live/deploy truth not implied by this merge.

---

## 8. Post-Merge Continuation Rule

After each merge:
1. record that the branch-specific merge gate passed
2. restate what is now repo truth
3. restate what is still not live/deploy-verified
4. proceed only to the exact next branch in 049R order
5. do not batch-skip to a later branch unless a bounded exception artifact is created

---

## 9. Failure Handling Rule

If a branch fails merge readiness:
- do not merge partially
- do not hide unresolved warnings in later branches
- create a narrow remediation patch or note the block explicitly in the PR
- preserve branch order discipline

If a later branch depends on a failed earlier branch:
- continuation pauses at that dependency boundary
- only bounded remediation is allowed

---

## 10. Founder Hands-Off Enforcement

This merge gate exists to reduce founder interpretation load.

Do not escalate to founder for:
- ordinary branch checklist completion
- ordinary PR validation review
- ordinary scope enforcement

Escalate only if:
- source-of-truth objects cannot be determined from repo state
- repo credentials or branch permissions block execution
- legal meaning of credential issuance or compliance language is materially uncertain

---

## 11. Definition of Done

049S is complete when:
- universal operator checklist is fixed
- branch-specific checklists are fixed
- per-PR merge gate is fixed
- stop conditions are fixed
- merge approval criteria are fixed
- post-merge continuation rule is fixed
- next artifact is identified

---

## 12. Next Artifact

**FCA_PACKET_049T_WAVE1_REPO_EXECUTION_STARTER.md**

This next artifact must convert 049S into:
- exact first execution branch kickoff
- initial file creation order
- first PR starter body
- first validation note template
- first merge gate application example
