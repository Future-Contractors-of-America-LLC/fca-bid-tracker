# FCA_PACKET_049T_WAVE1_REPO_EXECUTION_STARTER

Status: Proposed  
Sequence: Follows 049S  
Scope: Exact kickoff artifact for Wave 1 repo execution, including first branch start, initial file creation order, first PR starter body, first validation note template, and first merge gate application example  
Truth boundary: This packet defines the starter execution artifact only. It does not claim that Branch A code has already been written, merged, deployed, or verified live.

---

## 1. Issue

049S established execution controls and merge gates, but execution still has not been converted into a concrete first repo move. Without a starter artifact, the sequence can stall at governance instead of turning into actual branch work.

---

## 2. Decision

Begin Wave 1 execution with **Branch A only**.

### First execution branch
`packet-049r-branch-a-shared-contracts-normalization`

This is the only authorized starting branch because all later Wave 1 work depends on canonical shared authority, readiness, credential, recommendation, and evidence-link contracts.

---

## 3. First Branch Kickoff

### Branch name
`packet-049r-branch-a-shared-contracts-normalization`

### Branch purpose
Create the shared Academy contract and normalization layer required by all later dashboard, recommendation, readiness, credential, and evidence-linkage work.

### Scope boundary
Allowed in this branch:
- canonical shared type files
- normalization utilities
- selector/adaptor entrypoint stubs or baseline wiring
- import-safe minimal glue required to expose shared contract exports

Not allowed in this branch:
- dashboard consumer rewrites
- recommendation rail UI rewrites
- readiness panel convergence
- credential panel convergence
- evidence attachment components
- storage-provider implementation changes

---

## 4. Initial File Creation Order

Create files in this exact order.

### Step 1 — canonical types
1. `src/lib/academy/authorityConsumerState.ts`
2. `src/lib/academy/readinessState.ts`
3. `src/lib/academy/credentialState.ts`
4. `src/lib/academy/recommendationState.ts`
5. `src/lib/academy/academyEvidenceLink.ts`

### Step 2 — normalization utilities
6. `src/lib/academy/normalizeAcademyStatus.ts`
7. `src/lib/academy/normalizeAuthorityWarnings.ts`

### Step 3 — selector/adaptor entrypoint
8. `src/lib/academy/selectors/index.ts`

### Step 4 — optional supporting selector files
9. `src/lib/academy/selectors/selectAuthorityConsumerState.ts`
10. `src/lib/academy/selectors/selectReadinessState.ts`
11. `src/lib/academy/selectors/selectCredentialState.ts`
12. `src/lib/academy/selectors/selectRecommendationState.ts`
13. `src/lib/academy/selectors/selectAcademyEvidenceLinks.ts`

If repo structure already centralizes selectors elsewhere, preserve one canonical export surface and do not duplicate selector trees.

---

## 5. Minimum Content Expectations for First Files

### `authorityConsumerState.ts`
Must define:
- `AuthorityConsumerState`
- `AuthorityWarning`
- `buildDegradedAuthorityConsumerState()`
- `hasAuthorityWarnings()`

### `readinessState.ts`
Must define:
- `ReadinessState`
- `NormalizedReadinessStatus`

### `credentialState.ts`
Must define:
- `CredentialState`
- `NormalizedCredentialStatus`

### `recommendationState.ts`
Must define:
- `RecommendationState`
- `RecommendationPriority`
- `RecommendationActionState`

### `academyEvidenceLink.ts`
Must define:
- `AcademyEvidenceLink`
- `LinkedObjectType`
- `EvidenceRelation`

### `normalizeAcademyStatus.ts`
Must normalize to exactly:
- `ready`
- `in_progress`
- `blocked`
- `expired`
- `missing_evidence`
- `needs_review`
- `unavailable`

### `normalizeAuthorityWarnings.ts`
Must normalize warning structures into one shared render-safe shape.

---

## 6. First PR Starter Body

Use this PR body template for Branch A.

