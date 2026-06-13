# FCA_PACKET_049V_BRANCH_A_REPO_APPLY_PLAN

Status: Proposed  
Sequence: Follows 049U  
Scope: Exact repo apply sequence, commit split plan, PR creation sequence, validation checklist application, and merge-readiness confirmation flow for Branch A  
Truth boundary: This packet defines how Branch A should be applied in the repository. It does not claim the Branch A code has already been created, merged, deployed, or validated live.

---

## 1. Issue

049U froze the exact starter file contents for Branch A, but execution can still drift if the apply order, commit boundaries, and PR flow are not fixed before implementation starts.

Without a repo apply plan:
- Branch A may be committed as one undifferentiated blob
- selector files may land before canonical types are stable
- PR review may become scope-confused
- merge readiness may be asserted without a repeatable confirmation flow

---

## 2. Decision

Apply Branch A in one bounded repo sequence with **three commits**, **one PR**, and **one mandatory validation pass** before merge.

### Branch name
`packet-049r-branch-a-shared-contracts-normalization`

### Branch purpose
Land the canonical shared Academy contract and normalization layer required for all later Wave 1 convergence work.

---

## 3. Exact Repo Apply Sequence

Apply files in this exact order.

### Stage 1 — foundational normalization
1. `src/lib/academy/normalizeAcademyStatus.ts`

### Stage 2 — canonical shared types
2. `src/lib/academy/authorityConsumerState.ts`
3. `src/lib/academy/readinessState.ts`
4. `src/lib/academy/credentialState.ts`
5. `src/lib/academy/recommendationState.ts`
6. `src/lib/academy/academyEvidenceLink.ts`
7. `src/lib/academy/normalizeAuthorityWarnings.ts`

### Stage 3 — selector baseline
8. `src/lib/academy/selectors/selectAuthorityConsumerState.ts`
9. `src/lib/academy/selectors/selectReadinessState.ts`
10. `src/lib/academy/selectors/selectCredentialState.ts`
11. `src/lib/academy/selectors/selectRecommendationState.ts`
12. `src/lib/academy/selectors/selectAcademyEvidenceLinks.ts`
13. `src/lib/academy/selectors/index.ts`

### Apply rule
No Stage 3 file is added before all Stage 1 and Stage 2 files exist in the branch.

---

## 4. Commit Split Plan

### Commit 1 — normalization foundation
**Purpose:** establish the canonical status vocabulary first.

#### Files
- `src/lib/academy/normalizeAcademyStatus.ts`

#### Commit message
`Wave 1 Branch A: add canonical academy status normalization`

#### Validation after commit 1
- normalized status vocabulary exists
- no second competing normalization file created in same patch
- all seven required canonical statuses are present

---

### Commit 2 — shared Academy contract layer
**Purpose:** establish shared authority/readiness/credential/recommendation/evidence-link types and warning normalization.

#### Files
- `src/lib/academy/authorityConsumerState.ts`
- `src/lib/academy/readinessState.ts`
- `src/lib/academy/credentialState.ts`
- `src/lib/academy/recommendationState.ts`
- `src/lib/academy/academyEvidenceLink.ts`
- `src/lib/academy/normalizeAuthorityWarnings.ts`

#### Commit message
`Wave 1 Branch A: add shared academy contract types and warning normalization`

#### Validation after commit 2
- canonical shared types exist
- degraded authority helper exists
- warnings are structured, not plain strings
- no UI component rewrites are mixed in

---

### Commit 3 — selector/adaptor starter layer
**Purpose:** establish the selector entrypoint and starter selectors that later Wave 1 consumers can adopt.

#### Files
- `src/lib/academy/selectors/selectAuthorityConsumerState.ts`
- `src/lib/academy/selectors/selectReadinessState.ts`
- `src/lib/academy/selectors/selectCredentialState.ts`
- `src/lib/academy/selectors/selectRecommendationState.ts`
- `src/lib/academy/selectors/selectAcademyEvidenceLinks.ts`
- `src/lib/academy/selectors/index.ts`

#### Commit message
`Wave 1 Branch A: add academy selector starter layer`

#### Validation after commit 3
- selector entrypoint exists
- selector files compile or are syntactically valid relative to repo language conventions
- no dashboard/recommendation/readiness/credential UI rewrites included
- degraded fallback path exists in selector layer where required

---

## 5. First PR Creation Sequence

Create exactly one Branch A PR after all three commits exist.

