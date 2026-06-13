# FCA_PACKET_049P_WAVE1_IMPLEMENTATION_CUT_PLAN

Status: Proposed  
Sequence: Follows 049M, 049N, 049O  
Scope: Wave 1 implementation cut for Academy authority convergence, recommendation rails, readiness panels, credential surfaces, and shared SaaS/LMS storage-linked execution surfaces  
Truth boundary: This packet is an implementation cut plan. It does not claim that all Wave 1 changes are already merged, deployed, or live.

---

## 1. Issue

Packet sequence 049M through 049O established the authority migration direction, dashboard consumer convergence, recommendation rail convergence, and academy readiness / credential panel convergence, but the work now needs a single implementation cut plan so execution does not drift into disconnected patches.

Without a bounded cut plan:

- dashboard authority surfaces can converge while readiness panels remain legacy-backed
- recommendation rails can render against mixed authority inputs
- credential panels can remain visually aligned but not state-aligned
- SaaS and LMS can look unified while file / folder persistence and academy truth still diverge at object level

---

## 2. Risk

If Wave 1 ships as separate cosmetic patches:

1. **Authority drift increases** between dashboard, readiness, credential, and recommendation surfaces.
2. **Founder dependence increases** because cross-surface verification requires manual interpretation.
3. **Persistent storage advancement weakens** because LMS and SaaS may attach to different object assumptions.
4. **Customer-facing trust decreases** because panels appear unified while actions and evidence links are inconsistent.

---

## 3. Decision

Wave 1 will be executed as one controlled cut with four bounded workstreams:

- **WS1 — Shared authority consumer convergence**
- **WS2 — Recommendation and remediation rail convergence**
- **WS3 — Readiness and credential panel convergence**
- **WS4 — Shared file / folder / evidence linkage enforcement**

All four must bind to one product spine:

- tenant
- user
- academy member / enrollment
- project / job when applicable
- readiness state
- credential state
- recommendation state
- file spine
- audit event
- Auricrux action

---

## 4. Wave 1 Objective

Deliver the first customer-credible shared SaaS + LMS operational cut where:

- dashboard authority consumers read from normalized sources
- recommendation rails are driven by the same authority contract as readiness and credential panels
- readiness and credential surfaces reflect shared normalized state rather than local interpretation
- evidence, lesson assets, credential attachments, and project-linked academy files attach to one file spine

---

## 5. Workstream Breakdown

### WS1 — Shared Authority Consumer Convergence

#### Goal
Normalize route-level and dashboard-level consumers onto one shared academy authority contract.

#### Required outputs
- shared authority selector / adapter contract
- removal or quarantine of legacy authority reads in Wave 1 surfaces
- explicit fallback state for missing authority
- audit-safe warning presentation for unresolved authority

#### Minimum target surfaces
- academy dashboard overview cards
- readiness summary widgets
- credential summary widgets
- recommendation preview widgets

#### Acceptance rule
No Wave 1 surface may independently reinterpret provider authority if a normalized authority object is available.

---

### WS2 — Recommendation and Remediation Rail Convergence

#### Goal
Ensure recommendation rails consume normalized readiness / credential / telemetry-derived state and are not isolated UI lanes.

#### Required outputs
- common recommendation rail input contract
- remediation action object format
- explicit source attribution for each recommendation
- stable empty-state and degraded-state handling

#### Required linkage
Each recommendation should support linkage, where applicable, to:
- readiness gap
- credential deficiency
- module / lesson / remediation asset
- project or project-adjacent evidence object
- file / attachment record

#### Acceptance rule
Recommendations cannot exist as display-only copy. They must be structurally attributable to a source object or explicit unresolved state.

---

### WS3 — Readiness and Credential Panel Convergence

#### Goal
Bring readiness and credential panels onto the same state contract so they can support Academy advancement, feature gating, and customer-facing trust.

#### Required outputs
- shared readiness panel model
- shared credential panel model
- normalized status vocabulary
- explicit warning / stale / incomplete states

#### Required normalized statuses
At minimum:
- ready
- in_progress
- blocked
- expired
- missing_evidence
- needs_review
- unavailable

#### Acceptance rule
Readiness and credential panels must not invent local status labels when canonical normalized status is available.

---

### WS4 — Shared File / Folder / Evidence Linkage Enforcement

#### Goal
Make Wave 1 panels and actions evidence-aware using the same persistent file spine boundary already required for SaaS + LMS convergence.

#### Required outputs
- file attachment display contract for readiness / credential panels
- recommendation-to-evidence link contract
- academy asset linkage contract
- folder-aware grouping rule for academy resources and credential evidence

