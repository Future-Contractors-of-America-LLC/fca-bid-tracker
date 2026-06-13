# FCA Packet 049F — Academy Truth and Persistent Storage Boundary

Status: Proposed implementation packet  
Scope: Unified SaaS + LMS shared spine  
Truth boundary: This document defines the next implementation contract. It is not a claim that durable LMS or file storage is already live.

## Issue

SaaS and LMS are intended to advance as one system, but durable truth is still at risk of drift in two places:

1. Academy progression and credential state can be overwritten, duplicated, or remain runtime-only.
2. Project files and folders can remain surface-level uploads without a durable shared file spine usable by SaaS and LMS together.

## Risk

If file persistence is advanced without first freezing Academy truth boundaries, FCA creates fake integration: files become durable while LMS state remains presentation-heavy or non-authoritative.

If Academy truth is preserved without a durable file spine, SaaS and LMS remain disconnected and folder/file storage does not become a shared product service.

## Decision

Proceed with a single bounded packet that does two things in one control step:

1. Preserve and inventory Academy live truth before deeper wiring.
2. Define the persistent file/folder storage boundary as a shared service used by SaaS and LMS.

This keeps one release spine, one deploy surface, one entitlement boundary, and one audit model.

## Required Shared Spine

Every object in this packet must bind to the same shared system spine:

- tenant
- user / role
- project / job
- academy context
- file spine
- audit / evidence graph
- entitlements
- Auricrux action record

## Deliverable A — Academy Truth Inventory

Create and validate an authoritative inventory for:

- academy levels
- courses
- modules
- lessons
- assessments
- enrollments
- progression state
- credentials / certificates
- remediation objects
- gating prerequisites

For each object, record:

- object name
- current source of truth
- persistence type
- mutation path
- read path
- tenant scope
- user scope
- safe-to-preserve / missing / blocked status

## Deliverable B — Unified Persistent File Spine Boundary

Persistent storage must be shared across SaaS and LMS, not implemented as separate storage lanes.

### Canonical Storage Objects

#### file_record
- id
- tenantId
- projectId nullable
- academyContextId nullable
- parentFolderId nullable
- storageProvider
- storageContainer
- storagePath
- originalName
- normalizedName
- mimeType
- extension
- sizeBytes
- checksumSha256
- version
- tags[]
- classification
- uploadedBy
- uploadedAt
- status

#### folder_record
- id
- tenantId
- projectId nullable
- academyContextId nullable
- parentFolderId nullable
- name
- normalizedPath
- createdBy
- createdAt
- status

#### file_link
- id
- fileId
- linkedObjectType
- linkedObjectId
- relation
- createdAt
- createdBy

#### file_parse_record
- id
- fileId
- parserType
- parserVersion
- extractionStatus
- extractedTextRef nullable
- previewRef nullable
- metadataJson
- startedAt
- completedAt nullable

#### auricrux_briefing_record
- id
- tenantId
- projectId nullable
- academyContextId nullable
- sourceType
- sourceId
- briefingType
- summary
- missingItems
- recommendedActions
- generatedAt
- generatedBy

## Folder and File Rules

1. Files can exist under a project, under an academy context, or both through link records.
2. Folders are logical objects first; cloud provider paths are implementation detail.
3. A file upload is incomplete until a file_record and audit event exist.
4. Folder creation is incomplete until a folder_record and audit event exist.
5. A parse/briefing is incomplete until linked back to the source file_record.
6. LMS lesson assets, worksheets, credentials, and remediation attachments must use the same file spine as SaaS project evidence.
7. No browser-local-only storage counts as product persistence.

## Minimum API Contract

### Academy truth
- `GET /api/academy-lms`
- `PATCH /api/academy-lms`
- `GET /api/academy-lms/truth`

### Shared file spine
- `GET /api/files`
- `POST /api/files`
- `GET /api/files/:id`
- `POST /api/files/:id/briefing`
- `GET /api/folders`
- `POST /api/folders`
- `POST /api/file-links`

## Minimum UI Surfaces

### SaaS
- Project Files tab
- Folder tree
- Upload surface
- Briefing panel
- File link panel

### LMS
- Lesson assets panel
- Course resource folders
- Credential evidence attachments
- Remediation attachment links
- Same briefing component where applicable

## Validation Gates

Packet 049F is only complete when all are true:

- Academy object inventory exists and is checked against live/runtime/API truth.
- Every Academy progression object has a declared persistence status.
- Shared file and folder objects are defined once, not duplicated for LMS and SaaS.
- File spine rules explicitly allow both project and academy attachment.
- Audit events are defined for create, update, parse, briefing, link, and access actions.
- Local-only persistence is marked non-authoritative.

## Explicit Non-Completion Boundary

This packet does not claim:

- durable blob storage is already live
- folder UI already ships in production
- LMS progression is already database-backed
- file parsing or briefing already runs end-to-end in production

## Next Build Step

After this packet, continue in this order:

1. `FCA_PACKET_049G_SAAS_LMS_CROSS_LINK_ENFORCEMENT.md`
2. `FCA_PACKET_049H_FEATURE_GATES_MICRO_REMEDIATION.md`
3. backend patch for shared file/folder persistence and Academy truth endpoint

## Recommended Immediate Repo Follow-Through

Backend-first:
- add `api/files.js`
- add `api/folders.js`
- add `api/file-links.js`
- add `api/academy-lms-truth.js`
- add shared storage adapter under `src/lib` or existing server utility location

Frontend-second:
- add project file tab using shared API client
- add academy asset panel using same API client
- add common file/folder picker component

## Founder Hands-Off Rule

No founder routing should be required for normal packet continuation unless storage credentials, tenant permissions, or billing access are externally blocked.
