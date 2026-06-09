# Implementation Packet — Project + File Spine Hardening v1

## Objective
Ship the next bounded packet that strengthens the flagship product spine:
- Project / Job continuity
- File ingestion continuity
- Evidence and audit continuity

## Why This Packet Next
This directly follows the uploaded build-sequence guidance:
- Project/Job must become the home for continuity.
- File intake/output must exist at every level.
- Auricrux must read, act, review, and correct.
- No module stands alone.

## Scope
### In
- Project object
- bid-to-project conversion path
- project files surface
- file metadata and version fields
- Auricrux document briefing artifact
- audit events

### Out
- deep takeoff engine
- full RFI workflow
- full accounting workflow
- broad Academy expansion

## Proposed Object Additions

### Project
- projectId
- customerId
- sourceBidId
- title
- status
- siteName
- createdAt
- updatedAt
- createdBy
- lastAuricruxSummary

### FilePackage
- filePackageId
- projectId
- uploadedBy
- uploadSource
- packageLabel
- version
- createdAt

### ProjectFile
- fileId
- filePackageId
- projectId
- fileName
- fileType
- fileSize
- revisionLabel
- discipline
- documentType
- uploadedAt
- storagePath
- checksum

### AuditEvent
- auditEventId
- entityType
- entityId
- action
- actorType
- actorId
- reason
- createdAt

### DocumentBriefing
- briefingId
- projectId
- filePackageId
- summary
- missingItems
- revisionSignals
- recommendedNextActions
- createdAt

## UI Surfaces
1. Bid detail: "Convert to Project"
2. Project workspace: summary card + linked source bid
3. Project files tab: upload/list/version
4. Auricrux panel: document briefing card
5. Audit feed: conversion + uploads + briefing creation

## Acceptance Criteria
- user can convert a bid into a project
- resulting project preserves customer linkage
- files can be attached to project
- uploaded package generates a document briefing placeholder/output
- every conversion/upload creates audit events
- customer-facing status remains truthful

## Validation Steps
1. Create or select existing bid.
2. Convert bid to project.
3. Confirm project retains source bid and customer linkage.
4. Upload sample package.
5. Confirm metadata, file list, and package version appear.
6. Confirm document briefing is created.
7. Confirm audit feed shows all actions.

## Repo File Suggestions
- docs/fca-contractor-command-build-sequence-v1.md
- docs/fca-coverage-matrix-contractor-command-v1.md
- docs/project-file-spine-hardening-packet-v1.md
