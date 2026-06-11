# FCA Contractor Command — Live Route Gap Audit v1

Status: Active Draft  
Scope: Packet 036 live shell audit against route acceptance enforcement

## Purpose

This audit classifies the current live shell routes against the flagship route acceptance enforcement.

It distinguishes between:
- **Passes contract**
- **Shell-only with truthful missing-wiring state needed**
- **Invalid or misleading**

## Audit Rule

A route is not considered product-capable because it renders UI.

A route must prove:
1. governed object identity
2. backend handoff clarity
3. durable output truth
4. audit event truth
5. downstream continuity

## Classification Summary

| Route | Classification | Reason |
|---|---|---|
| `/contact` | Invalid / misleading | Uses local walkthrough-session provisioning instead of governed lead creation |
| `/portal/opportunities/:opportunityId` | Invalid / missing | Required flagship route is absent from live router |
| `/portal/projects` | Shell-only with truthful missing-wiring state needed | Reads governed-looking project data, but can fall back to localStorage continuity and does not expose route-level missing-wiring truth |
| `/portal/projects/:projectId` | Invalid / missing | Required flagship project workspace route is absent from live router |
| `/portal/files` | Shell-only with truthful missing-wiring state needed | Uses governed-looking file actions but falls back to seeded state and does not clearly disclose non-live backend gaps |
| `/portal/audit` | Shell-only with truthful missing-wiring state needed | Uses governed-looking audit reads but falls back to seeded state and does not clearly disclose non-live audit sourcing |

## Route Findings

---

## 1. `/contact`

### Classification
**Invalid / misleading**

### Governs
Should govern:
- `Lead`
- optional `Client`
- optional `Site`

### Current behavior observed
- route is present and customer-facing
- route emphasizes walkthrough activation and conversion movement
- `ContactActionCenter` provisions an authenticated session directly by calling local `login(...)`
- walkthrough actions route directly into portal surfaces such as `/portal/platform`, `/portal/messages`, `/portal/billing`, and `/portal/admin`
- no evidence was found that `/contact` performs `POST /api/leads`

### Why it fails
This route currently bypasses the flagship intake contract.

Instead of creating a governed lead object, it creates a walkthrough session posture. That means:
- no governed `Lead`
- no durable intake object
- no `lead-created` audit event truth
- no trustworthy qualification handoff

### Required remediation
- replace or subordinate direct walkthrough-session activation behind governed lead creation
- wire intake to `POST /api/leads`
- return a durable lead confirmation state
- remove or clearly relabel any language implying tracked intake if no lead object exists

---

## 2. `/portal/opportunities/:opportunityId`

### Classification
**Invalid / missing**

### Governs
Should govern:
- `Opportunity`
- linked `Estimate`
- linked `FileAsset`

### Current behavior observed
- route exists in canonical docs
- route does not exist in `src/routes.js`
- no live portal page implementing the governed opportunity workspace was found

### Why it fails
The route is part of the flagship enforcement set but is not actually present in live router truth.

Without this route:
- the lead-to-project spine has no governed opportunity workspace
- estimate/proposal/file continuity is stranded between intake and project routes
- project conversion cannot be truthfully represented as a live route flow

### Required remediation
- implement `/portal/opportunities/:opportunityId`
- bind canonical `activeOpportunityId`
- expose estimate, file, and conversion readiness
- declare missing-wiring state for any backend actions not yet live

---

## 3. `/portal/projects`

### Classification
**Shell-only with truthful missing-wiring state needed**

### Governs
- `Project`

### Current behavior observed
- route is present and renders project list and active project selection
- route uses `useProjectWorkspace()`
- hook attempts `fetchWorkflowProjects()` and `mutateWorkflowProject(...)`
- hook falls back to `localStorage` continuity when API calls fail
- route presents strong continuity language such as live workspace state and synchronized project flow
- route does not explicitly warn when operating in fallback/local-only mode

### Why it does not yet pass
This route has useful product-spine shape, but it still allows fallback execution without clear customer-visible missing-wiring disclosure.

That means:
- governed object posture is partially present
- backend handoff exists conceptually
- durable output truth can degrade into local continuity only
- route messaging is stronger than verified execution truth when fallback is active

### What is working
- active project identity exists
- route can select active project
- project context can drive downstream file and audit behavior
- the route is materially closer to contract than contact/files/audit

### Required remediation
- surface explicit fallback banner when `meta.backingSource !== "api-workflow-store"`
- distinguish API-backed project state from local continuity state
- avoid implying governed execution mutation when only local fallback is active
- add direct path to governed project workspace route once `/portal/projects/:projectId` exists

---

## 4. `/portal/projects/:projectId`

### Classification
**Invalid / missing**

