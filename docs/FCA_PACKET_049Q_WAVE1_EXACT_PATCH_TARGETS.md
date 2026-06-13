# FCA_PACKET_049Q_WAVE1_EXACT_PATCH_TARGETS

Status: Proposed  
Sequence: Follows 049P  
Scope: Exact repo-facing patch targets for Wave 1 authority convergence, recommendation rails, readiness/credential panels, and shared file/evidence linkage  
Truth boundary: This packet defines exact patch targets and sequencing. It does not claim that the identified files already contain the target contracts or that production is already aligned.

---

## 1. Issue

049P established the Wave 1 cut plan, but execution can still drift unless the next step names exact patch targets, apply order, and enforcement checks at file level.

Without exact targets:
- different branches may patch different authority consumers
- recommendation rails may converge without readiness parity
- readiness and credential panels may normalize visually but not structurally
- file/evidence linking may remain ad hoc and non-canonical

---

## 2. Decision

Translate 049P into a single exact patch-target artifact for the `Future-Contractors-of-America-LLC/fca-bid-tracker` repo.

Wave 1 patching is constrained to five patch sets:

1. shared authority contracts + normalization
2. dashboard + recommendation rail consumers
3. readiness panel convergence
4. credential panel convergence
5. shared file / evidence linkage + anti-regression checks

---

## 3. Target Repo

- Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
- Default branch truth baseline used for this packet: `main`

---

## 4. Patch Set A — Shared Contracts and Normalization Layer

### Purpose
Create one shared state contract for authority, readiness, credential, and recommendation consumption.

### Exact target files

#### Create
- `src/lib/academy/authorityConsumerState.ts`
- `src/lib/academy/readinessState.ts`
- `src/lib/academy/credentialState.ts`
- `src/lib/academy/recommendationState.ts`
- `src/lib/academy/academyEvidenceLink.ts`
- `src/lib/academy/normalizeAcademyStatus.ts`
- `src/lib/academy/normalizeAuthorityWarnings.ts`

#### If existing shared academy utility location differs
Apply equivalent placement under existing academy/lib/shared structure, but keep one canonical export surface.

### Required exports

#### `authorityConsumerState.ts`
- `AuthorityConsumerState`
- `AuthorityWarning`
- `buildDegradedAuthorityConsumerState()`
- `hasAuthorityWarnings()`

#### `readinessState.ts`
- `ReadinessState`
- `NormalizedReadinessStatus`

#### `credentialState.ts`
- `CredentialState`
- `NormalizedCredentialStatus`

#### `recommendationState.ts`
- `RecommendationState`
- `RecommendationPriority`
- `RecommendationActionState`

#### `academyEvidenceLink.ts`
- `AcademyEvidenceLink`
- `LinkedObjectType`
- `EvidenceRelation`

#### `normalizeAcademyStatus.ts`
Must normalize to:
- `ready`
- `in_progress`
- `blocked`
- `expired`
- `missing_evidence`
- `needs_review`
- `unavailable`

### Required rules
- no local panel-specific status naming outside normalization map
- no recommendation rendering from raw provider payloads without adaptation
- degraded and unresolved authority states must be explicit objects, not silent nulls

---

## 5. Patch Set B — Dashboard and Recommendation Rail Consumers

### Purpose
Move overview surfaces and recommendation rails onto shared contracts.

### Exact target files

#### Inspect then patch likely dashboard surfaces
- `src/pages/academy/*`
- `src/components/academy/*Dashboard*`
- `src/components/academy/*Overview*`
- `src/components/academy/*Recommendation*`

### Primary candidate patch files
If present, patch these exact matching files first:
- any academy dashboard page component
- any academy overview card component
- any recommendation rail/list/card component

### Required patch actions
- replace direct provider-specific authority reads with shared selector/adaptor consumption
- route recommendation input through `RecommendationState`
- render visible degraded / warning state when authority is unresolved
- preserve existing UI shell where possible; patch logic first, layout second

### Must not do
- do not duplicate normalization inside component files
- do not invent display-only recommendation objects inside JSX
- do not suppress warnings for incomplete authority states

---

## 6. Patch Set C — Readiness Panel Convergence

### Purpose
Make readiness panels consume normalized state and support evidence linking.

### Exact target files

#### Inspect and patch likely readiness files
- `src/components/academy/*Readiness*`
- `src/pages/academy/*Readiness*`
- `src/components/academy/*Progress*`

### Required patch actions
- panel input type must become `ReadinessState`
- use `normalizeAcademyStatus.ts` outputs only
- expose `blockingReasons[]`
- expose `supportingEvidenceIds[]`
- expose `recommendedActionIds[]`
- render unresolved / unavailable states explicitly

### Required UI behaviors
- show status badge from normalized vocabulary only
- show stale or degraded authority warning zone if data source unresolved
- support future deeplink hooks for evidence and remediation without changing panel contract again

---

## 7. Patch Set D — Credential Panel Convergence