```md
## Summary
Begins Wave 1 execution by landing the shared Academy authority/readiness/credential/recommendation/evidence-link contract layer and normalization utilities.

## Scope
Included:
- canonical shared types
- normalization utilities
- selector/adaptor entrypoint baseline

Excluded:
- dashboard consumer rewrites
- recommendation rail UI rewrites
- readiness/credential panel rewrites
- evidence attachment rendering
- deploy/live verification claims

## Why
Later Wave 1 convergence work depends on one canonical shared contract surface. This PR establishes that surface first.

## Validation Statement
This PR establishes repo-level contract and normalization truth only. It does not claim consumer convergence, deploy truth, or live behavior verification.

## Stop-Condition Check
Checked:
- duplicate normalized status enums not intentionally introduced
- degraded fallback helper present
- scope remained inside Branch A

## Truth Boundary
Repo truth changed:
- shared contract and normalization layer added

Not yet verified:
- downstream consumer adoption
- deployed runtime behavior
- live SaaS/LMS convergence
```

---

## 7. First Validation Note Template

Attach this note in PR comments or description refinement if needed.

```md
### Branch A Validation Note
- Scope stayed inside shared contracts and normalization only: YES/NO
- Canonical type surface exists: YES/NO
- Normalized status map exists: YES/NO
- Degraded authority helper exists: YES/NO
- Duplicate component-local status vocabularies introduced: YES/NO
- Consumer rewrites mixed into this branch: YES/NO
- Live/deploy verification claimed: YES/NO

If any required YES/NO value is unfavorable to Branch A scope, merge is blocked until corrected.
```

---

## 8. First Merge Gate Application Example

Apply the 049S merge gate to Branch A exactly as follows.

### Gate 1 — Scope gate
Expected result:
- pass only if the branch contains shared contract and normalization work only

### Gate 2 — Shared truth gate
Expected result:
- pass only if canonical shared contracts are the new authority layer
- fail if any component-local shapes silently override them

### Gate 3 — Warning/degraded-state gate
Expected result:
- pass only if degraded fallback helpers and normalized warnings exist
- fail if unresolved state is left implicit

### Gate 4 — Evidence discipline gate
Expected result:
- pass only if evidence-link type exists without introducing academy-only file truth drift

### Gate 5 — Validation gate
Expected result:
- pass only if Branch A validation statement and stop-condition check are present

### Gate 6 — Truth-boundary gate
Expected result:
- pass only if PR claims repo truth only and avoids deploy/live completion claims

---

## 9. Starter Stop Conditions

Do not advance beyond Branch A kickoff if any of the following occurs:
- selector/export location becomes duplicated and ambiguous
- canonical statuses are defined differently in multiple new files
- Branch A begins absorbing dashboard, recommendation, readiness, or credential UI work
- degraded fallback behavior is omitted
- truth-boundary language implies live completion

---

## 10. Required Output of This Starter

By the end of the first execution pass, the repo should have:
- canonical Academy shared type files created
- normalization utilities created
- selector/adaptor entrypoint created
- a Branch A PR body ready to use
- a Branch A validation note template ready to apply
- the first merge gate example fixed as the standard

---

## 11. Post-Starter Continuation Rule

After Branch A is created and its initial file set is landed:
1. apply the 049S merge gate
2. merge only if Branch A passes
3. then continue to dashboard/recommendation convergence
4. do not start Branch B before Branch A truth is stable

---

## 12. Founder Hands-Off Rule

No founder interpretation is required to begin Branch A.
Escalate only if:
- target repo path structure is materially different than assumed
- TypeScript/JS file placement cannot be determined from actual repo structure
- branch permissions block execution

---

## 13. Definition of Done

049T is complete when:
- the first execution branch is explicitly named
- first file creation order is fixed
- first PR starter body is fixed
- first validation note template is fixed
- first merge gate application example is fixed
- next artifact is identified

---

## 14. Next Artifact

**FCA_PACKET_049U_BRANCH_A_EXACT_FILE_CONTENTS_STARTER.md**

This next artifact must convert 049T into:
- exact starter contents for the Branch A files
- exact export signatures
- exact status enum definitions
- exact degraded warning helper shape
- exact selector entrypoint starter content
