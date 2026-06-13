# FCA_PACKET_050I_WAVE2_RECOMMENDATION_PROJECT_EVIDENCE_ADOPTION_BOUNDARY

Status: Proposed  
Sequence: Follows 050H  
Scope: Exact bounded Wave 2 lane for recommendation and project-context evidence-depth adoption, including scope guardrails, target surface classes, truth-boundary rules, validation gates, and acceptance criteria  
Truth boundary: This packet defines the next bounded Wave 2 lane only. It does not claim that Wave 1 is already closed successfully, that prior Wave 2 evidence-depth branches are already merged, or that deploy/live convergence has been verified.

---

## 1. Issue

050H established the decision gate for whether the first Wave 2 evidence-depth lane closes or continues. The default continuation path, if continuation is needed, is broader recommendation and project-context evidence-depth adoption. That path now needs an exact boundary so evidence utility can expand without creating a second product lane, duplicating evidence truth, or drifting away from the flagship Contractor Command spine.

Without an exact boundary:
- recommendation evidence adoption may become display-only instead of operationally attributable
- project-context evidence adoption may fork from Academy evidence behavior
- evidence interaction can fragment between recommendation, project, readiness, and credential contexts
- Wave 2 can sprawl beyond the bounded evidence-depth continuation path

---

## 2. Decision

Freeze the next bounded Wave 2 lane as **recommendation and project-context evidence-depth adoption**.

### Lane objective
Extend the shared evidence interaction model from readiness/credential surfaces into:
- recommendation-linked evidence surfaces
- project-context evidence surfaces already tied to the shared file spine

### Boundary principle
This lane is valid only if it preserves:
- one shared file spine
- one selector-driven evidence truth path
- one audit/explanation model
- one unified SaaS + LMS product direction

---

## 3. Exact Scope Boundary

### Included in this lane
- recommendation-linked evidence interaction depth where canonical ids already exist
- project-context evidence interaction depth where the shared file spine is already the source of truth
- grouped evidence reuse across recommendation and project-context surfaces
- shared evidence summary reuse across recommendation and project-context surfaces
- explicit unresolved/degraded evidence handling on targeted recommendation and project-context surfaces
- narrow compatibility fixes required to consume the shared evidence interaction layer

### Excluded from this lane
- storage-provider implementation changes
- academy-only or project-only alternate evidence schema
- unrelated dashboard or navigation redesign
- unrelated auth/route/deploy changes
- broader expansion into unrelated product lanes
- deploy/live verification claims

---

## 4. Product Spine Justification

This lane strengthens FCA Contractor Command because it improves:
- project/job evidence continuity
- recommendation-to-action utility
- auditability across guidance and execution contexts
- shared SaaS + LMS operational trust surfaces
- explanation and follow-through of evidence-backed recommendations

This lane must remain subordinate to the same unified spine already established for readiness, credential, file, and evidence continuity.

---

## 5. Exact Target Surface Classes

Target only the following file classes or their exact current equivalents.

### Recommendation-linked surfaces
- `src/components/academy/*Recommendation*`
- `src/components/academy/*Rail*`
- `src/components/academy/*Card*`
- limited recommendation detail surfaces already carrying canonical ids

### Project-context evidence surfaces
- `src/components/files/*`
- `src/pages/*Project*` or `src/components/*Project*` only where the shared file spine is already the evidence source of truth
- limited project/evidence viewers already aligned to the shared file spine

### Shared imports/utilities/components
- `src/lib/files/*`
- `src/lib/academy/*Evidence*`
- `src/lib/academy/selectors/*`
- `src/components/academy/*Evidence*`
- `src/components/academy/*Attachment*`
- shared evidence interaction components already created in earlier Wave 2 evidence-depth work

### Forbidden target classes in this lane
- readiness/credential deep rewrites beyond narrow compatibility fixes
- unrelated payment/commercial modules
- unrelated admin surfaces
- storage or environment configuration

---

## 6. Required Behaviors

### Recommendation evidence behavior
Targeted recommendation surfaces must:
- render linked evidence through shared grouped-evidence helpers where canonical ids exist
- preserve attribution from recommendation → source object → linked evidence
- distinguish between no evidence, unresolved evidence, and degraded evidence
- avoid display-only evidence references without real shared linkage

### Project-context evidence behavior
Targeted project-context surfaces must:
- reuse shared grouped-evidence and summary helpers where the same file spine objects are already authoritative
- preserve project/job context association without introducing a second evidence schema
- surface unresolved/degraded evidence explicitly

### Shared-truth behavior
The lane must ensure:
- grouped evidence reuse remains shared and selector-driven
- recommendation and project-context surfaces do not reintroduce local attachment truth
- no alternate project-only or academy-only evidence object becomes canonical

---

## 7. Exact Apply Order

Apply this lane in the following order:

1. inspect current recommendation-linked evidence touchpoints
2. inspect current project-context evidence touchpoints already tied to shared file spine truth
3. patch recommendation surfaces to consume grouped recommendation evidence helpers where canonical ids exist
4. patch recommendation surfaces to consume shared evidence summary helpers
5. patch recommendation degraded/unresolved evidence rendering
6. patch project-context surfaces to consume grouped project/shared evidence helpers where shared file spine truth already exists
7. patch project-context shared evidence summary rendering
8. patch project-context degraded/unresolved evidence rendering
9. verify no alternate schema or unrelated redesign leaked into the lane
10. define or open the corresponding bounded implementation branch/PR

### Apply rule
Do not patch project-context surfaces until recommendation adoption behavior is stabilized for the lane or explicitly justified otherwise.

---

## 8. Validation Gates

Every implementation step in this lane must pass all gates below.

### Gate 1 — attribution gate
- recommendation-linked evidence remains attributable to canonical source objects
- no display-only fake evidence linkage is introduced

### Gate 2 — shared truth gate
- targeted recommendation and project-context surfaces consume shared grouped-evidence and summary behavior
- no raw URL arrays or local-only evidence truth reappear

### Gate 3 — no schema drift gate
- no academy-only alternate evidence schema introduced
- no project-only alternate evidence schema introduced
- no surface-specific ad hoc evidence object becomes canonical

### Gate 4 — degraded-state visibility gate
- unresolved evidence remains explicit
- degraded evidence remains explicit
- empty-success UI does not mask evidence failure or missing state

### Gate 5 — scope gate
- no unrelated deploy/auth/dashboard/payment/route redesign enters the lane

### Gate 6 — truth-boundary gate
- no repo-only change is described as deploy/live verified without separate proof

---

## 9. Acceptance Criteria

This lane is acceptable only when all are true:

1. Recommendation-linked evidence interaction exists on targeted surfaces where canonical ids already exist.
2. Project-context evidence interaction exists on targeted shared-file-spine surfaces.
3. Shared grouped-evidence and summary behavior are reused rather than duplicated locally.
4. Unresolved/degraded evidence states are explicitly distinguishable on targeted surfaces.
5. No alternate academy-only or project-only evidence schema is introduced.
6. Validation evidence exists for targeted adoption and anti-drift checks.
7. Changes remain inside the unified SaaS + LMS flagship spine.

---

## 10. Validation Checklist Template

Use this exact checklist for this lane.

```md
## Wave 2 Recommendation + Project Evidence Adoption Validation
- Scope stayed inside recommendation/project evidence adoption only: YES/NO
- Recommendation-linked evidence remains attributable where used: YES/NO
- Project-context evidence uses shared file-spine truth where targeted: YES/NO
- Shared grouped evidence behavior is reused rather than duplicated: YES/NO
- Shared evidence summary behavior is reused rather than duplicated: YES/NO
- Unresolved/degraded evidence remains explicit: YES/NO
- Raw URL arrays used as evidence truth: YES/NO
- Academy-only alternate evidence schema introduced: YES/NO
- Project-only alternate evidence schema introduced: YES/NO
- Live/deploy verification claimed: YES/NO

Final lane result: PASS/FAIL
```

### Validation rule
The lane fails if any required favorable condition is `NO` or any forbidden drift condition is `YES`.

---

## 11. Truth-Boundary Rule

Any output from this lane must clearly distinguish:
- repo-planning truth
- repo-implementation truth
- deploy truth
- live/customer truth

No recommendation/project-context evidence-depth artifact may imply deploy or live success unless a separate verification artifact exists.

---

## 12. Post-Lane Continuation Rule

After this lane is implemented or reviewed:
1. record what recommendation/project-context evidence utility is now true in repo truth
2. record what remains unresolved
3. decide whether the broader Wave 2 evidence-depth program closes or continues
4. preserve single-spine product direction

Do not branch into unrelated Wave 2 lanes from this step without an explicit new boundary artifact.

---

## 13. Founder Hands-Off Rule

This lane should not require founder routing under normal conditions.

Do not escalate for:
- ordinary recommendation/project evidence scoping
- ordinary attribution validation
- ordinary anti-drift review

Escalate only if:
- repo truth for recommendation/project evidence linkage cannot be determined
- a required change materially forks product direction
- deploy verification is required and externally blocked

---

## 14. Definition of Done

050I is complete when:
- exact Wave 2 recommendation/project evidence adoption scope is frozen
- exact target surface classes are frozen
- validation gates are frozen
- acceptance criteria are frozen
- truth-boundary rules are frozen
- next artifact is identified

---

## 15. Next Artifact

**FCA_PACKET_050J_WAVE2_RECOMMENDATION_PROJECT_EVIDENCE_BRANCH_STARTER.md**

This next artifact must convert the 050I boundary into the exact execution-starter packet for the corresponding bounded Wave 2 implementation branch.
