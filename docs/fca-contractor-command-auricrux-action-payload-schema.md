# FCA Contractor Command — Auricrux Action Payload Schema v1

Status: Active Draft
Scope: Packet 023 implementation contract

## Purpose

This document standardizes Auricrux action payloads so Explain / Recommend / Execute behavior can be embedded across Contractor Command with construction-real traceability.

## Auricrux Rule

Auricrux is not decorative.
Every material Auricrux action must be tied to governed context and, when execution occurs, to audit output.

## Canonical Action Payload

```json
{
  "actionId": "action_123",
  "tenantId": "tenant_123",
  "mode": "recommend",
  "targetObjectType": "Project",
  "targetObjectId": "project_123",
  "relatedObjectType": "FileAsset",
  "relatedObjectId": "file_123",
  "reason": "New drawing revision appears to affect door count assumptions",
  "summary": "Recommend estimate review before proposal submission",
  "recommendedNextStep": "Open linked estimate and confirm hardware schedule quantities",
  "evidenceStatus": "supported",
  "evidenceRefs": [
    {
      "type": "FileAsset",
      "id": "file_123"
    }
  ],
  "executionStatus": "generated",
  "auditEventId": "audit_123",
  "createdAt": "2026-06-09T00:00:00Z"
}
```

## Required Fields
- `actionId`
- `tenantId`
- `mode`
- `targetObjectType`
- `targetObjectId`
- `reason`
- `summary`
- `executionStatus`
- `createdAt`

## Recommended Fields
- `relatedObjectType`
- `relatedObjectId`
- `recommendedNextStep`
- `evidenceStatus`
- `evidenceRefs[]`
- `auditEventId`
- `sourceRoute`
- `requiresApproval`

## Allowed Modes
- `explain`
- `recommend`
- `execute`

## Execution Status Values
- `generated`
- `pending-review`
- `approved`
- `executed`
- `blocked`
- `rejected`
- `rolled-back`

## Mode Behavior Expectations

### Explain
Used when Auricrux interprets current state.
Output should clarify:
- what the user is looking at
- what changed
- what matters next

### Recommend
Used when Auricrux proposes a next step.
Output should clarify:
- why the recommendation exists
- what evidence supports it
- what risk exists if ignored

### Execute
Used when Auricrux takes a bounded action.
Output must produce:
- action record
- resulting AuditEvent
- before/after or equivalent state trace where applicable

## Supported Target Types
- Lead
- Opportunity
- Project
- Estimate
- FileAsset
- AuditEvent
- TrainingLink

## Construction-Real Examples
- explain why a revision likely changes scope
- recommend a qualification gate due to missing jurisdiction data
- execute project conversion after award
- recommend document review due to addendum mismatch
- explain why an estimate is proposal-ready or not

## Failure Conditions

An Auricrux action is invalid if:
- it has no governed target
- it cannot explain its reason
- it makes execute-style changes with no audit trace
- it reads like generic assistant filler instead of construction-real operating intelligence