### PR branch
`packet-049r-branch-a-shared-contracts-normalization`

### PR title
`Wave 1 Branch A: shared academy contracts and normalization`

### PR body
Use the Branch A PR starter from 049T, with these required sections:
- Summary
- Scope
- Why
- Validation Statement
- Stop-Condition Check
- Truth Boundary

### PR description requirements
Must explicitly state:
- this branch changes repo truth only
- no dashboard or panel convergence is claimed yet
- no deploy/live truth is claimed

---

## 6. Validation Checklist Application for Branch A

Before opening the PR, apply this checklist.

### Branch A execution checklist
- [ ] `normalizeAcademyStatus.ts` exists and includes all seven canonical statuses.
- [ ] `authorityConsumerState.ts` exists.
- [ ] `readinessState.ts` exists.
- [ ] `credentialState.ts` exists.
- [ ] `recommendationState.ts` exists.
- [ ] `academyEvidenceLink.ts` exists.
- [ ] `normalizeAuthorityWarnings.ts` exists.
- [ ] selector files exist.
- [ ] selector index exists.
- [ ] no consumer UI convergence files are part of the branch.
- [ ] no second competing normalization file was introduced.
- [ ] no academy-only storage/file schema was introduced.

### Required validation note
Attach or include:

```md
### Branch A Validation Note
- Scope stayed inside shared contracts and normalization only: YES/NO
- Canonical type surface exists: YES/NO
- Normalized status map exists: YES/NO
- Degraded authority helper exists: YES/NO
- Duplicate component-local status vocabularies introduced: YES/NO
- Consumer rewrites mixed into this branch: YES/NO
- Live/deploy verification claimed: YES/NO
```

Branch A is blocked unless the required YES/NO pattern is favorable to Branch A scope.

---

## 7. Merge-Readiness Confirmation Flow

Apply this flow in order.

### Gate A — scope confirmation
Confirm:
- branch only contains Branch A files
- no dashboard/panel JSX changes are included
- no unrelated deploy/infrastructure changes exist

### Gate B — shared truth confirmation
Confirm:
- canonical shared types are present
- no duplicated local status truth is introduced in component space
- warnings remain structured

### Gate C — degraded-state confirmation
Confirm:
- degraded authority helper exists
- unresolved state can be represented explicitly
- selector baseline does not force silent success-like fallback

### Gate D — evidence discipline confirmation
Confirm:
- `academyEvidenceLink.ts` references linkage objects only
- no academy-local alternate file schema is introduced

### Gate E — truth-boundary confirmation
Confirm:
- PR body claims repo truth only
- no live or deploy completion language is used

### Merge-ready result
Branch A is merge-ready only if all gates A–E pass.

---

## 8. Stop Conditions

Do not merge Branch A if any of the following occur:
- selector or type paths are duplicated in conflicting locations
- canonical statuses are defined inconsistently across new files
- dashboard/recommendation/readiness/credential consumer logic enters the branch
- degraded fallback behavior is missing
- truth-boundary language implies production completion

If any stop condition triggers:
- keep Branch A open
- remediate only within Branch A scope
- do not advance to Branch B

---

## 9. Post-Merge Confirmation Flow

After Branch A merges:
1. record that Branch A merge gate passed
2. restate new repo truth:
   - canonical shared Academy types exist
   - canonical status normalization exists
   - selector starter layer exists
3. restate what is still not true:
   - dashboard consumers not yet converged
   - readiness/credential panels not yet converged
   - evidence rendering not yet converged
   - deploy/live truth not yet verified
4. continue only to Branch B

---

## 10. Founder Hands-Off Enforcement

No founder routing is needed for Branch A apply work under normal conditions.

Escalate only if:
- actual repo structure makes the target file placement invalid
- branch permissions block changes
- codebase language conventions require a bounded file-path adjustment that cannot be verified safely from repo truth

---

## 11. Definition of Done

049V is complete when:
- exact repo apply sequence is fixed
- commit split plan is fixed
- PR creation sequence is fixed
- Branch A validation checklist application is fixed
- merge-readiness confirmation flow is fixed
- next artifact is identified

---

## 12. Next Artifact

**FCA_PACKET_049W_BRANCH_A_PR_STARTER_AND_VALIDATION_RECORD.md**

This next artifact must convert 049V into:
- exact Branch A PR starter body
- exact validation record document
- exact merge-ready signoff template
- exact post-merge repo-truth statement