### Governs
Should govern:
- `Project`
- related `FileAsset`
- related `AuditEvent`
- related `AuricruxAction`

### Current behavior observed
- route exists in canonical docs and enforcement artifacts
- route does not exist in `src/routes.js`
- no live routed page matching this path was found

### Why it fails
The flagship project continuity home is absent.

That means current project continuity is compressed into `/portal/projects` and cannot yet:
- bind route-param project identity
- support stable deep links
- act as real project continuity home for files/audit/Auricrux
- satisfy the flagship route contract

### Required remediation
- implement `/portal/projects/:projectId`
- bind route param to canonical active project context
- expose project header, file summary, audit summary, and Auricrux summary
- make `/portal/projects` the selector/list route and `/portal/projects/:projectId` the continuity home

---

## 5. `/portal/files`

### Classification
**Shell-only with truthful missing-wiring state needed**

### Governs
- `FileAsset`
- `EvidenceLink`

### Current behavior observed
- route is present and project-aware
- route uses `useWorkflowEvidence(projectId)`
- hook attempts `/api/files` and `/api/workflow-audit`
- hook falls back to seeded `portalFiles` and `projectAuditEvents`
- route supports create/classify/link/briefing actions through `mutateWorkflowFile(...)`
- file creation currently uses a custom `create-file-record` mutation path over `PATCH /api/files`, not the canonical `POST /api/files` upload/register contract
- route strongly presents governed file-spine language even while fallback is possible

### Why it does not yet pass
This route has meaningful execution-shape, but not truthful live-state enforcement.

Specific gaps:
- fallback seeded state is not clearly disclosed to the user
- canonical upload/register contract is not yet aligned to the documented `POST /api/files` model
- route can appear more live than repo truth proves

### What is working
- active project context is preserved
- ownerObject linkage is modeled
- classification/linkage/briefing states are modeled
- file/audit continuity is conceptually attached to project root

### Required remediation
- expose explicit fallback banner when `meta.backingSource !== "api-workflow-store"`
- label create/classify/link/briefing actions as shell-only or simulated when backend write path is not canonical/live
- align create-file behavior to documented register/upload contract
- prevent customer-facing language from implying native document intelligence or durable upload completeness when not verified

---

## 6. `/portal/audit`

### Classification
**Shell-only with truthful missing-wiring state needed**

### Governs
- `AuditEvent`
- related `AuricruxAction`

### Current behavior observed
- route is present and project-aware
- route uses `useWorkflowAudit(projectId)`
- hook attempts `/api/workflow-audit`
- hook falls back to seeded `projectAuditEvents`
- route exposes event-type and actor-type filtering
- route presents strong continuity language around accountable execution and Auricrux operating history
- route does not explicitly warn when audit data is fallback rather than API-backed

### Why it does not yet pass
The route has the right shape but not the right truth posture.

Specific gaps:
- fallback audit state is not clearly disclosed
- route can display audit-looking history even when API-backed audit truth is unavailable
- customer-facing copy can overstate accountable execution readiness

### What is working
- actor/event filtering exists
- project scoping exists
- audit timeline surface exists
- route is positioned correctly in the flagship spine

### Required remediation
- surface explicit fallback banner when `auditMeta.backingSource !== "api-workflow-store"`
- label seeded/fallback audit state truthfully
- prevent decorative audit theater from being confused with governed audit truth
- add visible distinction between read-only shell audit and API-backed audit continuity

## Highest-Priority Route Defects

### P1 — Replace misleading contact behavior
The current public intake route is the most serious truth defect because it simulates conversion into authenticated product access without governed lead creation.

### P2 — Implement missing opportunity route
The flagship spine cannot be honestly represented without `/portal/opportunities/:opportunityId`.

### P3 — Implement missing project detail route
The flagship project continuity home `/portal/projects/:projectId` is absent.

### P4 — Add explicit fallback-state disclosure
Projects, Files, and Audit all need visible fallback/missing-wiring truth before they can be described as product-capable.

## Immediate Remediation Sequence

1. correct `/contact` intake truth posture
2. add `/portal/opportunities/:opportunityId` shell with explicit missing-wiring guards
3. add `/portal/projects/:projectId` shell with canonical project binding
4. add API/fallback disclosure banners to `/portal/projects`, `/portal/files`, and `/portal/audit`
5. align file-create behavior to canonical file register/upload contract

## Decision

Current live shell truth is:
- the flagship route family is **partially shaped**
- the flagship route family is **not yet fully product-capable**
- the strongest current risk is **misleading completion language**, not absence of UI

The next implementation packet should translate these findings into concrete UI guardrails and missing-wiring banners for the currently live routes while beginning the two missing flagship routes.