#### Minimum linked object support
- credential evidence files
- remediation attachments
- lesson asset files
- certificate artifacts
- project-linked academy support documents

#### Acceptance rule
Wave 1 surfaces may reference files only through shared file spine objects, not ad hoc URLs or component-local structures.

---

## 6. Canonical Shared Objects for Wave 1

### authority_consumer_state
- tenantId
- userId
- academyContextId
- authorityStatus
- authorityWarnings[]
- readinessSummary
- credentialSummary
- recommendationSummary
- lastVerifiedAt

### readiness_state
- id
- tenantId
- userId
- academyContextId
- domain
- normalizedStatus
- completionPercent
- blockingReasons[]
- supportingEvidenceIds[]
- recommendedActionIds[]
- updatedAt

### credential_state
- id
- tenantId
- userId
- credentialType
- normalizedStatus
- awardedAt nullable
- expiresAt nullable
- evidenceFileIds[]
- reviewStatus
- updatedAt

### recommendation_state
- id
- tenantId
- userId
- sourceType
- sourceId
- recommendationType
- title
- detail
- priority
- linkedReadinessId nullable
- linkedCredentialId nullable
- linkedFileIds[]
- linkedLessonId nullable
- actionState
- generatedAt

### academy_evidence_link
- id
- tenantId
- linkedObjectType
- linkedObjectId
- fileId
- relation
- createdAt
- createdBy

---

## 7. Implementation Cut Order

### Cut 1 — Contract and selector layer
Implement first:
- shared authority consumer contract
- shared readiness / credential / recommendation object interfaces
- status normalization map
- missing / stale / degraded state rules

### Cut 2 — Dashboard and recommendation consumers
Implement second:
- dashboard overview surfaces
- recommendation rails
- explicit authority warning handling

### Cut 3 — Readiness and credential panels
Implement third:
- readiness detail panel
- credential detail panel
- evidence attachment rendering
- normalized status display

### Cut 4 — File/folder evidence binding
Implement fourth:
- shared file attachment components
- academy evidence link usage
- folder grouping rules
- briefing-aware attachment slots where available

### Cut 5 — Validation and anti-regression
Implement fifth:
- surface inventory check
- authority-source audit check
- no-local-status-label check
- no-ad-hoc-file-link check

---

## 8. Non-Goals for 049P

This packet does **not** claim or require in the same cut:

- full accreditation workflow completion
- full transcript ledger completion beyond already planned packet sequence
- live production-grade feature gate rollout to all modules
- final native blob/provider implementation if storage credentials are not yet verified
- complete academy curriculum buildout

This is a **Wave 1 convergence cut**, not total LMS completion.

---

## 9. Required Repo-Facing Outputs

Wave 1 implementation should be expressed through repo-visible artifacts in this order:

1. shared contracts / selectors
2. dashboard authority consumer patch
3. recommendation rail convergence patch
4. readiness panel convergence patch
5. credential panel convergence patch
6. shared file/evidence attachment patch
7. validation / anti-regression artifact

---

## 10. Validation Gates

Wave 1 is not complete unless all are true:

- every Wave 1 academy dashboard consumer reads normalized authority or explicit degraded fallback
- recommendation rails map to attributed source state
- readiness and credential surfaces use normalized status vocabulary
- file / evidence references route through shared file spine objects
- no Wave 1 surface silently falls back to browser-local-only authority interpretation
- warnings are visible where live truth is unresolved

---

## 11. Founder Hands-Off Enforcement

Founder escalation is not permitted for normal Wave 1 continuation.

Escalate only if blocked by:
- missing repo permission
- missing tenant credential / storage credential
- material uncertainty about legal or credential-issuing claims
- inability to verify the real source of truth for a required authority object

---

## 12. Recommended Branch / PR Execution Pattern

- Branch A: shared contracts and normalization
- Branch B: dashboard + recommendation rail convergence
- Branch C: readiness + credential panel convergence
- Branch D: file / evidence linkage enforcement
- Branch E: validation and anti-regression packet

If execution capacity is limited, Branches B and C may be combined, but contracts must land first.

---

## 13. Definition of Done

049P is complete when the implementation cut plan is fixed as the canonical execution boundary for the next repo-facing patch wave and the next artifact is generated to convert this cut plan into exact patch targets.

---

## 14. Next Artifact

**FCA_PACKET_049Q_WAVE1_EXACT_PATCH_TARGETS.md**

This next artifact must translate 049P into:
- exact file targets
- expected component / selector touchpoints
- route-level apply order
- validation checklist
- non-regression rules
- PR sequencing recommendation
