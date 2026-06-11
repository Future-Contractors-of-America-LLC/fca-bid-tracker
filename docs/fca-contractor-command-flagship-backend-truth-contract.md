# FCA Contractor Command — Flagship Backend Truth Contract v1

Status: Active Draft  
Scope: Packet 044 backend-truth hardening for intake, conversion, file register, and audit discipline

## Purpose

This contract translates the uploaded FCA build-sequence and system-law materials into the next hardening layer for Contractor Command backend truth.

It focuses on four required backend-truth areas:

1. governed lead intake object path
2. opportunity conversion contract
3. canonical file register/upload contract
4. audit-event payload tightening

## Canonical Basis

This contract is derived from binding FCA system-law principles already established in the uploaded canonical materials:

- all execution must operate on structured objects
- lifecycle must follow valid state transitions
- no step is complete without output
- lead intake must produce a qualified opportunity
- project/job and file/audit continuity must anchor the whole system
- every module must attach to Project/Job, accept file input where applicable, produce output, and log Auricrux actions

## Core Rule

A flagship workflow is not backend-truth-complete unless it:

1. creates or reads a governed object
2. follows a valid lifecycle transition
3. produces a durable output artifact
4. records an audit event with actor, reason, and target context
5. preserves downstream continuity to project, files, and audit surfaces

## 1. Governed Lead Intake Object Path

### Why this is now mandatory
The uploaded lifecycle and execution matrix makes intake a formal phase, not a marketing side-effect. Intake must execute lead capture, scoring, budget validation, jurisdiction validation, ownership verification, forms, and fee collection, with the required output being a **qualified opportunity**. Intake also cannot be treated as complete without output. fileciteturn1file10

### Current repo defect
`/contact` still activates walkthrough/demo access without creating a governed Lead object.

### Required canonical object
```json
{
  "leadId": "lead_123",
  "tenantId": "tenant_123",
  "clientId": "client_123",
  "siteId": "site_123",
  "sourceChannel": "website",
  "status": "new",
  "budgetStatus": "pending",
  "jurisdictionStatus": "pending",
  "ownershipStatus": "pending",
  "intakeFormStatus": "issued",
  "feeStatus": "not-required",
  "createdAt": "2026-06-11T23:30:00Z"
}
```

### Canonical endpoint family
- `POST /api/leads`
- `GET /api/leads/:leadId`
- `PATCH /api/leads/:leadId`
- `POST /api/leads/:leadId/qualify`

### Required POST request shape
```json
{
  "tenantId": "tenant_123",
  "client": {
    "name": "Riverside Retail LLC",
    "email": "owner@example.com",
    "phone": "555-0100"
  },
  "site": {
    "address": "100 Main St",
    "jurisdiction": "Richmond, VA"
  },
  "projectIntent": "tenant-improvement",
  "serviceLine": "estimating",
  "sourceChannel": "website",
  "budgetSignal": "unknown",
  "notes": "Initial website intake"
}
```

### Required POST response shape
```json
{
  "ok": true,
  "item": {
    "leadId": "lead_123",
    "status": "new"
  },
  "auditEventId": "audit_123",
  "backingSource": "api-workflow-store"
}
```

### Lifecycle rule
Intake may only move:
- `new -> under-review`
- `under-review -> qualified`
- `under-review -> rejected`

No route may claim qualification until `POST /api/leads/:leadId/qualify` succeeds.

### Output requirement
Lead intake is not complete unless it creates:
- Lead object
- audit event
- downstream qualification path

## 2. Opportunity Conversion Contract

### Why this is now mandatory
The uploaded materials require structured objects and valid lifecycle progression from Lead to Qualified to Bid/Permit/Build. They also define Phase 2 output as a **qualified opportunity** and repeatedly make Project/Job the continuity home for the system. fileciteturn1file10 fileciteturn1file14

### Canonical conversion rule
An Opportunity may convert to Project only if:
- qualification is valid
- client linkage exists
- site linkage exists
- status permits conversion
- required gating outputs exist

### Canonical endpoint
- `POST /api/opportunities/:opportunityId/convert-to-project`

### Required request shape
```json
{
  "tenantId": "tenant_123",
  "convertedBy": "user_123",
  "project": {
    "projectName": "Riverside Retail Upfit",
    "projectNumber": "FCA-2026-001",
    "projectType": "tenant-improvement",
    "deliveryMode": "bid-build"
  },
  "reason": "Qualified opportunity approved for project activation"
}
```

### Required response shape
```json
{
  "ok": true,
  "item": {
    "projectId": "project_123",
    "projectNumber": "FCA-2026-001",
    "sourceOpportunityId": "opp_123",
    "status": "active"
  },
  "auditEventIds": ["audit_201", "audit_202"],
  "backingSource": "api-workflow-store"
}
```

### Mandatory preserved links
Every converted project must preserve:
- `tenantId`
- `clientId`
- `siteId`
- `sourceOpportunityId`
- `sourceEstimateId` where available

### Failure rule
Project creation is invalid if it loses upstream opportunity/client/site linkage.

## 3. Canonical File Register / Upload Contract

