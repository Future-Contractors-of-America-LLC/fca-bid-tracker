# FCA Contractor Command â€” Flagship Spine Handoff Contract v1

Status: Active Draft  
Scope: Packet 034 implementation contract

## Purpose

This contract defines the first real execution chain for FCA Contractor Command:

**Lead / Opportunity â†’ Project / Job â†’ File / Evidence â†’ Audit Event**

Its purpose is to stop shell-only drift and force every user-facing surface to hand off into governed backend behavior.

## Core Rule

A workflow step is not considered product-complete unless it:

1. operates on a governed object
2. hands off to a backend action
3. produces a durable output
4. emits or references an audit event
5. preserves continuity to the next downstream object

## Canonical Spine Sequence

```text
Lead
  â†“ qualify
Opportunity
  â†“ award / convert
Project
  â†“ upload / classify / link
FileAsset + EvidenceLink
  â†“ record
AuditEvent
```

This is the minimum flagship spine for Contractor Command.

## 1. Lead / Opportunity Contract

### Entry surfaces
- public intake page
- portal intake route
- assisted Auricrux intake

### Required object outputs
A valid intake must produce either:
- `Lead`, or
- `Opportunity` if qualification is immediate and justified

### Required minimum fields
```json
{
  "tenantId": "tenant_123",
  "leadId": "lead_123",
  "clientId": "client_123",
  "siteId": "site_123",
  "projectIntent": "tenant improvement",
  "serviceLine": "estimating",
  "sourceChannel": "website",
  "status": "new"
}
```

### Required backend actions
- `POST /api/leads`
- `POST /api/leads/:leadId/qualify`
- `POST /api/opportunities` when direct opportunity creation is valid

### Required continuity rule
A qualified lead must create or bind to an `Opportunity`.
No qualified intake may dead-end as an isolated form submission.

### Required audit events
- `lead-created`
- `lead-qualified` or `lead-rejected`
- `opportunity-created` where applicable

## 2. Opportunity / Project Contract

### Trigger conditions
An opportunity may create a project only when:
- qualification is valid
- client/site linkage exists
- status supports conversion or award

### Required conversion payload
```json
{
  "tenantId": "tenant_123",
  "opportunityId": "opp_123",
  "convertedBy": "user_123",
  "project": {
    "projectName": "Riverside Retail Upfit",
    "projectNumber": "FCA-2026-001",
    "projectType": "tenant-improvement",
    "deliveryMode": "bid-build",
    "status": "active"
  }
}
```

### Required backend actions
- `POST /api/opportunities/:opportunityId/convert-to-project`
- or governed `POST /api/projects` only when upstream opportunity linkage already exists

### Required output
```json
{
  "projectId": "project_123",
  "projectNumber": "FCA-2026-001",
  "sourceOpportunityId": "opp_123",
  "status": "active",
  "auditEventId": "audit_201"
}
```

### Required continuity rule
Every project must preserve upstream links to:
- tenant
- client
- site
- originating opportunity
- current estimate when available

A project without upstream linkage is invalid.

### Required audit events
- `opportunity-awarded` or equivalent decision event
- `project-created`
- `opportunity-converted`

## 3. Project / File / Evidence Contract

### Trigger conditions
Files may be attached at lead, opportunity, estimate, or project level, but flagship execution should prefer the project once it exists.

### Required file handoff questions
Before a file route is considered complete, it must answer:
- which governed object owns the file?
- which project or opportunity context is active?
- what evidence chain will this file support?
- what audit event will record the action?

### Required backend actions
- `POST /api/files`
- `PATCH /api/files/:fileId`
- `POST /api/files/:fileId/link`
- `POST /api/files/:fileId/briefing`

### Required upload/register payload
```json
{
  "tenantId": "tenant_123",
  "ownerObjectType": "Project",
  "ownerObjectId": "project_123",
  "uploadedBy": "user_123",
  "files": [
    {
      "fileName": "A2.1_FloorPlan_Rev2.pdf",
      "contentType": "application/pdf",
      "sizeBytes": 2456789,
      "checksum": "sha256:abc123",
      "versionLabel": "Rev 2"
    }
  ]
}
```

