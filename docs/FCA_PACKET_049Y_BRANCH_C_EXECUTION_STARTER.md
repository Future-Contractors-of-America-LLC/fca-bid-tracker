# FCA_PACKET_049Y_BRANCH_C_EXECUTION_STARTER

Status: Proposed  
Sequence: Follows 049X  
Scope: Exact starter artifact for Branch C readiness and credential panel convergence, including scope boundary, target file classes, apply order, PR starter, validation note, merge gate, and post-merge continuation rule  
Truth boundary: This packet defines the Branch C execution starter only. It does not claim that Branch B has already merged, that Branch C code is already implemented, or that deploy/live convergence has been verified.

---

## 1. Issue

049X froze Branch B execution boundaries for dashboard and recommendation convergence. The next controlled move is to freeze Branch C so readiness and credential detail surfaces can converge onto the shared Academy contract layer without leaking evidence-linkage or storage work prematurely.

Without an exact Branch C starter:
- readiness panels may continue using local status or provider-shaped state
- credential panels may collapse materially different states or review modes
- detail panels may diverge from dashboard/recommendation consumer truth
- Branch C may absorb evidence attachment rendering too early

---

## 2. Decision

Freeze the exact execution starter for **Branch C only**.

### Branch name
`packet-049r-branch-c-readiness-credential-panel-convergence`

### Branch dependency
Branch C should not be opened for merge work until Branch B repo truth is stable.

### Branch purpose
Move readiness and credential detail surfaces onto canonical shared state and normalized status vocabulary established by Branch A and adopted by Branch B consumers.

---

## 3. Branch C Scope Boundary

### Allowed in Branch C
- readiness panel/detail consumer patching
- credential panel/detail consumer patching
- canonical status-badge mapping for readiness and credential surfaces
- explicit stale / unavailable / missing_evidence / needs_review handling
- continued use of shared selector/adaptor state introduced earlier
- readiness and credential warning rendering where required for these surfaces

### Not allowed in Branch C
- evidence attachment component creation
- shared file selector implementation
- storage-provider or persistence changes
- dashboard overview rewrites beyond narrow compatibility fixes
- recommendation rail redesign
- broad visual redesign

---

## 4. Exact Target File Classes

Inspect and patch only files in the following target classes.

### Readiness targets
- `src/pages/academy/*Readiness*`
- `src/components/academy/*Readiness*`
- `src/components/academy/*Progress*`
- `src/components/academy/*Status*` where directly tied to readiness panel state

### Credential targets
- `src/pages/academy/*Credential*`
- `src/components/academy/*Credential*`
- `src/components/academy/*Certificate*`
- `src/components/academy/*Status*` where directly tied to credential panel state

### Shared selector/adaptor imports
- `src/lib/academy/selectors/*`
- shared Academy types from `src/lib/academy/*`

### Forbidden target classes for Branch C
- new evidence attachment components
- file-spine selectors under `src/lib/files/*`
- broad dashboard overview files not required for compatibility
- recommendation rail/list/card files unless a narrow import fix is unavoidable and explicitly noted

---

## 5. Required Branch C Behaviors

### Readiness behavior
- readiness surfaces must consume canonical `ReadinessState`
- readiness status output must use normalized status vocabulary only
- blocking reasons must remain visible where applicable
- missing_evidence must not collapse into generic blocked or unavailable output

### Credential behavior
- credential surfaces must consume canonical `CredentialState`
- credential status output must use normalized status vocabulary only
- `expired`, `missing_evidence`, and `needs_review` must remain distinct
- review state must supplement, not replace, normalized status

### Warning behavior
- stale, degraded, and unavailable states must be explicit
- empty state must not hide unresolved panel state
- panel-level warnings must remain structurally derived from shared truth, not local reinterpretation

---

## 6. Branch C Apply Order

Apply Branch C in this order:

1. inspect current readiness panel/detail files
2. inspect current credential panel/detail files
3. patch readiness consumers to canonical `ReadinessState`
4. patch readiness status rendering to normalized Academy status vocabulary
5. patch credential consumers to canonical `CredentialState`
6. patch credential status and review rendering to canonical semantics
7. patch degraded / stale / unavailable handling for Branch C surfaces
8. validate that evidence attachment rendering did not enter the branch
9. open one Branch C PR

### Apply rule
Do not begin credential detail rewrites until readiness consumer usage pattern is stabilized in Branch C files.

---

## 7. Branch C PR Starter Body

Use this exact PR body for Branch C.

