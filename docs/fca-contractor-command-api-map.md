# FCA Contractor Command — API Map v1

Status: Active Draft
Scope: Phase-2 execution packet for flagship product spine

## Purpose

This document translates the Contractor Command object and route model into concrete endpoint families for the current FCA shell and future hardened API surfaces.

## API Law

1. Endpoint families must align to governed objects.
2. No endpoint may create workflow state without lifecycle validation.
3. Execute-capable endpoints must emit AuditEvent records.
4. File endpoints must preserve evidence and owner-object linkage.
5. API naming should favor stable, construction-real object terms over generic SaaS abstractions.

## Endpoint Families

### Leads
Base: `/api/leads`

| Method | Path | Purpose | Output |
|---|---|---|---|
| GET | `/api/leads` | list leads by tenant/filter | lead collection |
| POST | `/api/leads` | create lead from intake | lead record + audit |
| GET | `/api/leads/:leadId` | retrieve lead detail | lead record |
| PATCH | `/api/leads/:leadId` | update lead fields/state | updated lead + audit |
| POST | `/api/leads/:leadId/qualify` | qualify or reject lead | qualification decision + linked opportunity where applicable |

### Opportunities
Base: `/api/opportunities`

| Method | Path | Purpose | Output |
|---|---|---|---|
| GET | `/api/opportunities` | list opportunities | opportunity collection |
| POST | `/api/opportunities` | create opportunity | opportunity + audit |
| GET | `/api/opportunities/:opportunityId` | retrieve opportunity | opportunity detail |
| PATCH | `/api/opportunities/:opportunityId` | update state/fields | updated opportunity + audit |
| POST | `/api/opportunities/:opportunityId/award` | mark awarded | award event |
| POST | `/api/opportunities/:opportunityId/loss` | mark lost | loss event |
| POST | `/api/opportunities/:opportunityId/convert-to-project` | create project from governed opportunity | project + conversion audit |

### Estimates
Base: `/api/estimates`

| Method | Path | Purpose | Output |
|---|---|---|---|
| GET | `/api/estimates` | list estimates | estimate collection |
| POST | `/api/estimates` | create estimate version | estimate + audit |
| GET | `/api/estimates/:estimateId` | retrieve estimate | estimate detail |
| PATCH | `/api/estimates/:estimateId` | revise estimate | revised estimate + audit |
| POST | `/api/estimates/:estimateId/approve` | internal approval | approval event |
| POST | `/api/estimates/:estimateId/bind-proposal` | bind estimate to proposal package | proposal-bound estimate snapshot |

### Proposals
Base: `/api/proposals`

| Method | Path | Purpose | Output |
|---|---|---|---|
| POST | `/api/proposals` | generate proposal package | proposal artifact + audit |
| GET | `/api/proposals/:proposalId` | retrieve proposal metadata | proposal detail |
| POST | `/api/proposals/:proposalId/send` | record send action | send event |
| POST | `/api/proposals/:proposalId/respond` | accepted / declined | decision event |

### Projects
Base: `/api/projects`

| Method | Path | Purpose | Output |
|---|---|---|---|
| GET | `/api/projects` | list projects | project collection |
| POST | `/api/projects` | create project (governed only) | project + audit |
| GET | `/api/projects/:projectId` | retrieve project detail | project + continuity objects |
| PATCH | `/api/projects/:projectId` | update project fields/state | updated project + audit |
| GET | `/api/projects/:projectId/context` | composite workspace context | project, files, audit, actions |

### Files
Base: `/api/files`

| Method | Path | Purpose | Output |
|---|---|---|---|
| GET | `/api/files` | list files by tenant/object | file collection |
| POST | `/api/files` | upload/register file | FileAsset + audit |
| GET | `/api/files/:fileId` | retrieve file metadata | FileAsset |
| PATCH | `/api/files/:fileId` | classify/index/link file | updated FileAsset + audit |
| POST | `/api/files/:fileId/link` | attach evidence linkage | EvidenceLink + audit |
| POST | `/api/files/:fileId/briefing` | create document briefing | briefing artifact + AuricruxAction |
| GET | `/api/files/:fileId/versions` | show version lineage | file version collection |

### Audit Events
Base: `/api/audit-events`

| Method | Path | Purpose | Output |
|---|---|---|---|
| GET | `/api/audit-events` | list audit events | event collection |
| POST | `/api/audit-events` | create explicit audit event | audit record |
| GET | `/api/audit-events/:auditEventId` | retrieve audit record | audit detail |

### Auricrux Actions
Base: `/api/auricrux/actions`

| Method | Path | Purpose | Output |
|---|---|---|---|
| POST | `/api/auricrux/actions/explain` | contextual explanation | AuricruxAction |
| POST | `/api/auricrux/actions/recommend` | next-step recommendations | AuricruxAction |
| POST | `/api/auricrux/actions/execute` | bounded execution | AuricruxAction + audit |
| GET | `/api/auricrux/actions` | list action history | action collection |
| GET | `/api/auricrux/actions/:actionId` | retrieve action detail | action detail |

### Training Links
Base: `/api/training-links`

| Method | Path | Purpose | Output |
|---|---|---|---|
| GET | `/api/training-links` | list workflow-linked training | training link collection |
| POST | `/api/training-links` | create workflow-linked training reference | training link |

## Composite Read Models

The UI will need composite reads for production-ready continuity surfaces.

### Portal summary
`GET /api/portal/summary`
- tenant summary
- active opportunities
- active projects
- recent audit events
- recent Auricrux actions
- next actions

### Opportunity workspace
`GET /api/opportunities/:opportunityId/workspace`
- opportunity
- estimate versions
- linked files
- evidence links
- timeline
- Auricrux recommendations

### Project workspace
`GET /api/projects/:projectId/workspace`
- project
- files
- audit timeline
- related opportunity
- related training links
- current continuity alerts

## Initial Validation Gates

Before an endpoint is called production-ready, it must prove:
- tenant scoping
- lifecycle-state validation
- audit output where applicable
- stable object identity
- no destructive bypass of continuity chain

## Later Expansion Families

Reserved next families:
- `/api/drawing-sets`
- `/api/sheets`
- `/api/takeoffs`
- `/api/rfis`
- `/api/change-events`
- `/api/change-orders`
- `/api/inspections`
- `/api/punch-items`
- `/api/cost-ledger`
- `/api/closeout`
- `/api/warranty`

These must extend the same governed spine rather than create separate subsystem logic.
