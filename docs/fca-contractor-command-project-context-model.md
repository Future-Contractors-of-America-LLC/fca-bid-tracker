# FCA Contractor Command — Project Context Model v1

Status: Active Draft
Scope: Packet 023 implementation contract

## Purpose

This document defines the canonical shared project context required for Contractor Command to behave like a real construction operating workspace instead of a set of disconnected routes.

## Core Rule

Any route or component that claims to operate on a project must resolve a shared project context rather than inventing route-local truth.

## Canonical Project Context Object

```json
{
  "activeTenantId": "tenant_123",
  "activeUserId": "user_123",
  "activeProjectId": "project_123",
  "activeProjectName": "Riverside Retail Upfit",
  "activeProjectNumber": "FCA-2026-001",
  "activeProjectState": "active",
  "activeOpportunityId": "opp_123",
  "activeClientId": "client_123",
  "activeSiteId": "site_123",
  "activeEstimateId": "estimate_123",
  "projectHealth": "on-track",
  "continuityAlerts": [],
  "fileCounts": {
    "total": 18,
    "unreviewed": 3,
    "needsLinkage": 2
  },
  "auditSummary": {
    "lastEventAt": "2026-06-09T00:00:00Z",
    "openCorrections": 1
  },
  "auricruxSummary": {
    "lastMode": "recommend",
    "nextAction": "Review newly uploaded structural addendum"
  }
}
```

## Required Context Fields

### Identity and ownership
- `activeTenantId`
- `activeUserId`
- `activeProjectId`
- `activeProjectName`
- `activeProjectNumber`

### Upstream continuity
- `activeOpportunityId`
- `activeClientId`
- `activeSiteId`
- `activeEstimateId`

### Live operating state
- `activeProjectState`
- `projectHealth`
- `continuityAlerts[]`

### File / audit / Auricrux summary
- `fileCounts`
- `auditSummary`
- `auricruxSummary`

## Context Resolution Order

Project context should be resolved in this order:

1. explicit route parameter (`:projectId`)
2. stored workspace selection
3. most recently active project for current tenant/user
4. null-state fallback that asks user to select a project

Never silently bind to the wrong tenant or project.

## Route Consumption Requirements

### `/portal/projects`
Must show:
- project list
- current selected project
- lifecycle state
- continuity signals

### `/portal/projects/:projectId`
Must hydrate full project context and expose:
- project header context
- related opportunity linkage
- file summary
- audit summary
- Auricrux next action

### `/portal/files`
Must use active project context when available.
If no active project exists, it must make that missing state explicit.

### `/portal/audit`
Must filter or pivot by active project context while preserving tenant-wide traceability.

## UI Surface Requirements

Any project-aware surface should be able to display:
- project name/number
- lifecycle state
- client linkage
- open continuity alerts
- recent file/audit movement
- Auricrux next action

## Persistence Guidance

Store client-side shared workspace context in one canonical location only.
Recommended key shape:
- `fca.workspace.activeTenantId`
- `fca.workspace.activeProjectId`
- `fca.workspace.activeOpportunityId`

Avoid duplicative per-route project context stores.

## Failure Conditions

A project route is invalid if:
- it renders project-looking content without a resolved project ID
- it uses stale route-local state that conflicts with canonical workspace state
- it cannot expose file/audit/Auricrux continuity
- it loses upstream opportunity/client linkage
