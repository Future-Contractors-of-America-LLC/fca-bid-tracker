# FCA Contractor Command — Route Map v1

Status: Active Draft
Scope: Flagship product spine route inventory
Parent: FCA Contractor Command spec / object / state / coverage artifacts

## Purpose

This document maps the flagship Contractor Command spine into concrete FCA shell routes so the public site, login flow, authenticated workspace, and project/file/audit surfaces remain aligned.

## Route Law

1. No route may behave as an isolated page.
2. Public routes must convert cleanly into authenticated product routes.
3. Authenticated routes must preserve tenant, project, file, audit, and Auricrux continuity.
4. If a route exposes workflow state, it must map to governed objects.
5. If a route advances work, it must produce an output and an AuditEvent where applicable.

## Route Groups

### 1. Public conversion shell

| Route | Purpose | Primary Objects | Notes |
|---|---|---|---|
| `/` | public front door | none -> Lead | trust, CTA, platform framing |
| `/platform` | flagship product narrative | none -> Opportunity | describes Contractor Command spine |
| `/auricrux` | embedded intelligence narrative | AuricruxAction | explain / recommend / execute framing |
| `/pricing` | offer and packaging surface | Tenant | truthful bounded packaging |
| `/contact` | intake conversion | Lead, Client | form into governed intake |
| `/login` | authenticated access handoff | User, Tenant | real customer login required |

### 2. Authenticated workspace shell

| Route | Purpose | Primary Objects | Notes |
|---|---|---|---|
| `/portal` | main contractor workspace | Tenant, Opportunity, Project, AuditEvent | executive and customer home |
| `/portal/projects` | project list and selection | Tenant, Project | canonical job spine |
| `/portal/projects/:projectId` | project detail | Project, FileAsset, AuditEvent, AuricruxAction | project continuity home |
| `/portal/opportunities` | opportunity list | Opportunity | sales/precon pipeline |
| `/portal/opportunities/:opportunityId` | opportunity detail | Opportunity, Estimate, FileAsset | estimate/proposal handoff |
| `/portal/files` | tenant-wide file workspace | FileAsset, EvidenceLink | searchable file spine |
| `/portal/audit` | audit timeline | AuditEvent, AuricruxAction | continuity proof |
| `/portal/messages` | coordination surface | Project, AuditEvent, AuricruxAction | preserve construction-real coordination |
| `/portal/billing` | commercial continuity surface | Tenant, Project, CostLedgerEntry | bounded until finance spine expands |
| `/portal/support` | support and continuity | Tenant, AuditEvent, TrainingLink | support should teach and route |
| `/portal/admin` | tenant admin controls | Tenant, User, Role | governed admin surface |
| `/portal/notifications` | continuity and next-action feed | AuditEvent, AuricruxAction | required next steps and system notices |

### 3. Bid workflow legacy/canonical routes

| Route | Purpose | Primary Objects | Notes |
|---|---|---|---|
| `/bid-entry` | bid entry surface | Lead, Opportunity, Estimate | preserve working functionality |
| `/bid-status` | bid status surface | Opportunity, AuditEvent | preserve continuity |
| `/tyler-entry` | legacy customer entry | Opportunity | retain until safely consolidated |
| `/tyler-status` | legacy customer status | Opportunity, AuditEvent | retain until safely consolidated |

### 4. Academy-linked routes

| Route | Purpose | Primary Objects | Notes |
|---|---|---|---|
| `/academy` | Academy shell | TrainingLink, TrainingRecord, Credential | must remain attached to FCA workflow context |
| `/academy/courses/:courseId` | course detail | TrainingRecord, Credential | no detached LMS behavior |
| `/academy/checklists/:checklistId` | workflow-linked checklist | TrainingLink, Project/Opportunity | supports next-action continuity |

## Canonical Route-to-Object Mapping

### Public intake flow
- `/contact` -> Lead
- Lead qualification -> Opportunity
- Opportunity detail -> Estimate / Proposal
- Award -> Project
- Project -> Files / Audit / Portal visibility

### Authenticated product flow
- `/login` -> `/portal`
- `/portal` selects or restores active tenant / opportunity / project context
- `/portal/opportunities/:opportunityId` manages intake, files, estimate, proposal readiness
- `/portal/projects/:projectId` becomes continuity home for files, evidence, audit, training links, and later RFI/QC/change objects

## Required Shared Route State

Routes that display product continuity should resolve shared workspace state for:
- activeTenantId
- activeUserId
- activeOpportunityId
- activeProjectId
- activeEstimateId
- activeFileContextId
- activeWorkspaceMode

No route should maintain contradictory local truth for these values when canonical shared state exists.

## Route Expansion Sequence

### Phase A
- `/portal/opportunities/:opportunityId`
- `/portal/projects`
- `/portal/projects/:projectId`
- `/portal/files`
- `/portal/audit`

### Phase B
- plan/document detail routes
- evidence-linked file review surfaces
- document briefing presentation surfaces

### Phase C
- takeoff routes
- RFI / redline routes
- change event / change order routes
- QC / punch routes

### Phase D
- finance continuity routes
- Academy next-action deep links

## Route Failure Conditions

A route is invalid if:
- it exposes workflow behavior without governed object context
- it breaks tenant continuity
- it cannot surface next-step visibility
- it creates work without auditability where applicable
- it duplicates canonical route purpose without migration reason
- it behaves as demo-only theater with no live state linkage
