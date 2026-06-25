# FCA Contractor Command â€” Backend Read Alignment Contract v1

Status: Active Draft  
Scope: Packet 041 backend-read alignment for flagship spine detail surfaces

## Purpose

This contract reduces shell dependence in the flagship spine by defining the first explicit governed backend-read alignment for these live detail surfaces:

- opportunity detail
- project detail
- file summary
- audit summary

The goal is to stop route truth from depending on fallback shell stores as the normal source of record.

## Core Rule

A flagship detail route is not backend-aligned unless it can name:

1. the governed read model it expects
2. the canonical endpoint that returns it
3. the minimum response shape required for route truth
4. the fallback behavior when backend truth is unavailable
5. the fields that must not be faked by route-local state

## Alignment Sequence

```text
Opportunity detail route
  â†“ requires
Opportunity workspace read model
  â†“ links to
Project detail route
  â†“ requires
Project workspace read model
  â†“ links to
File summary read model
  â†“ links to
Audit summary read model
```

## 1. Opportunity Detail Read Alignment

### Route
`/portal/opportunities/:opportunityId`

### Current truth
- route exists in router truth
- route currently maps continuity through bid workspace state
- route does not yet read from a dedicated governed Opportunity detail model

### Canonical target endpoint
`GET /api/opportunities/:opportunityId/workspace`

### Required response shape
```json
{
  "ok": true,
  "backingSource": "api-workflow-store",
  "item": {
    "opportunityId": "opp_123",
    "tenantId": "tenant_123",
    "clientId": "client_123",
    "siteId": "site_123",
    "status": "qualified",
    "projectIntent": "tenant-improvement",
    "serviceLine": "estimating",
    "estimateSummary": {
      "estimateId": "estimate_123",
      "status": "in-progress",
      "versionCount": 2
    },
    "fileSummary": {
      "total": 4,
      "linked": 3,
      "unlinked": 1
    },
    "conversionReadiness": {
      "canConvertToProject": false,
      "blockingReason": "estimate approval pending"
    },
    "auricruxSummary": {
      "nextAction": "Review exclusions and finalize estimator handoff"
    }
  }
}
```

### Route-required fields
- `opportunityId`
- `tenantId`
- `status`
- `estimateSummary`
- `fileSummary`
- `conversionReadiness`
- `auricruxSummary`

### Must not be faked route-locally
- conversion readiness
- estimate version count
- file linkage counts
- opportunity status

### Allowed fallback behavior
If backend read fails, the route may temporarily use shell continuity state only if:
- it shows explicit fallback disclosure
- it does not claim governed opportunity truth
- it does not claim project conversion is live unless verified

## 2. Project Detail Read Alignment

### Route
`/portal/projects/:projectId`

### Current truth
- route exists in router truth
- route currently composes project, file, and audit posture from current shell stores
- route still needs a dedicated governed project detail read model

### Canonical target endpoint
`GET /api/projects/:projectId/workspace`

### Required response shape
```json
{
  "ok": true,
  "backingSource": "api-workflow-store",
  "item": {
    "projectId": "project_123",
    "tenantId": "tenant_123",
    "sourceOpportunityId": "opp_123",
    "projectName": "Riverside Retail Upfit",
    "projectNumber": "FCA-2026-001",
    "status": "active",
    "stage": "mobilization",
    "owner": "Project Manager",
    "permitStatus": "under-review",
    "siteStatus": "pre-mobilization",
    "fileSummary": {
      "total": 9,
      "briefingsReady": 2,
      "topStatuses": {
        "classified": 4,
        "linked": 3,
        "reviewed": 2
      }
    },
    "auditSummary": {
      "total": 12,
      "recentEventTypes": {
        "project-created": 1,
        "file-linked": 3,
        "auricrux-recommend-recorded": 2
      }
    },
    "auricruxSummary": {
      "nextAction": "Confirm permit comments and route structural addendum for review"
    }
  }
}
```

### Route-required fields
- `projectId`
- `projectName`
- `projectNumber`
- `stage`
- `fileSummary`
- `auditSummary`
- `auricruxSummary`
- `sourceOpportunityId`

### Must not be faked route-locally
- project stage
- file totals
- audit totals
- latest Auricrux action summary when presented as governed truth

### Allowed fallback behavior
If backend read fails, the route may render shell continuity state only if:
- explicit fallback banner remains visible
- source labels distinguish project/files/audit backing sources
- route does not imply the read model is canonical

## 3. File Summary Read Alignment

### Consumer routes
- `/portal/opportunities/:opportunityId`
- `/portal/projects/:projectId`
- `/portal/files`