```md
## Summary
Continues Wave 1 by converging academy readiness and credential detail surfaces onto the shared Academy contract layer and canonical normalized status vocabulary.

## Scope
Included:
- readiness panel/detail convergence
- credential panel/detail convergence
- canonical status rendering for Branch C surfaces
- explicit degraded/stale/unavailable handling for Branch C surfaces

Excluded:
- evidence attachment rendering
- shared file selector implementation
- storage or persistence changes
- broad dashboard or recommendation redesign
- deploy or live verification claims

## Why
Branch C completes the detail-surface contract adoption after overview and recommendation consumers have been aligned. It makes readiness and credential detail panels structurally consistent before evidence linkage is introduced.

## Validation Statement
This PR changes repo-level consumer wiring for readiness and credential detail surfaces only. It does not claim evidence rendering convergence, deployment truth, or live behavior verification.

## Stop-Condition Check
Checked:
- readiness surfaces read canonical `ReadinessState`
- credential surfaces read canonical `CredentialState`
- canonical status vocabulary remains enforced
- `expired`, `missing_evidence`, and `needs_review` remain distinct
- no evidence attachment rendering mixed into this branch

## Truth Boundary
Repo truth changed:
- targeted readiness consumers now use canonical shared state
- targeted credential consumers now use canonical shared state
- Branch C surfaces now use normalized Academy status vocabulary

Not yet verified:
- evidence attachment rendering convergence
- deployed runtime behavior
- live SaaS/LMS convergence
```

---

## 8. Branch C Validation Note Template

Use this exact validation note.

```md
### Branch C Validation Note
- Scope stayed inside readiness + credential convergence only: YES/NO
- Readiness consumers read canonical `ReadinessState`: YES/NO
- Credential consumers read canonical `CredentialState`: YES/NO
- Canonical Academy status vocabulary remains enforced: YES/NO
- `expired`, `missing_evidence`, and `needs_review` remain distinct: YES/NO
- Degraded/stale/unavailable states remain explicit: YES/NO
- Evidence attachment work mixed into this branch: YES/NO
- Shared file selector work mixed into this branch: YES/NO
- Live/deploy verification claimed: YES/NO

Branch C is blocked if any required favorable condition is NO or any forbidden mixed-scope condition is YES.
```

---

## 9. Branch C Merge Gate Summary

Use this exact merge-gate summary.

```md
## Branch C Merge Gate Summary
- Scope gate passed: YES/NO
- Shared truth gate passed: YES/NO
- Status-normalization gate passed: YES/NO
- Warning and degraded-state gate passed: YES/NO
- Validation gate passed: YES/NO
- Truth-boundary gate passed: YES/NO

Final merge result: PASS/FAIL
```

### Merge rule
Branch C is mergeable only if every listed gate is `YES` and final merge result is `PASS`.

---

## 10. Branch C Stop Conditions

Do not merge Branch C if any of the following occur:
- readiness surfaces still use local or provider-shaped state instead of canonical `ReadinessState`
- credential surfaces still use local or provider-shaped state instead of canonical `CredentialState`
- canonical status vocabulary is bypassed or redefined locally
- `expired`, `missing_evidence`, and `needs_review` collapse into a generic state
- evidence attachment rendering enters the branch
- shared file selector implementation enters the branch
- PR language implies deploy or live completion

If any stop condition triggers:
- block merge
- remediate inside Branch C scope only
- do not continue to Branch D

---

## 11. Exact Post-Merge Repo-Truth Statement

After Branch C merges, record the following statement.

```md
## Branch C Post-Merge Repo Truth

Now true in repo:
- targeted academy readiness consumers use canonical `ReadinessState`
- targeted academy credential consumers use canonical `CredentialState`
- Branch C detail surfaces use normalized Academy status vocabulary
- degraded/stale/unavailable handling is explicit on Branch C surfaces

Not yet true from this merge alone:
- evidence attachment rendering is not yet fully converged
- shared file/evidence selector adoption is not yet fully converged
- deployed runtime behavior is not yet verified
- live SaaS/LMS convergence is not yet verified
```

### Continuation rule
After this statement is recorded:
- continue only to Branch D
- do not imply Wave 1 completion from Branch C merge alone

---

## 12. Founder Hands-Off Rule

No founder routing is required for ordinary Branch C execution.

Escalate only if:
- actual repo target files cannot be safely determined from repo truth
- canonical shared contract usage is blocked by structural contradictions in existing code
- branch or repo permissions block execution

---

## 13. Definition of Done

049Y is complete when:
- exact Branch C scope boundary is frozen
- exact target file classes are frozen
- exact Branch C apply order is frozen
- exact Branch C PR starter body is frozen
- exact Branch C validation note is frozen
- exact Branch C merge gate summary is frozen
- exact post-merge repo-truth statement is frozen
- next artifact is identified

---

## 14. Next Artifact

**FCA_PACKET_049Z_BRANCH_D_EXECUTION_STARTER.md**

This next artifact must convert the now-stable Branch C execution starter into the exact starter artifact for Branch D evidence linkage and validation.
