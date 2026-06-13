# FCA_PACKET_049X_BRANCH_B_EXECUTION_STARTER

Status: Proposed  
Sequence: Follows 049W  
Scope: Exact starter artifact for Branch B dashboard and recommendation convergence, including scope boundary, target file classes, apply order, PR starter, validation note, merge gate, and post-merge continuation rule  
Truth boundary: This packet defines the Branch B execution starter only. It does not claim that Branch A has already merged, that Branch B code is already implemented, or that deploy/live convergence has been verified.

---

## 1. Issue

049W froze Branch A review and merge artifacts. The next controlled move is to begin Branch B planning so dashboard and recommendation consumers can converge onto the shared Academy contract layer without scope drift.

Without an exact Branch B starter:
- dashboard authority consumers may patch inconsistently
- recommendation rails may converge against raw provider state instead of canonical selectors
- degraded / warning handling may differ across overview surfaces
- Branch B may absorb readiness or credential detail work too early

---

## 2. Decision

Freeze the exact execution starter for **Branch B only**.

### Branch name
`packet-049r-branch-b-dashboard-recommendation-convergence`

### Branch dependency
Branch B should not be opened for merge work until Branch A repo truth is stable.

### Branch purpose
Move dashboard-level authority consumers and recommendation rails onto the shared selector/adaptor contract introduced by Branch A.

---

## 3. Branch B Scope Boundary

### Allowed in Branch B
- dashboard overview consumer patching
- authority warning/degraded rendering for overview surfaces
- recommendation rail/list/card consumer patching
- replacement of component-local raw provider reads with shared selector/adaptor reads
- stable empty-state vs degraded-state distinction for Branch B surfaces

### Not allowed in Branch B
- readiness detail panel convergence
- credential detail panel convergence
- evidence attachment component creation
- storage-provider or persistence changes
- broad visual redesign
- route-wide feature-gate rollout beyond Branch B consumers

---

## 4. Exact Target File Classes

Inspect and patch only files in the following target classes.

### Dashboard targets
- `src/pages/academy/*`
- `src/components/academy/*Dashboard*`
- `src/components/academy/*Overview*`

### Recommendation targets
- `src/components/academy/*Recommendation*`
- `src/components/academy/*Rail*`
- `src/components/academy/*Card*`
- `src/components/academy/*List*`

### Shared selector/adaptor imports
- `src/lib/academy/selectors/*`

### Optional warning UI helpers if already present
- existing academy warning banner / notice / state components

### Forbidden target classes for Branch B
- `*Readiness*`
- `*Credential*`
- `*Certificate*`
- new evidence attachment components
- storage adapter or file-spine provider files

---

## 5. Required Branch B Behaviors

### Dashboard behavior
- dashboard consumers must read normalized authority consumer state through shared selectors/adaptors
- overview widgets must not directly read raw provider payloads when canonical selectors exist
- unresolved authority must render visibly as degraded / warning output

### Recommendation behavior
- recommendation rails must consume canonical `RecommendationState`
- recommendation objects must remain attributable to source objects
- recommendation empty state must be distinguishable from degraded-state failure

### Warning behavior
- empty state must not act as a false success state
- unresolved authority warnings must remain visible
- warning rendering must preserve structured warning semantics from Branch A

---

## 6. Branch B Apply Order

Apply Branch B in this order:

1. inspect current dashboard consumer files
2. inspect current recommendation consumer files
3. patch dashboard overview consumers to use selector/adaptor layer
4. patch recommendation rail/list/card consumers to use selector/adaptor layer
5. patch degraded / warning / empty-state handling
6. validate no readiness or credential detail work entered the branch
7. open one Branch B PR

### Apply rule
Do not patch recommendation rails before the dashboard authority-consumer usage pattern is stabilized in Branch B files.

---

## 7. Branch B PR Starter Body

Use this exact PR body for Branch B.