### Canonical target endpoint
`GET /api/files/summary?ownerObjectType={type}&ownerObjectId={id}`

### Required response shape
```json
{
  "ok": true,
  "backingSource": "api-workflow-store",
  "summary": {
    "ownerObjectType": "Project",
    "ownerObjectId": "project_123",
    "total": 9,
    "linked": 6,
    "unlinked": 3,
    "briefingsReady": 2,
    "byStatus": {
      "classified": 4,
      "linked": 3,
      "reviewed": 2
    },
    "byCategory": {
      "Document": 5,
      "Permit": 2,
      "Coordination": 2
    }
  }
}
```

### Required fields
- `ownerObjectType`
- `ownerObjectId`
- `total`
- `linked`
- `unlinked`
- `briefingsReady`
- `byStatus`
- `byCategory`

### Must not be faked route-locally
- linked/unlinked counts
- briefing-ready counts
- status/category rollups presented as governed summary

### Allowed fallback behavior
Fallback summary may be shown only as shell continuity support, never as governed file register truth.

## 4. Audit Summary Read Alignment

### Consumer routes
- `/portal/projects/:projectId`
- `/portal/audit`

### Canonical target endpoint
`GET /api/audit-events/summary?relatedObjectType=Project&relatedObjectId={projectId}`

### Required response shape
```json
{
  "ok": true,
  "backingSource": "api-workflow-store",
  "summary": {
    "relatedObjectType": "Project",
    "relatedObjectId": "project_123",
    "total": 12,
    "byEventType": {
      "project-created": 1,
      "file-uploaded": 2,
      "file-linked": 3,
      "auricrux-recommend-recorded": 2
    },
    "byActorType": {
      "user": 5,
      "auricrux": 4,
      "workflow": 3
    },
    "mostRecent": [
      {
        "auditEventId": "audit_201",
        "eventType": "file-linked",
        "summary": "Linked revised plan sheet to active project evidence chain",
        "createdAt": "2026-06-11T23:00:00Z"
      }
    ]
  }
}
```

### Required fields
- `relatedObjectType`
- `relatedObjectId`
- `total`
- `byEventType`
- `byActorType`
- `mostRecent`

### Must not be faked route-locally
- total audit count
- actor/event rollups
- most recent governed events when presented as backend truth

### Allowed fallback behavior
Fallback audit summaries may be used only when clearly labeled as continuity scaffolding.

## 5. Route-to-Endpoint Alignment Table

| Route | Canonical Read | Required Backing Source Goal | Current Truth |
|---|---|---|---|
| `/portal/opportunities/:opportunityId` | `GET /api/opportunities/:opportunityId/workspace` | governed opportunity workspace model | currently bid-spine-backed shell |
| `/portal/projects/:projectId` | `GET /api/projects/:projectId/workspace` | governed project workspace model | currently composed from shell stores |
| project file summary blocks | `GET /api/files/summary?...` | governed file summary model | currently route/hook-derived shell summary |
| project audit summary blocks | `GET /api/audit-events/summary?...` | governed audit summary model | currently route/hook-derived shell summary |

## 6. Fallback Disclosure Enforcement

If a route reads from anything other than the canonical backend-aligned source:
- show `ExecutionTruthBanner`
- expose current source labels
- avoid language such as `recorded`, `linked`, `converted`, `tracked`, `governed` unless backend truth supports it

## 7. First Implementation Targets

### Priority 1
Define adapter methods in `src/api/workflowClient.js` for:
- `fetchOpportunityWorkspace(opportunityId)`
- `fetchProjectWorkspace(projectId)`
- `fetchFileSummary(ownerObjectType, ownerObjectId)`
- `fetchAuditSummary(relatedObjectType, relatedObjectId)`

### Priority 2
Refactor route pages to prefer these read models over shell-composed summaries.

### Priority 3
Keep fallback mode only as a clearly disclosed contingency path.

## 8. Acceptance Gates

This alignment contract is satisfied only when:
- opportunity detail prefers governed opportunity workspace reads
- project detail prefers governed project workspace reads
- file summary uses a canonical summary endpoint
- audit summary uses a canonical summary endpoint
- fallback shell summaries remain clearly disclosed and non-deceptive

## 9. Next Build Step

Translate this contract into the first code alignment packet:

1. extend `src/api/workflowClient.js`
2. add read-adapter hooks or route-level loaders
3. patch opportunity detail route to prefer canonical backend workspace reads
4. patch project detail route to prefer canonical backend workspace reads
