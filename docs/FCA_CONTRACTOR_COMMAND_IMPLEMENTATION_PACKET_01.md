# FCA Contractor Command — Implementation Packet 01

Status: Active execution packet  
Scope: Sales-to-Operations vertical slice  
Priority: High  
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`

---

## Objective

Convert the existing bid-tracker shell into the first revenue-capable Contractor Command vertical slice:

Lead -> Qualification -> Bid -> Estimate -> Proposal -> Award -> Job Setup

This packet is intentionally bounded. It does not expand into broad new lanes unless they strengthen the spine.

---

## Verified Starting Point

The repository already contains:

- bid-tracker UI surfaces
- portal-oriented app structure
- API folder
- multiple Auricrux workflow files
- customer-entry and customer-status surfaces
- build-validation workflows

The repository does **not** currently expose `FCA_COVERAGE_MATRIX.md` on `main` before this packet, and repo truth does not yet prove a complete Project/File/Audit/Proposal spine.

---

## Delivery Sequence

### Packet 01A — Canonical object and route lock

Create and/or standardize these objects:

- Lead
- Opportunity
- Bid
- Estimate
- Proposal
- Project
- File
- AuditEvent
- Task

Create and/or standardize these route families:

- `/portal/leads`
- `/portal/opportunities/:id`
- `/portal/bids/:id`
- `/portal/estimates/:id`
- `/portal/proposals/:id`
- `/portal/projects/:id`

Acceptance gate:

- routes compile
- nav exposes only real or explicitly marked in-build surfaces
- no orphan route exists without an object owner

### Packet 01B — Project spine

Implement:

- `Project` object shape
- project creation from awarded opportunity or awarded bid
- baseline task creation on job setup
- portal project list / detail surface

Acceptance gate:

- awarded record can create a project
- project detail view renders stable object data
- project is tenant-scoped

### Packet 01C — Proposal spine

Implement:

- proposal draft object
- proposal generation from estimate
- proposal status transitions
- customer-visible proposal view

Acceptance gate:

- estimate can generate proposal
- proposal artifact exists and is viewable
- proposal changes are audited

### Packet 01D — File spine

Implement:

- object-linked files metadata model
- upload/list/version display surface
- document briefing placeholder or first real summarization endpoint
- linkage to opportunity, bid, proposal, and project

Acceptance gate:

- file attaches to a parent object
- file metadata persists
- file list is visible on parent workspace

### Packet 01E — Audit spine

Implement:

- `AuditEvent` model
- append-only write helper
- surface-level capture of create/update/transition actions
- Auricrux action reason field

Acceptance gate:

- state transitions write audit rows
- Auricrux and human actor types are distinguishable
- object history can be rendered or queried

---

## Recommended File Targets

These are target surfaces to inspect and wire, based on current repo structure:

- `src/`
- `components/`
- `app/`
- `api/`
- `router.jsx`
- portal pages under current runtime structure

---

## Object Minimums

### Lead
- `leadId`
- `tenantId`
- `source`
- `contactName`
- `companyName`
- `projectType`
- `status`
- `createdAt`

### Opportunity
- `opportunityId`
- `tenantId`
- `leadId`
- `status`
- `ownerUserId`
- `qualificationNotes`
- `dueDate`

### Bid
- `bidId`
- `tenantId`
- `opportunityId`
- `projectId`
- `status`
- `dueDate`
- `amount`

### Estimate
- `estimateId`
- `tenantId`
- `bidId`
- `version`
- `lineItems`
- `totals`
- `assumptions`
- `exclusions`

### Proposal
- `proposalId`
- `tenantId`
- `bidId`
- `estimateId`
- `status`
- `version`
- `generatedAt`

### Project
- `projectId`
- `tenantId`
- `clientId`
- `sourceOpportunityId`
- `status`
- `address`
- `createdAt`

### File
- `fileId`
- `tenantId`
- `relatedObjectType`
- `relatedObjectId`
- `fileName`
- `fileType`
- `version`
- `uploadedAt`

### AuditEvent
- `eventId`
- `tenantId`
- `objectType`
- `objectId`
- `actorType`
- `actorId`
- `action`
- `reason`
- `beforeJson`
- `afterJson`
- `createdAt`

---

## Validation Gates

Before claiming packet completion, validate:

1. route existence
2. object creation path
3. state transition path
4. audit emission
5. customer-visible utility
6. tenant scoping
7. no seeded-only fake completion

---

## Not Allowed

- broad Academy build-out before the Contractor Command spine is stable
- new isolated modules without Project/File/Audit attachment
- claiming auth, proposal, project, or file capability complete without callable surfaces
- hiding missing functionality behind cosmetic shell polish

---

## Next Packet After 01

`FCA_CONTRACTOR_COMMAND_IMPLEMENTATION_PACKET_02.md`

Target:

- Project + File + Audit implementation mapping
- exact route-by-route acceptance checklist
- concrete validator additions for no-gap enforcement