```md
## Summary
Continues Wave 1 by converging academy dashboard consumers and recommendation rails onto the shared authority and recommendation selector/adaptor layer established in Branch A.

## Scope
Included:
- dashboard overview consumer convergence
- recommendation rail/list/card consumer convergence
- degraded and warning state rendering for Branch B surfaces

Excluded:
- readiness detail panel convergence
- credential detail panel convergence
- evidence attachment rendering
- storage or persistence changes
- deploy or live verification claims

## Why
Branch B is the first consumer-adoption wave after the shared Academy contract layer. It makes overview surfaces structurally consistent before detail panels and evidence linkage are addressed.

## Validation Statement
This PR changes repo-level consumer wiring for dashboard and recommendation surfaces only. It does not claim readiness or credential panel convergence, evidence rendering convergence, deployment truth, or live behavior verification.

## Stop-Condition Check
Checked:
- raw provider authority reads removed from targeted Branch B consumers where selectors exist
- degraded and warning states remain explicit
- recommendation state remains attributable
- no readiness/credential detail convergence mixed into this branch

## Truth Boundary
Repo truth changed:
- selected dashboard consumers now use shared selector/adaptor state
- selected recommendation consumers now use shared selector/adaptor state

Not yet verified:
- readiness detail panel convergence
- credential detail panel convergence
- evidence attachment rendering convergence
- deployed runtime behavior
- live SaaS/LMS convergence
```

---

## 8. Branch B Validation Note Template

Use this exact validation note.

```md
### Branch B Validation Note
- Scope stayed inside dashboard + recommendation convergence only: YES/NO
- Dashboard consumers read shared selector/adaptor state: YES/NO
- Recommendation consumers read canonical recommendation state: YES/NO
- Structured warnings remain visible: YES/NO
- Empty state is not masking degraded state: YES/NO
- Readiness detail work mixed into this branch: YES/NO
- Credential detail work mixed into this branch: YES/NO
- Evidence attachment work mixed into this branch: YES/NO
- Live/deploy verification claimed: YES/NO

Branch B is blocked if any required favorable condition is NO or any forbidden mixed-scope condition is YES.
```

---

## 9. Branch B Merge Gate Summary

Use this exact merge-gate summary.

```md
## Branch B Merge Gate Summary
- Scope gate passed: YES/NO
- Shared truth gate passed: YES/NO
- Warning and degraded-state gate passed: YES/NO
- Recommendation attribution gate passed: YES/NO
- Validation gate passed: YES/NO
- Truth-boundary gate passed: YES/NO

Final merge result: PASS/FAIL
```

### Merge rule
Branch B is mergeable only if every listed gate is `YES` and final merge result is `PASS`.

---

## 10. Branch B Stop Conditions

Do not merge Branch B if any of the following occur:
- raw provider authority reads still drive patched overview consumers where selectors exist
- recommendation components still fabricate display-only local state instead of canonical recommendation state
- degraded state silently renders as success-like empty UI
- readiness detail work enters the branch
- credential detail work enters the branch
- evidence linkage rendering work enters the branch
- PR language implies deploy or live completion

If any stop condition triggers:
- block merge
- remediate inside Branch B scope only
- do not continue to Branch C

---

## 11. Exact Post-Merge Repo-Truth Statement

After Branch B merges, record the following statement.

```md
## Branch B Post-Merge Repo Truth

Now true in repo:
- targeted academy dashboard consumers use shared authority selector/adaptor state
- targeted recommendation consumers use canonical recommendation state
- degraded and warning handling is explicit on Branch B surfaces

Not yet true from this merge alone:
- readiness panels are not yet fully converged
- credential panels are not yet fully converged
- evidence attachment rendering is not yet fully converged
- deployed runtime behavior is not yet verified
- live SaaS/LMS convergence is not yet verified
```

### Continuation rule
After this statement is recorded:
- continue only to Branch C
- do not imply Wave 1 completion from Branch B merge alone

---

## 12. Founder Hands-Off Rule

No founder routing is required for ordinary Branch B execution.

Escalate only if:
- actual repo target files cannot be safely determined from repo truth
- selector/adaptor usage is blocked by structural contradictions in existing code
- branch or repo permissions block execution

---

## 13. Definition of Done

049X is complete when:
- exact Branch B scope boundary is frozen
- exact target file classes are frozen
- exact Branch B apply order is frozen
- exact Branch B PR starter body is frozen
- exact Branch B validation note is frozen
- exact Branch B merge gate summary is frozen
- exact post-merge repo-truth statement is frozen
- next artifact is identified

---

## 14. Next Artifact

**FCA_PACKET_049Y_BRANCH_C_EXECUTION_STARTER.md**

This next artifact must convert the now-stable Branch B execution starter into the exact starter artifact for Branch C readiness and credential panel convergence.
