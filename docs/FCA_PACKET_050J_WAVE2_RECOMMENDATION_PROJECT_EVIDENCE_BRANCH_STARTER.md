# FCA_PACKET_050J_WAVE2_RECOMMENDATION_PROJECT_EVIDENCE_BRANCH_STARTER

Status: Proposed  
Sequence: Follows 050I  
Scope: Execution-starter packet for the bounded Wave 2 implementation branch focused on recommendation-linked and project-context evidence-depth adoption  
Truth boundary: This packet defines the next Wave 2 branch starter only. It does not claim that Wave 1 is already closed successfully, that prior Wave 2 evidence-depth branches are already merged, or that deploy/live convergence has been verified.

---

## 1. Issue

050I froze the bounded Wave 2 lane for recommendation and project-context evidence-depth adoption. The next controlled move is to freeze the exact execution starter so the first implementation branch for that lane can proceed without drifting into display-only recommendation evidence, parallel project-only evidence truth, or unrelated UI and deployment work.

Without an exact branch starter:
- recommendation-linked evidence adoption may become non-attributable UI decoration
- project-context evidence adoption may fork from the shared file spine
- grouped evidence reuse may fragment across recommendation and project surfaces
- repo truth may be overstated before the lane is actually validated

---

## 2. Decision

Freeze the next bounded Wave 2 implementation branch as **recommendation-linked and project-context evidence-depth adoption**.

### Branch name
`packet-050j-wave2-branch-c-recommendation-project-evidence-adoption`

### Branch purpose
Apply the shared evidence-depth model to targeted recommendation-linked and project-context surfaces that already have canonical ids or shared-file-spine truth.

### Dependency
This branch should not be treated as merge-ready unless:
- Wave 1 closeout is satisfied in repo truth under 050A rules
- Wave 2 entry criteria are satisfied under 050B rules
- prior Wave 2 grouped-evidence primitive work is stable in repo truth
- targeted readiness/credential evidence-depth adoption is stable enough to extend safely

---

## 3. Exact Branch Scope

### Included in this branch
- recommendation-linked evidence-depth adoption where canonical ids already exist
- project-context evidence-depth adoption where shared file-spine truth is already authoritative
- shared grouped-evidence reuse on targeted recommendation and project-context surfaces
- shared evidence summary reuse on targeted recommendation and project-context surfaces
- explicit unresolved/degraded evidence handling on targeted recommendation and project-context surfaces
- narrow compatibility fixes required to consume the shared evidence interaction layer

### Excluded from this branch
- storage-provider implementation changes
- academy-only or project-only alternate evidence/file schema
- unrelated dashboard, navigation, or route redesign
- unrelated auth/deploy/commercial work
- readiness/credential deep rewrites beyond narrow compatibility fixes
- deploy/live verification claims

---

## 4. Exact Target File Classes

Target only the following file classes or their exact current equivalents.

### Recommendation-linked adoption targets
- `src/components/academy/*Recommendation*`
- `src/components/academy/*Rail*`
- `src/components/academy/*Card*`
- limited recommendation detail surfaces already carrying canonical ids

### Project-context evidence adoption targets
- `src/components/files/*`
- `src/pages/*Project*` or `src/components/*Project*` only where shared file-spine truth is already authoritative
- limited project/evidence viewers already aligned to shared file spine truth

### Shared imports/utilities/components
- `src/lib/files/*`
- `src/lib/academy/*Evidence*`
- `src/lib/academy/selectors/*`
- `src/components/academy/*Evidence*`
- `src/components/academy/*Attachment*`
- shared evidence interaction components already created in earlier Wave 2 work

### Forbidden target classes in this branch
- broad readiness/credential rewrites beyond narrow compatibility fixes
- unrelated admin, payment, or onboarding modules
- storage provider or environment configuration
- unrelated deployment workflows

---

## 5. Exact Branch Behaviors Required

