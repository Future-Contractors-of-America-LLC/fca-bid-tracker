# FCA Coverage Matrix

## Purpose

This file is the repo-level no-gap enforcement artifact for FCA Contractor Command.

FCA must operate as one unified construction operating system under Auricrux orchestration. Every module must connect to the same continuity spine, produce traceable output, and remain reviewable and correctable.

## Flagship Product

**FCA Contractor Command**

Primary spine:
- Lead and opportunity intake
- Qualification
- File and evidence handling
- Bid and estimate workflow
- Client portal access
- Audit trail
- Guided Auricrux assistance

No expansion lane is valid unless it strengthens this spine.

## Continuity Spine Objects

Every workflow must attach to these objects where applicable:
- Tenant
- User
- Role
- Client
- Opportunity
- Project
- File
- Evidence Link
- Audit Event
- Financial Link
- Auricrux Action

## Mandatory Lifecycle States

Every major record must remain in a valid lifecycle state:

- Lead
- Qualified
- Pre-Design
- Design
- CD
- Bid
- Permit
- Build
- QA
- Closeout
- Warranty
- Growth
- Feedback

No state transition is complete without an output artifact.

## Core Coverage Matrix

| Domain | Must Exist | Required Objects | Required Output | Auricrux Role |
| --- | --- | --- | --- | --- |
| Market / Network | contractor directory, project listings, bid invites | Tenant, Client, Opportunity | intake record, invite, referral trail | qualify, route, summarize |
| Sales / Precon | leads, bid intake, estimate, proposal, award | Opportunity, Client, Project | bid record, estimate, proposal, handoff | explain, generate, correct |
| Documents / Plans | plan sets, specs, revisions, markups, file ingest | File, Evidence Link, Drawing Set | indexed files, revision record, briefing | read, link, detect gaps |
| Takeoff / Estimating | quantities, assemblies, pricing, scope mapping | Estimate, File, Evidence Link | takeoff lines, estimate package | assist, validate, convert |
| Execution Control | schedule, RFIs, submittals, change events, field logs | Project, Schedule, Audit Event | schedule item, RFI, daily log, CO draft | recommend, execute, audit |
| Quality / Closeout | inspections, punch, warranty, closeout | Inspection, Punch Item, Closeout Package | inspection report, punch list, closeout package | detect, summarize, follow up |
| Finance | budget, SOV, pay apps, billing, cost ledger | Cost Ledger, Financial Link, Project | budget line, pay app, billing event | flag drift, connect downstream impact |
| Academy / Workforce | course catalog, classroom flow, credential tracking, apprenticeship | Training Record, Credential, User | enrollment, lesson progress, credential record | teach, guide, assess |
| Portal / Customer Access | login, workspace, messages, notifications, support | Tenant, User, Project | authenticated workspace state | narrate status, next actions |
| Admin / Governance | entitlements, audit, system config, health | Tenant, Role, Audit Event, Operational Baseline | audit ledger, validation record | validate, record, optimize |

## Enforcement Rules

A feature is incomplete if any applicable requirement below is missing:

1. Attached to a valid Project or Opportunity home
2. Accepts file or evidence input where applicable
3. Produces an output artifact
4. Logs Auricrux actions when Auricrux explains, recommends, or executes
5. Preserves customer-visible continuity into portal/workspace flows
6. Can be reviewed and corrected later

If a module fails any applicable rule, a system gap exists.

## Product Truth Rules

- FCA is one system, not disconnected apps.
- External integrations are optional accelerators, not required dependencies.
- Auricrux must remain embedded across SaaS, Academy, Website, Portal, and Comms.
- Public-site claims must not exceed live callable behavior.
- Repo truth and deployment truth override intention.

## Current Repo Build Order

1. Public website shell continuity
2. Real customer login and authenticated workspace continuity
3. Project / Job spine
4. File spine with evidence links and document briefing
5. Takeoff and estimate continuity
6. RFI / redline / change continuity
7. QC / punch / closeout continuity
8. Finance continuity
9. Academy depth tied to live workflow context

## Definition of Done for New Work

A packet is only complete when it includes:
- changed surface or changed object
- traceable output
- validation note or check path
- continuity impact statement
- no broken route or branding regression

## Immediate Use

Before adding or approving new work, check:
- What flagship spine stage does this strengthen?
- What continuity objects does it touch?
- What artifact does it produce?
- How does Auricrux participate?
- How is the result visible to a customer or operator?

If those answers are weak, the work is drift.