### Required file output
```json
{
  "fileId": "file_123",
  "ownerObjectType": "Project",
  "ownerObjectId": "project_123",
  "status": "uploaded",
  "auditEventId": "audit_202"
}
```

### Required evidence-link output
```json
{
  "evidenceLinkId": "ev_123",
  "sourceObjectType": "FileAsset",
  "sourceObjectId": "file_123",
  "targetObjectType": "Estimate",
  "targetObjectId": "estimate_123",
  "relationType": "supports-scope",
  "auditEventId": "audit_203"
}
```

### Required continuity rule
A project file is incomplete if it exists only as a blob/storage object with no governed metadata, no owner object, or no queryable evidence relationship.

## 4. Audit Event Contract

### Audit requirement
Every material state-changing step in this spine must emit an `AuditEvent`.

### Mandatory audit-producing actions
- lead creation
- qualification decision
- opportunity creation
- project conversion
- project creation
- file upload/register
- file classification/indexing
- evidence linkage
- briefing generation when persisted as a governed action

### Required audit shape
```json
{
  "auditEventId": "audit_203",
  "tenantId": "tenant_123",
  "eventType": "file-linked",
  "targetObjectType": "FileAsset",
  "targetObjectId": "file_123",
  "relatedObjectType": "Project",
  "relatedObjectId": "project_123",
  "actorType": "user",
  "actorId": "user_123",
  "summary": "Linked plan sheet to estimate evidence chain",
  "reason": "Supports quantity and scope continuity",
  "createdAt": "2026-06-11T22:30:00Z"
}
```

### Continuity rule
If an action affects workflow state but produces no audit event, that action is governance-incomplete.

## 5. Route-to-Backend Handoff Table

| Route / Surface | Governs Object | Required Backend Action | Required Durable Output | Required Audit |
|---|---|---|---|---|
| `/contact` or intake CTA | Lead | `POST /api/leads` | Lead | `lead-created` |
| `/portal/opportunities/:opportunityId` qualify flow | Lead / Opportunity | `POST /api/leads/:leadId/qualify` or `PATCH /api/opportunities/:opportunityId` | Opportunity decision | `lead-qualified` / `opportunity-created` |
| `/portal/opportunities/:opportunityId` award/convert | Opportunity | `POST /api/opportunities/:opportunityId/convert-to-project` | Project | `opportunity-converted`, `project-created` |
| `/portal/projects/:projectId/files` upload | Project / FileAsset | `POST /api/files` | FileAsset | `file-uploaded` |
| `/portal/projects/:projectId/files/:fileId` classify/link | FileAsset | `PATCH /api/files/:fileId`, `POST /api/files/:fileId/link` | FileAsset + EvidenceLink | `file-classified`, `file-linked` |
| `/portal/projects/:projectId/files/:fileId/briefing` | FileAsset / AuricruxAction | `POST /api/files/:fileId/briefing` | Briefing + action record | `briefing-generated` |
| `/portal/audit` | AuditEvent | `GET /api/audit-events` | Audit timeline | n/a read path |

## 6. UI Done-Means Gates

A UI surface in the flagship spine is only done when all are true:

1. active object identity is visible or resolvable
2. the route knows its backend action
3. the route can name its durable output
4. the route can identify its audit event family
5. downstream continuity is preserved

## 7. Failure Conditions

The spine is broken if any of the following occur:
- lead intake produces email-only notification with no governed object
- opportunity qualification does not bind to a project-capable path
- project creation loses source opportunity/client/site linkage
- files upload without governed owner metadata
- files cannot be linked as evidence
- state-changing actions produce no audit event
- routes imply completion while only updating client-side state

## 8. Immediate Implementation Order

1. lock lead create + qualify payloads in backend/API truth
2. lock opportunity-to-project conversion payload
3. lock project file upload/register payload
4. lock evidence-link payload
5. lock audit emission requirements for each step
6. wire route-level acceptance checks against this contract

## 9. Next Engineering Packet

The next build packet should convert this contract into:
- route acceptance checklist updates
- concrete API stubs or adapters
- frontend handoff guards for the first live routes
- explicit missing-state handling where backend execution is not yet wired
