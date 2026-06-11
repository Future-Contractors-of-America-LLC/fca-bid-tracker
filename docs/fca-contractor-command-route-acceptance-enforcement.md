# FCA Contractor Command — Route Acceptance Enforcement v1

Status: Active Draft
Scope: Packet 035 route-level enforcement for first live flagship paths

## Purpose

This document converts the flagship spine contract into explicit pass/fail enforcement for the first live Contractor Command routes.

It is the anti-drift layer that prevents shell completion from being confused with product completion.

## Enforcement Rule

A route fails acceptance if any one of the following is missing:
- governed object identity
- backend handoff clarity
- durable output truth
- audit event truth
- downstream continuity

## Route 1 — Intake Route (`/contact` or equivalent CTA surface)

### Governs
- `Lead`
- optional `Client`
- optional `Site`

### Required backend handoff
- `POST /api/leads`

### Required durable output
- `Lead`

### Required audit family
- `lead-created`

### Pass if
- intake creates a governed lead object
- user sees truthful submission state
- intake preserves enough context for later qualification
- route moves user toward an opportunity-capable path

### Fail if
- intake only sends email/webhook without governed object creation
- CTA claims request tracking that does not exist
- no object ID or durable confirmation can exist
- route behaves like a marketing dead end

## Route 2 — Opportunity Workspace (`/portal/opportunities/:opportunityId`)

### Governs
- `Opportunity`
- linked `Estimate`
- linked `FileAsset`

### Required backend handoffs
- `PATCH /api/opportunities/:opportunityId`
- `POST /api/opportunities/:opportunityId/convert-to-project`
- qualification path where applicable

### Required durable outputs
- updated `Opportunity`
- governed project conversion output when awarded

### Required audit families
- `lead-qualified`
- `opportunity-created`
- `opportunity-awarded`
- `opportunity-converted`

### Pass if
- route binds to a real opportunity identity
- upstream lead/client/site continuity is visible
- route truthfully shows whether project conversion is available
- estimate/file readiness is visible
- downstream project handoff is explicit

### Fail if
- route invents project status without a real project
- opportunity state is route-local only
- award/conversion language exists without governed action path
- estimate/file context disappears during progression

## Route 3 — Project Workspace (`/portal/projects/:projectId`)

### Governs
- `Project`
- related `FileAsset`
- related `AuditEvent`
- related `AuricruxAction`

### Required backend handoffs
- `GET /api/projects/:projectId`
- or `GET /api/projects/:projectId/context`

### Required durable outputs
- governed `Project` read model
- contextual continuity summary

### Required audit families shown or queryable
- `project-created`
- related file/audit events
- related correction events

### Pass if
- route resolves canonical project identity
- upstream opportunity/client/site linkage is shown
- file, audit, and Auricrux summary surfaces are present
- route acts as continuity home for downstream work

### Fail if
- project-looking content renders without a valid project ID
- route hides upstream continuity and behaves as isolated page
- file/audit/Auricrux summaries are absent while route claims execution readiness
- route relies on contradictory local project state

## Route 4 — Project Files Route (`/portal/files` and project file views)

### Governs
- `FileAsset`
- `EvidenceLink`

### Required backend handoffs
- `POST /api/files`
- `PATCH /api/files/:fileId`
- `POST /api/files/:fileId/link`
- later `POST /api/files/:fileId/briefing`

### Required durable outputs
- `FileAsset`
- `EvidenceLink`
- later briefing/action artifacts

### Required audit families
- `file-uploaded`
- `file-classified`
- `file-indexed`
- `file-linked`
- later `briefing-generated`

### Pass if
- file owner object is explicit
- active project or owner context is explicit
- version, classification, and linkage states are visible
- route can explain missing execution wiring truthfully
- file actions preserve evidence continuity

### Fail if
- uploaded files become orphaned from governed objects
- UI implies review/classification/linkage that cannot be persisted
- route pretends native document intelligence exists when it does not
- blob/storage reference exists with no governed metadata path

## Route 5 — Audit Route (`/portal/audit`)

### Governs
- `AuditEvent`
- related `AuricruxAction`

### Required backend handoff
- `GET /api/audit-events`

### Required durable output
- governed audit timeline read model

### Required audit families shown
- lead/opportunity/project/file/action families as available
- correction and rollback families when available

### Pass if
- route distinguishes actor type
- route exposes reason, summary, event type, and time
- project or tenant filter behavior is explicit
- route can support later correction review

### Fail if
- route shows decorative fake history
- actor identity or reason is absent
- route cannot be tied back to governed objects
- route hides Auricrux action traceability

## Cross-Route Acceptance Matrix

| Route | Object Identity | Backend Handoff | Durable Output | Audit Truth | Downstream Continuity |
|---|---|---|---|---|---|
| Intake | Lead | `POST /api/leads` | Lead | `lead-created` | Opportunity path |
| Opportunity workspace | Opportunity | update/convert actions | Opportunity / Project | qualification/conversion events | Project path |
| Project workspace | Project | governed project read | Project context | project + related events | Files / Audit / Auricrux |
| Files route | FileAsset / EvidenceLink | file upload/update/link | FileAsset / EvidenceLink | file event family | Evidence chain |
| Audit route | AuditEvent | governed audit read | Audit timeline | visible event truth | correction / traceability |

## UI Messaging Guard

No route may use language such as:
- complete
- submitted successfully
- tracked
- reviewed
- linked
- converted
- recorded

unless the corresponding governed object/action/output really exists.

## Missing-Wiring Standard

If the frontend route exists before the backend handoff is live, the route must:
- say the action is not yet live
- preserve user-entered context if safe
- avoid fake success messaging
- point to the governed object/action that is still missing

## Acceptance Decision Template

Use this block when validating a route:

```text
Route:
Governed object:
Backend handoff:
Durable output:
Audit family:
Pass/Fail:
Blocking gap:
Next remediation:
```

## Immediate Use

Use this document before any route in the flagship spine is described as:
- ready
- complete
- customer-facing
- production-capable
- launch-safe

If a route fails this enforcement, it is shell-progress only, not product completion.