### Recommendation-linked evidence behavior
The branch must ensure targeted recommendation surfaces can:
- render linked evidence through shared grouped-evidence helpers where canonical ids exist
- preserve attribution from recommendation to source object to linked evidence
- distinguish no evidence, unresolved evidence, and degraded evidence
- avoid display-only evidence references without real shared linkage

### Project-context evidence behavior
The branch must ensure targeted project-context surfaces can:
- reuse shared grouped-evidence and summary helpers where the same shared file-spine objects are already authoritative
- preserve project/job context association without introducing an alternate project-only evidence schema
- surface unresolved/degraded evidence explicitly

### Shared-truth behavior
The branch must ensure:
- recommendation and project-context surfaces do not reintroduce local attachment truth
- grouped evidence and summary behavior remain shared and selector-driven
- no alternate project-only or academy-only evidence object becomes canonical

### Degraded-state behavior
The branch must ensure:
- unresolved evidence is explicit
- degraded evidence linkage is explicit
- empty-success presentation does not hide evidence failure or missing state

---

## 6. Apply Order

Apply this branch in the following order:

1. inspect current recommendation-linked evidence touchpoints
2. inspect current project-context evidence touchpoints tied to shared file-spine truth
3. patch recommendation surfaces to consume grouped recommendation evidence helpers where canonical ids exist
4. patch recommendation surfaces to consume shared evidence summary helpers
5. patch recommendation degraded/unresolved evidence rendering
6. patch project-context surfaces to consume grouped project/shared evidence helpers where shared file-spine truth already exists
7. patch project-context shared evidence summary rendering
8. patch project-context degraded/unresolved evidence rendering
9. verify no alternate schema or unrelated redesign leaked into the branch
10. open one PR

### Apply rule
Do not patch project-context surfaces before recommendation adoption behavior is stabilized in the branch unless an explicit bounded exception is documented.

---

## 7. Exact PR Starter Body

Use this exact PR body for the recommendation/project evidence adoption branch.

```md
## Summary
Continues Wave 2 evidence-interaction depth by adopting shared grouped evidence, shared evidence summary behavior, and explicit degraded/unresolved evidence handling on targeted recommendation-linked and project-context surfaces.

## Scope
Included:
- recommendation-linked evidence-depth adoption where canonical ids already exist
- project-context evidence-depth adoption where shared file-spine truth is already authoritative
- grouped evidence reuse on targeted recommendation/project surfaces
- shared evidence summary reuse on targeted recommendation/project surfaces
- explicit unresolved/degraded evidence handling on targeted recommendation/project surfaces

Excluded:
- storage-provider changes
- academy-only or project-only alternate evidence schema
- unrelated dashboard/auth/route/deploy/commercial changes
- deploy or live verification claims

## Why
Wave 2 evidence-depth expansion must remain inside one shared evidence truth path. This branch extends the same evidence model into recommendation and project contexts without creating a second product lane.

## Validation Statement
This PR changes repo-level recommendation-linked and project-context evidence interaction behavior only. It does not claim broader product completion, deployment truth, or live/customer verification.

## Stop-Condition Check
Checked:
- recommendation-linked evidence remains attributable
- project-context evidence remains tied to shared file-spine truth
- grouped evidence and summary behavior remain shared
- degraded/unresolved evidence remains explicit
- no academy-only or project-only alternate evidence schema introduced
- no unrelated redesign or deploy/auth work leaked into this branch

## Truth Boundary
Repo truth changed:
- targeted recommendation-linked surfaces now adopt shared evidence-depth behavior
- targeted project-context surfaces now adopt shared evidence-depth behavior

Not yet verified:
- deploy/runtime behavior
- live SaaS/LMS convergence
- broader product completion beyond targeted surfaces
```

---

## 8. Exact Validation Note Template

Use this exact validation note.

