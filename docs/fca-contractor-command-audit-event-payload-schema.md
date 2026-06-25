# FCA Contractor Command â€” Audit Event Payload Schema v1

Status: Active Draft
Scope: Packet 023 implementation contract

## Purpose

This document standardizes AuditEvent payloads so Contractor Command workflows can prove continuity, correction history, and accountable execution.

## Audit Rule

Every material execution event should produce a structured audit record.
Every execute-capable Auricrux action must create or reference an AuditEvent.

## Canonical Audit Payload

```json
{
  "auditEventId": "audit_123",
  "tenantId": "tenant_123",
  "eventType": "project-file-linked",
  "targetObjectType": "FileAsset",
  "targetObjectId": "file_123",
  "relatedObjectType": "Project",
  "relatedObjectId": "project_123",
  "actorType": "user",
  "actorId": "user_123",
  "summary": "Linked plan sheet to active project evidence chain",
  "reason": "Required to support estimate revision continuity",
  "beforeSnapshot": {
    "status": "indexed",
    "ownerObjectId": "project_123",
    "evidenceLinks": 0
  },
  "afterSnapshot": {
    "status": "linked",
    "ownerObjectId": "project_123",
    "evidenceLinks": 1
  },
  "createdAt": "2026-06-09T00:00:00Z"
}
```

## Required Fields
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

## Strongly Recommended Fields
- `relatedObjectType`
- `relatedObjectId`
- `beforeSnapshot`
- `afterSnapshot`
- `correlationId`
- `sourceRoute`

## Actor Types
- `user`
- `auricrux`
- `system`
- `workflow`

## Event Type Families

### Intake and qualification
- `lead-created`
- `lead-qualified`
- `lead-rejected`
- `opportunity-created`
- `opportunity-converted`

### Estimate and proposal
- `estimate-created`
- `estimate-revised`
- `proposal-generated`
- `proposal-sent`
- `opportunity-awarded`
- `opportunity-lost`

### Project/file continuity
- `project-created`
- `file-uploaded`
- `file-classified`
- `file-indexed`
- `file-linked`
- `file-superseded`
- `briefing-generated`

### Auricrux and correction
- `auricrux-explain-recorded`
- `auricrux-recommend-recorded`
- `auricrux-execute-recorded`
- `correction-applied`
- `correction-rolled-back`

## Snapshot Guidance

Use snapshots when the event changes state or linkage.
Do not require full object serialization if a compact shape will preserve meaning.

## Query Requirements

Audit events should be queryable by:
- tenantId
- targetObjectType + targetObjectId
- relatedObjectType + relatedObjectId
- actorType + actorId
- eventType
- createdAt

## Failure Conditions

An audit event is insufficient if:
- it cannot identify what changed
- it lacks actor identity
- it lacks a reason for the change
- it cannot be tied back to a governed object
- it cannot support later correction review
