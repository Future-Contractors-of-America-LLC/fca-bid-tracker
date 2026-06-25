# FCA Contractor Command â€” File Spine Payload Schema v1

Status: Active Draft
Scope: Packet 023 implementation contract

## Purpose

This document defines the canonical payloads for Contractor Command file ingestion, classification, linkage, and briefing so file handling can become a true system spine.

## File Spine Rule

Every file operation must preserve:
- tenant scope
- owner object linkage
- versionability
- evidence traceability
- Auricrux visibility
- auditability where applicable

## 1. Upload/Register Payload

### Request

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
        "revision": "2",
        "dateLabel": "2026-06-09"
      }
    }
  ]
}
```

### Response

```json
{
  "created": [
    {
      "fileId": "file_123",
      "ownerObjectType": "Project",
      "ownerObjectId": "project_123",
      "storageUri": "blob://project-files/tenant_123/project_123/file_123.pdf",
      "status": "uploaded"
    }
  ],
  "auditEventId": "audit_123"
}
```

## 2. Classify/Index Payload

### Request

```json
{
  "fileId": "file_123",
  "classification": {
    "discipline": "Architectural",
    "documentType": "Plan Sheet",
    "revision": "2",
    "sheetNumber": "A2.1",
    "sheetTitle": "Floor Plan",
    "dateLabel": "2026-06-09"
  },
  "indexing": {
    "ocrStatus": "complete",
    "sheetIndexExtracted": true,
    "previewStatus": "ready"
  },
  "updatedBy": "user_123"
}
```

### Response

```json
{
  "fileId": "file_123",
  "status": "indexed",
  "auditEventId": "audit_124"
}
```

## 3. Evidence Link Payload

### Request

```json
{
  "tenantId": "tenant_123",
  "sourceObjectType": "FileAsset",
  "sourceObjectId": "file_123",
  "targetObjectType": "Estimate",
  "targetObjectId": "estimate_123",
  "relationType": "supports-scope",
  "note": "Floor plan supports door hardware quantity assumptions"
}
```

### Response

```json
{
  "evidenceLinkId": "ev_123",
  "status": "linked",
  "auditEventId": "audit_125"
}
```

## 4. Document Briefing Payload

### Request

```json
{
  "tenantId": "tenant_123",
  "ownerObjectType": "Project",
  "ownerObjectId": "project_123",
  "fileIds": ["file_123", "file_124"],
  "mode": "recommend",
  "requestedBy": "user_123"
}
```

### Response

```json
{
  "briefingId": "briefing_123",
  "summary": {
    "packageType": "plan-package",
    "contains": ["architectural plan sheets", "spec excerpt"],
    "missingLikely": ["structural sheets", "reflected ceiling plan"],
    "revisionCues": ["Rev 2 detected on A2.1"]
  },
  "auricruxActionId": "action_123",
  "auditEventId": "audit_126"
}
```

## Required FileAsset Fields

Every stored file metadata record must include:
- `fileId`
- `tenantId`
- `ownerObjectType`
- `ownerObjectId`
- `fileName`
- `contentType`
- `extension`
- `sizeBytes`
- `checksum`
- `storageUri`
- `versionLabel`
- `classification`
- `status`
- `uploadedBy`
- `uploadedAt`

## Supported Owner Types
- Lead
- Opportunity
- Project
- Estimate
- AuricruxAction
- AuditEvent

## Minimum Status Values
- uploaded
- classified
- indexed
- linked
- reviewed
- superseded
- archived

## Failure Conditions

A file operation is invalid if:
- tenant scope is missing
- owner object linkage is missing
- checksum or storage reference is missing
- version lineage is broken when replacing a file
- evidence linkage cannot be queried later
- Auricrux cannot access file metadata for explanation/recommendation
