# FCA Contractor Command — Build Sequence v1

## Status
Working execution artifact aligned to FCA system-law, uploaded matrix guidance, and no-gap continuity requirements.

## Product Decision
**Flagship product:** FCA Contractor Command

## Product Spine
1. Lead / Opportunity Intake
2. Qualification
3. Project / Job Conversion
4. File + Evidence Handling
5. Bid / Estimate Workflow
6. Client Portal Access
7. Audit Trail
8. Guided Auricrux Assistance

## Canonical Rules
- No module stands alone.
- No step is complete without output.
- No state transition without valid object state.
- All applicable modules must support file intake.
- All Auricrux actions must be logged.
- All artifacts must route canonically.
- No major new lane unless it strengthens the flagship spine.

## Reduced State Model
Lead -> Qualified -> Bid -> Awarded/Declined -> Project Setup -> Active -> Closeout -> Warranty

## Mandatory Objects
- Lead
- Opportunity
- Client
- Site
- Project
- Contract
- Estimate
- Drawing Set
- BIM Model
- Permit
- Schedule
- Cost Ledger
- Subcontractor
- Procurement Package
- Inspection
- Punch Item
- Closeout Package
- Warranty Case
- Training Record
- Credential
- Telemetry Event
- Operational Baseline

## Build Order

### Packet 1 — Intake and Qualification Hardening
**Goal:** Create reliable entry and qualification flow.
**Deliverables:**
- normalized Lead and Opportunity object definitions
- qualification status model
- visible next-action state
- customer/client linkage
- audit event on create/update

### Packet 2 — Project / Job Spine
**Goal:** Convert approved bid/opportunity work into governed project space.
**Deliverables:**
- Project object
- bid-to-project conversion path
- Project status lifecycle
- customer -> project -> bid visibility chain
- conversion audit trail

### Packet 3 — File + Evidence Spine
**Goal:** Make file ingestion a first-class operating layer.
**Deliverables:**
- project files surface
- upload package support
- file metadata model
- versioning
- evidence links
- Auricrux document briefing output
- audit event on upload/change

### Packet 4 — Estimate / Proposal Continuity
**Goal:** Preserve estimator workflow and make output customer-usable.
**Deliverables:**
- estimate versioning
- scope assumptions / exclusions
- proposal package generation
- revision trail
- estimate/proposal linkage to source files

### Packet 5 — Client Portal Access
**Goal:** Give customers authenticated visibility into real work.
**Deliverables:**
- login-gated workspace
- customer-visible project/bid cards
- file visibility
- proposal/status visibility
- guided next actions

### Packet 6 — Guided Auricrux + Correction Loop
**Goal:** Reduce founder routing burden and make the system self-correcting.
**Deliverables:**
- activity ledger
- reasons-for-action
- missing state detection
- correction prompts
- continuity summaries

## Explicit Deferrals Until Spine Is Stable
- full accounting parity
- full PM suite breadth
- network marketplace breadth
- broad academy breadth beyond direct spine support
- shell-only UI expansion without object/state utility

## Definition of Done for Any Packet
A packet is not complete unless it produces:
- a usable surface
- structured object linkage
- audit output
- validation notes
- a bounded next packet