### Why this is now mandatory
The uploaded build-sequence and no-gap rules require file input/output at every level, require every module to attach to Project/Job, and identify Files / PlanSets and the file spine as part of the required continuity architecture. The uploaded sequence also specifically defines the next phase after bid/tracker as Project/Job spine plus Files/Document ingestion plus Auricrux document intelligence. fileciteturn1file5 fileciteturn1file6 fileciteturn1file14

### Canonical rule
File bytes and file metadata are distinct.

Every file registration/upload must preserve:
- owner object identity
- version lineage
- evidence targetability
- auditability
- project continuity

### Canonical endpoint family
- `POST /api/files`
- `GET /api/files/:fileId`
- `PATCH /api/files/:fileId`
- `POST /api/files/:fileId/link`
- `GET /api/files/summary?ownerObjectType={type}&ownerObjectId={id}`

### Required register/upload request shape
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
      "extension": ".pdf",
      "sizeBytes": 2456789,
      "checksum": "sha256:abc123",
      "versionLabel": "Rev 2",
      "classification": {
        "discipline": "Architectural",
        "documentType": "Plan Sheet",
        "revision": "2"
      }
    }
  ]
}
```

### Required response shape
```json
{
  "ok": true,
  "items": [
    {
      "fileId": "file_123",
      "ownerObjectType": "Project",
      "ownerObjectId": "project_123",
      "status": "uploaded"
    }
  ],
  "auditEventId": "audit_301",
  "backingSource": "api-workflow-store"
}
```

### Current repo defect
Current file-create behavior uses a mutation-style shell path (`create-file-record`) rather than a fully canonical register/upload contract.

### Hardening requirement
The repo must progressively replace shell record creation language with canonical upload/register language only when:
- bytes or durable upload references exist
- metadata is persisted
- owner object linkage is real
- audit event is emitted

### File summary contract
Summary rollups must come from canonical backend summary composition, not route-local counting when presented as governed truth.

## 4. Audit Event Payload Tightening

### Why this is now mandatory
The uploaded materials define execution as Analyze / Decide / Generate / Execute / Validate / Record / Optimize and require Auricrux actions to be logged, reversible, reviewable, and attached to the continuity spine. They also require every action to produce output and the whole system to be auditable. fileciteturn1file0 fileciteturn1file19

### Canonical audit rule
Every material mutation in the flagship spine must emit an audit payload with enough information to support:
- accountability
- explanation
- correction review
- downstream traceability

### Tightened canonical payload
```json
{
  "auditEventId": "audit_401",
  "tenantId": "tenant_123",
  "eventType": "file-linked",
  "targetObjectType": "FileAsset",
  "targetObjectId": "file_123",
  "relatedObjectType": "Project",
  "relatedObjectId": "project_123",
  "actorType": "auricrux",
  "actorId": "auricrux",
  "summary": "Linked revised plan sheet to governed evidence chain",
  "reason": "Supports scope continuity and downstream estimating accuracy",
  "sourceRoute": "/portal/files",
  "correlationId": "corr_123",
  "beforeSnapshot": {
    "status": "classified",
    "evidenceStatus": "pending"
  },
  "afterSnapshot": {
    "status": "linked",
    "evidenceStatus": "evidence-linked"
  },
  "createdAt": "2026-06-11T23:30:00Z"
}
```

### Required fields
- `auditEventId`
- `tenantId`
- `eventType`
- `targetObjectType`
- `targetObjectId`
- `actorType`
- `actorId`
- `summary`
- `reason`
- `createdAt`

### Strongly required for flagship hardening
- `relatedObjectType`
- `relatedObjectId`
- `sourceRoute`
- `correlationId`
- `beforeSnapshot`
- `afterSnapshot`

### Mutation families that must emit tightened payloads now
- lead creation
- lead qualification
- opportunity conversion
- project activation
- file registration/upload
- file classification
- file evidence linkage
- briefing generation

## 5. Route-to-Backend Truth Table

| Surface | Required Backend Truth | Required Output | Required Audit |
|---|---|---|---|
| `/contact` | `POST /api/leads` | Lead | `lead-created` |
| `/portal/opportunities/:opportunityId` | `GET /api/opportunities/:opportunityId/workspace` | Opportunity workspace | read-backed truth + future mutation audits |
| opportunity -> project conversion | `POST /api/opportunities/:opportunityId/convert-to-project` | Project | `opportunity-converted`, `project-created` |
| `/portal/projects/:projectId` | `GET /api/projects/:projectId/workspace` | Project workspace | read-backed truth + related audits |
| `/portal/files` register/upload | `POST /api/files` | FileAsset | `file-uploaded` |
| `/portal/files` classify/link | `PATCH /api/files/:fileId`, `POST /api/files/:fileId/link` | FileAsset / EvidenceLink | `file-classified`, `file-linked` |
| `/portal/audit` | canonical audit reads | Audit timeline | read-backed truth |

## 6. Acceptance Gates

This contract is satisfied only when:
- `/contact` creates a governed Lead object instead of demo-only activation
- opportunity conversion preserves upstream continuity into Project
- file register/upload follows canonical owner + version + audit discipline
- flagship audits include tightened payload fields rather than minimal shell event shapes

## 7. Next Build Packet

The next code packet should:

1. add lead endpoints and governed lead store path
2. add opportunity conversion endpoint and native conversion helper
3. align file register/upload mutation path to canonical request/response shapes
4. tighten emitted audit payload structure for flagship mutations
