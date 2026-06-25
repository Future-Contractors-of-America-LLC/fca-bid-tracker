# FCA Contractor Command â€” Route Implementation Checklist v2

Status: Active Draft
Scope: Packet 035 route-level enforcement checklist

## Purpose

This checklist translates the flagship spine handoff contract into route-by-route implementation work and acceptance enforcement for the first live Contractor Command paths.

## Route Enforcement Law

A route is not implementation-ready unless it can name:

1. the governed object it operates on
2. the backend action it requires
3. the durable output it creates or reads
4. the audit event family it emits or displays
5. the downstream continuity it preserves

## 1. `/contact` or equivalent intake CTA route

### Required outcomes
- capture governed lead intake
- preserve tenant/client/site context when available
- hand off to backend lead creation
- avoid dead-end email-only submission behavior
- route user toward qualification-capable path

### Implementation checks
- [ ] route maps to `Lead`
- [ ] route submits via `POST /api/leads`
- [ ] route produces a durable `Lead` output rather than notification-only behavior
- [ ] route can identify `lead-created` audit family
- [ ] route exposes success/failure state truthfully
- [ ] route does not claim qualification unless that backend action exists

## 2. `/portal/opportunities/:opportunityId`

### Required outcomes
- display governed opportunity detail
- preserve upstream lead/client/site continuity
- support qualification/award/convert actions
- expose estimate and file linkage readiness
- route cleanly toward project creation when warranted

### Implementation checks
- [ ] route maps to `Opportunity`
- [ ] route resolves canonical `activeOpportunityId`
- [ ] route identifies required backend actions for qualify/update/convert paths
- [ ] route can display durable outputs for opportunity decisions
- [ ] route can identify `opportunity-created`, `lead-qualified`, `opportunity-awarded`, and `opportunity-converted` event families where applicable
- [ ] route does not present project-level completion if no governed project exists
- [ ] route preserves estimate/file linkage visibility

## 3. `/portal/projects`

### Required outcomes
- show project list tied to active tenant
- show lifecycle state per project
- allow selection of active project
- write canonical shared project context
- show continuity alerts / project health summary

### Implementation checks
- [ ] route maps to `Project`
- [ ] route reads via governed project collection path
- [ ] route resolves current tenant context
- [ ] route reads/writes canonical active project context
- [ ] route avoids duplicate local active-project state
- [ ] selected project can drive downstream files/audit routes
- [ ] project card language is construction-real
- [ ] route does not imply project conversion is complete without upstream source linkage

## 4. `/portal/projects/:projectId`

### Required outcomes
- hydrate project header context
- show upstream linkage to opportunity/client/site
- show file summary
- show audit summary
- show Auricrux next action
- act as continuity home for downstream file/evidence work

### Implementation checks
- [ ] route maps to `Project`, `FileAsset`, `AuditEvent`, and `AuricruxAction`
- [ ] route param binds canonical active project context
- [ ] missing project state fails safely
- [ ] project summary includes project number/name/state
- [ ] route can identify `GET /api/projects/:projectId` or `GET /api/projects/:projectId/context` as source-of-truth read
- [ ] file summary block exists
- [ ] audit summary block exists
- [ ] Auricrux action rail or summary exists
- [ ] route does not sever upstream opportunity/client/site linkage

## 5. `/portal/files`

### Required outcomes
- show files in active project or selected owner context
- expose upload / classify / linkage state
- support document briefing visibility later
- preserve ownerObject linkage
- make missing execution wiring explicit when not live yet

### Implementation checks
- [ ] route maps to `FileAsset` and `EvidenceLink`
- [ ] route reads active project context when available
- [ ] route can fall back to tenant-wide file view safely
- [ ] file cards show status/classification/version
- [ ] file cards show ownerObject linkage
- [ ] route can identify `POST /api/files`, `PATCH /api/files/:fileId`, and `POST /api/files/:fileId/link` handoffs
- [ ] route can identify `file-uploaded`, `file-classified`, and `file-linked` event families
- [ ] file route does not pretend full native document intelligence exists yet
- [ ] file route does not allow blob-only orphan uploads

## 6. `/portal/audit`

### Required outcomes
- show real continuity history
- filter by active project or broader tenant scope
- show actor, reason, event type, time
- preserve Auricrux action visibility
- remain useful even when read-only first

### Implementation checks
- [ ] route maps to `AuditEvent` and `AuricruxAction`
- [ ] audit route reads active project context
- [ ] audit route distinguishes user/system/auricrux/workflow actors
- [ ] audit items expose reason and summary
- [ ] route can identify `GET /api/audit-events` as source-of-truth read path
- [ ] route supports recent corrections / action history
- [ ] route does not show fake audit theater disconnected from governed objects

## Shared Component Checks

Components likely needed or updated:
- Project spine bar / context bar
- Opportunity continuity summary
- Files summary panel
- Audit timeline panel
- Auricrux next-action panel
- continuity alert badge group
- missing-execution-state warning surface

## Non-Negotiables
- [ ] no route-local contradictory project or opportunity state
- [ ] no fake completion language
- [ ] no isolated file UI with no owner linkage
- [ ] no Auricrux copy without governed target context
- [ ] no route claiming execution without audit hook path
- [ ] no public CTA that dead-ends outside governed intake

## Completion Standard

Packet 035 is implementation-ready when these routes can be built against:
- flagship spine handoff contract
- canonical project context model
- canonical file payloads
- canonical audit payloads
- canonical Auricrux action payloads
- route-level acceptance enforcement document