### Purpose
Make credential surfaces structurally aligned with readiness and recommendation flows.

### Exact target files

#### Inspect and patch likely credential files
- `src/components/academy/*Credential*`
- `src/pages/academy/*Credential*`
- `src/components/academy/*Certificate*`

### Required patch actions
- panel input type must become `CredentialState`
- use normalized status values only
- expose `evidenceFileIds[]`
- expose review state and expiration state clearly
- map warning states through shared authority/degraded handling

### Required UI behaviors
- must distinguish `expired` from `missing_evidence`
- must distinguish `needs_review` from `in_progress`
- must permit attachment summary region fed by shared evidence links

---

## 8. Patch Set E — Shared File / Evidence Linkage Enforcement

### Purpose
Attach Wave 1 surfaces to the shared file spine and remove ad hoc linking.

### Exact target files

#### Create
- `src/lib/files/academyEvidenceSelectors.ts`
- `src/components/academy/AcademyEvidenceAttachmentList.jsx` or `.tsx`
- `src/components/academy/AcademyEvidenceAttachmentSummary.jsx` or `.tsx`

#### Patch candidate shared file components
- `src/components/files/*`
- `src/lib/files/*`
- any existing project file or briefing components reused by academy surfaces

### Required patch actions
- map `evidenceFileIds[]` through shared selectors
- render file references through shared file spine objects only
- support grouped display by logical folder if folder data is present
- preserve null-safe degraded behavior when file records are unresolved

### Must not do
- do not use component-local ad hoc `href` arrays as evidence truth
- do not attach credential/readiness evidence directly to raw URLs
- do not fork a separate academy-only file schema

---

## 9. Selector / Adapter Touchpoints

### Required adapter layer behavior

Implement or patch shared selectors/adapters so each Wave 1 surface consumes one normalized shape:

- `selectAuthorityConsumerState(...)`
- `selectReadinessState(...)`
- `selectCredentialState(...)`
- `selectRecommendationState(...)`
- `selectAcademyEvidenceLinks(...)`

If selectors already exist under different names, converge behavior rather than duplicating function.

### Required target location
Preferred:
- `src/lib/academy/selectors/*`

Fallback:
- existing shared selector directory if repo already centralizes selectors elsewhere

---

## 10. Route-Level Apply Order

Apply in this order:

1. contracts and normalization utilities
2. authority selectors / adapters
3. dashboard overview consumers
4. recommendation rail consumers
5. readiness panels
6. credential panels
7. shared evidence attachment components
8. validation and anti-regression checks

Reason: routes must not move before shared contracts exist.

---

## 11. Validation Checklist

Wave 1 patching is invalid unless all checks pass:

### Contract validation
- all Wave 1 surfaces import shared normalized types instead of defining local equivalents
- no duplicate normalized status enums exist in component folders

### Consumer validation
- dashboard components do not read raw provider payloads directly
- recommendation rails do not synthesize local fake recommendation state
- readiness and credential panels do not invent non-canonical statuses

### Evidence validation
- evidence attachments resolve through shared selectors
- no ad hoc academy-only file object shape is introduced
- unresolved file/evidence state renders explicit degraded output

### Warning validation
- unresolved authority warnings appear visibly in consumer surfaces
- no silent fallback to empty-success UI state

---

## 12. Anti-Regression Rules

- Do not rewrite Wave 1 layouts unless required for contract adoption.
- Do not combine provider cleanup and UI redesign in the same patch set.
- Do not remove existing warning messaging unless replaced by normalized warning rendering.
- Do not add academy-only persistence rules that bypass the shared file spine.
- Do not claim live convergence unless verified in repo and, separately, in deploy truth.

---

## 13. PR Sequencing Recommendation

### PR 1
**Title:** Wave 1 shared academy authority contracts and normalization

Contains:
- Patch Set A
- selector/adaptor baseline only

### PR 2
**Title:** Wave 1 dashboard and recommendation consumer convergence

Contains:
- Patch Set B
- no readiness/credential detail rewrites yet

### PR 3
**Title:** Wave 1 readiness and credential panel convergence

Contains:
- Patch Set C
- Patch Set D

### PR 4
**Title:** Wave 1 academy evidence linkage and anti-regression validation

Contains:
- Patch Set E
- validation artifact(s)

If repo pressure requires fewer PRs:
- merge PR 2 and PR 3
- keep PR 1 separate
- keep PR 4 separate

---

## 14. Definition of Done

049Q is complete when:
- exact target files and patch sets are named
- route-level apply order is fixed
- validation checks are fixed
- anti-regression rules are fixed
- the next artifact is identified to convert these exact targets into branch-by-branch execution steps

---

## 15. Next Artifact

**FCA_PACKET_049R_WAVE1_BRANCH_BY_BRANCH_EXECUTION_PLAN.md**

This next artifact must convert 049Q into:
- branch names
- exact commit grouping
- patch batching
- PR order
- validation handoff steps
- merge readiness criteria
