# FCA Contractor Command â€” Storage Map v1

Status: Active Draft
Scope: Phase-2 flagship storage and persistence alignment

## Purpose

This document maps Contractor Command objects into storage responsibilities so repo planning, API work, and deployment state remain aligned.

## Storage Law

1. Each governed object requires a canonical persistence home.
2. File bytes and file metadata must be separated cleanly.
3. Evidence linkage must remain queryable.
4. Audit and Auricrux activity must be append-friendly.
5. Later modules must extend existing storage domains rather than invent parallel truth.

## Storage Domains

### 1. Operational records store
Recommended use:
- SQL / Cosmos / table-backed object persistence for structured objects

Stores:
- Tenant
- User
- Role
- Lead
- Client
- Opportunity
- Project
- Site
- Estimate
- TrainingLink
- OperationalBaseline

### 2. File metadata store
Recommended use:
- structured metadata table/collection

Stores:
- FileAsset
- file version chain
- classification metadata
- owner object linkage
- checksum / size / contentType

### 3. Evidence and audit store
Recommended use:
- append-friendly structured store

Stores:
- EvidenceLink
- AuditEvent
- AuricruxAction

### 4. Blob/object file store
Recommended use:
- Azure Blob Storage or equivalent

Stores:
- raw uploaded files
- generated proposal artifacts
- generated document briefings
- exported packages / binders / zip bundles

## Canonical Object-to-Store Mapping

| Object | Store Class | Notes |
|---|---|---|
| Tenant | operational records | root scope object |
| User | operational records | auth-linked identity |
| Role | operational records | permission model |
| Lead | operational records | public intake continuity |
| Client | operational records | customer identity continuity |
| Opportunity | operational records | pre-award spine |
| Project | operational records | awarded job spine |
| Site | operational records | physical job location |
| Estimate | operational records | priced scope baseline |
| FileAsset | file metadata store | metadata only, not raw bytes |
| EvidenceLink | evidence/audit store | provenance graph |
| AuditEvent | evidence/audit store | append-first |
| AuricruxAction | evidence/audit store | AI action history |
| TrainingLink | operational records | Academy coupling |
| OperationalBaseline | operational records | optimization loop object |

## Required Minimum Tables / Collections

### Core records
- `tenants`
- `users`
- `roles`
- `clients`
- `leads`
- `opportunities`
- `projects`
- `sites`
- `estimates`
- `training_links`
- `operational_baselines`

### Continuity records
- `file_assets`
- `evidence_links`
- `audit_events`
- `auricrux_actions`

### Blob containers / object buckets
- `project-files`
- `proposal-artifacts`
- `document-briefings`
- `project-binders`

## File Spine Rules

Every file must capture:
- `fileId`
- `tenantId`
- `ownerObjectType`
- `ownerObjectId`
- `storageUri`
- `checksum`
- `sizeBytes`
- `contentType`
- `versionLabel`
- `classification`
- `uploadedAt`

Every file-driven workflow should be able to answer:
- What object owns this file?
- What version replaced this file?
- What evidence relationships depend on this file?
- What Auricrux actions touched this file?

## Audit and Action Rules

Audit and Auricrux activity should remain append-oriented.
Do not overwrite historical events.
Corrections should create new records referencing prior records.

Minimum audit fields:
- `auditEventId`
- `tenantId`
- `targetObjectType`
- `targetObjectId`
- `actorType`
- `actorId`
- `summary`
- `reason`
- `beforeSnapshot`
- `afterSnapshot`
- `createdAt`

Minimum Auricrux action fields:
- `actionId`
- `tenantId`
- `mode`
- `targetObjectType`
- `targetObjectId`
- `reason`
- `summary`
- `executionStatus`
- `createdAt`

## Search and Retrieval Priorities

Indexes should prioritize:
- tenantId + updatedAt
- opportunityId + state
- projectId + lifecycleState
- ownerObjectType + ownerObjectId for files
- targetObjectType + targetObjectId for audit/actions
- checksum for file dedupe checks

## Next Expansion Storage Reservations

Future canonical stores/collections:
- `drawing_sets`
- `sheets`
- `takeoff_items`
- `rfis`
- `change_events`
- `change_orders`
- `inspections`
- `punch_items`
- `cost_ledger_entries`
- `closeout_packages`
- `warranty_cases`
- `credentials`
- `training_records`

These are reserved to prevent future drift and duplicate schema invention.