```md
### Wave 2 Branch C Validation Note
- Scope stayed inside recommendation/project evidence adoption only: YES/NO
- Recommendation-linked evidence remains attributable where used: YES/NO
- Project-context evidence uses shared file-spine truth where targeted: YES/NO
- Shared grouped evidence behavior is reused rather than duplicated: YES/NO
- Shared evidence summary behavior is reused rather than duplicated: YES/NO
- Unresolved/degraded evidence remains explicit: YES/NO
- Raw URL arrays used as evidence truth: YES/NO
- Academy-only alternate evidence/file schema introduced: YES/NO
- Project-only alternate evidence/file schema introduced: YES/NO
- Live/deploy verification claimed: YES/NO

Branch is blocked if any required favorable condition is NO or any forbidden drift condition is YES.
```

---

## 9. Exact Merge Gate Summary

Use this exact merge-gate summary.

```md
## Wave 2 Branch C Merge Gate Summary
- Scope gate passed: YES/NO
- Attribution gate passed: YES/NO
- Shared evidence truth gate passed: YES/NO
- Degraded/unresolved visibility gate passed: YES/NO
- Anti-schema-drift gate passed: YES/NO
- Truth-boundary gate passed: YES/NO

Final merge result: PASS/FAIL
```

### Merge rule
This Wave 2 branch is mergeable only if every listed gate is `YES` and final merge result is `PASS`.

---

## 10. Branch Stop Conditions

Do not merge this branch if any of the following occur:
- targeted recommendation-linked evidence is display-only and not attributable to canonical source objects
- targeted project-context evidence no longer depends on shared file-spine truth
- grouped or summary logic is duplicated locally instead of reused from shared helpers
- degraded/unresolved evidence is hidden or converted to success-like emptiness
- academy-only or project-only alternate evidence/file schema is introduced
- PR language implies deploy or live completion

If any stop condition triggers:
- block merge
- remediate within this branch scope only
- do not continue to broader Wave 2 closeout or expansion yet

---

## 11. Exact Post-Merge Repo-Truth Statement

After this branch merges, record the following statement.

```md
## Wave 2 Branch C Post-Merge Repo Truth

Now true in repo:
- targeted recommendation-linked surfaces adopt shared evidence-depth behavior
- targeted project-context surfaces adopt shared evidence-depth behavior where shared file-spine truth is authoritative
- grouped evidence and evidence summary behavior are reused on targeted recommendation/project surfaces
- unresolved/degraded evidence is explicit on targeted recommendation/project surfaces

Not yet true from this merge alone:
- deploy/runtime behavior is not yet verified
- live SaaS/LMS convergence is not yet verified
- broader product completion beyond targeted surfaces is not yet verified
```

### Continuation rule
After this statement is recorded:
- continue only to the next bounded Wave 2 closeout or expansion artifact
- do not imply Wave 2 completion from this branch alone

---

## 12. Founder Hands-Off Rule

This Wave 2 adoption branch should not require founder routing under normal conditions.

Do not escalate for:
- ordinary recommendation/project evidence adoption scoping
- ordinary attribution validation
- ordinary anti-drift review

Escalate only if:
- repo truth for recommendation/project evidence linkage cannot be determined
- required changes materially fork product direction
- deploy verification is required and externally blocked

---

## 13. Definition of Done

050J is complete when:
- exact Wave 2 recommendation/project evidence adoption branch scope is frozen
- exact target file classes are frozen
- exact PR starter body is frozen
- exact validation note is frozen
- exact merge gate summary is frozen
- exact post-merge repo-truth statement is frozen
- next artifact is identified

---

## 14. Next Artifact

**FCA_PACKET_050K_WAVE2_EVIDENCE_PROGRAM_CLOSEOUT_OR_WAVE3_ENTRY_DECISION.md**

This next artifact must convert the recommendation/project evidence adoption branch into either a Wave 2 evidence-program closeout decision or the exact Wave 3 entry decision boundary.
