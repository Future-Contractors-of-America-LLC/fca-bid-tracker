# Implementation Packet 047 — Complete Spine + Single Coordinated Release

## Issue
The user direction is clear: FCA SaaS and FCA Academy must not continue as adjacent tracks. They must be expanded from the flagship FCA Contractor Command spine and released as one coordinated product. The current repo truth shows meaningful progress, but the system is still in a split maturity state:
- flagship sales-to-project continuity exists in parts
- project, files, and workspace surfaces exist
- Academy/LMS surfaces exist
- customer login and seeded session truth exist
- product truth is still not fully locked to one canonical spine
- release readiness is not yet governed as one unified gate

## Risk
If FCA continues expanding by lane instead of by shared spine, the result will be:
- separate SaaS and LMS truth layers
- fragile deployment and route drift
- fake completeness at release time
- founder dependence for interpretation and correction
- customer confusion about what FCA actually is

## Decision
Proceed with a **complete spine build sequence** that still culminates in **one coordinated release**.

This is not permission to build random breadth all at once.
This is permission to:
1. finish the full shared backbone
2. expand from the flagship into the required adjacent modules
3. hold all release gates until the unified product is coherent
4. release the expanded system together

## Product truth
FCA releases as **one system**:
- one identity boundary
- one tenant model
- one entitlement model
- one project/job home
- one file/evidence spine
- one audit/event ledger
- one Auricrux action layer
- one customer workspace
- one Academy/LMS connected to live work
- one deployment and release gate

This follows the uploaded system definition and build-sequence law:
- FCA is one unified system, not fragmented apps
- the spine must be locked first or SaaS + Academy + Website will sprawl
- everything must attach to shared continuity objects
- Academy must be integrated with real project work, not isolated training

## Complete spine scope

### 1. Identity and tenant spine
Required objects:
- Tenant
- User
- Role
- Seat
- Subscription
- Entitlement
- Customer account session

Required outcomes:
- one customer can authenticate once and move through portal, SaaS, LMS, billing, and Auricrux surfaces
- route access is governed by entitlements, role, and readiness
- no page invents its own auth truth

### 2. Commercial and intake spine
Required objects:
- Lead
- Opportunity
- Client
- Site
- Proposal
- Award decision

Required outcomes:
- lead intake creates governed records
- qualification creates opportunity
- proposal can be generated from governed estimate/opportunity state
- award or decline produces downstream continuity

### 3. Project and execution spine
Required objects:
- Project/Job
- Schedule placeholder / readiness state
- Task / next action
- Operations state
- Change event
- RFI
- QC/Punch

Required outcomes:
- a converted opportunity becomes a canonical project
- every downstream action resolves back to project/job
- operational next actions are visible across SaaS and Academy

### 4. File and evidence spine
Required objects:
- File
- File package
- Plan set
- Sheet index
- Evidence link
- Document briefing

Required outcomes:
- every major module can ingest files and produce files
- evidence links back to project and, where relevant, sheet/detail/location
- Auricrux can read, summarize, act on, and audit file-driven work

### 5. Financial spine
Required objects:
- Budget line
- Estimate line
- Proposal value
- Change order value
- Billing state
- Pay app / SOV placeholder
- Revenue readiness state

Required outcomes:
- proposal, project setup, change, and billing stay connected
- finance is not a disconnected later lane
- at minimum, financial continuity truth exists even before full accounting depth

### 6. Academy/LMS spine
Required objects:
- Program
- Course
- Lesson/module
- Assessment
- Enrollment
- Assignment
- Progress record
- Completion record
- Credential / certificate
- Feature gate / readiness restriction

Required outcomes:
- Academy is connected to live roles, projects, and next actions
- LMS is not a separate training shell
- readiness can unlock or block product actions where appropriate
- credential state feeds customer and operational truth

### 7. Auricrux spine
Required objects:
- Auricrux action record
- Recommendation
- Execution log
- Before/after snapshot
- Reason
- Correction prompt

Required outcomes:
- Auricrux explains, recommends, and executes consistently across SaaS and LMS
- every action can be reviewed and corrected
- no fake assistant layer that lacks state impact

## Single-release expansion model
The user asked to release all at once expanded from the flagship. The correct interpretation is:
- **one release event**
- **many modules included**
- **all modules anchored to the flagship spine**
- **no fragmented launch by unrelated lane**

## Release contents
The coordinated release should include these minimum live product surfaces:

### Customer-facing website and access
- Home
- Features
- Pricing
- Login
- Contact / request access

### Unified customer workspace
- Platform dashboard
- Projects
- Files
- Bids / estimates
- Proposals
- Billing
- Support
- Profile
- Auricrux
- Academy

### Operational flagship path
- Lead intake
- Qualification
- Opportunity detail
- Proposal generation
- Award / conversion to project
- Project workspace
- File ingestion / document briefing

### LMS minimum connected path
- Academy home
- Program catalog
- Course view
- Enrollment state
- Assignment state tied to project/workflow
- Progress tracking
- Credential or certificate issuance placeholder tied to governed records

## Non-negotiable release gates
All of these must pass before the single coordinated release is called complete:

### Gate A — identity truth
- customer login works from the live domain
- customer session sync works
- logout works
- role and entitlement gating work consistently

### Gate B — flagship continuity truth
- lead becomes opportunity
- opportunity becomes proposal-ready
- opportunity converts into canonical project
- project appears in project list and project detail

### Gate C — file/evidence truth
- files can be uploaded/registered
- files attach to project
- Auricrux document briefing exists
- audit/event trail exists for file actions

### Gate D — Academy truth
- Academy loads under authenticated customer context
- user can enroll or be assigned
- progress state persists in governed form
- project-linked assignment/readiness is visible
- feature gate or readiness linkage affects real workflow state

### Gate E — Auricrux truth
- Auricrux appears across workspace and Academy surfaces
- Auricrux action payloads are recorded
- explain / recommend / execute behavior is consistent

### Gate F — deployment truth
- preview deployment validates changed routes
- staging validates auth + workspace + academy + files + API paths
- production validates live domain behavior
- live shell matches repo truth

## Build sequence for this packet
This is the complete-spine sequence that still ends in one release.

### Phase 1 — lock the canonical shared objects
Build or reconcile:
- tenant
- user
- role
- subscription/entitlement
- lead
- opportunity
- project
- file
- audit event
- academy assignment/enrollment/progress
- Auricrux action record

### Phase 2 — reconcile runtime stores
Eliminate parallel truth layers between:
- lead/opportunity store
- project workspace read model
- file register/upload path
- academy store
- session/auth state
- portal route consumers

### Phase 3 — complete flagship expansion surfaces
Expand from the flagship to include the adjacent required modules:
- proposal generation
- project creation/handoff
- files and document briefing
- billing continuity view
- academy assignment/readiness

### Phase 4 — unified release hardening
Add or enforce:
- preview/staging/production validation
- route acceptance checks
- live shell verification
- release checklist for SaaS + LMS together

### Phase 5 — single coordinated release
Release only when the combined product passes the unified gates above.

## Repo-facing execution order

### Packet 047A — canonical object reconciliation
Target:
- unify project truth across opportunity conversion and workspace reads
- lock academy assignment/progress objects
- confirm auth/session truth feeds both SaaS and LMS

### Packet 047B — flagship-plus expansion
Target:
- proposal generator to governed output
- award/handoff state
- project files + document briefing
- readiness signal visible across workspace and Academy

### Packet 047C — single-release enforcement
Target:
- unified release gate doc
- validation scripts covering auth, workspace, academy, files, and Auricrux
- staging/prod acceptance packet

## Explicit anti-drift rule
Do not interpret “release all at once” as permission to build random peripheral breadth before the spine is whole.

It means:
- finish the complete shared backbone
- finish the minimum expanded module set from the flagship
- release them together as one coherent system

## Validation artifact required next
The next artifact after this packet should be:
- `docs/FCA_UNIFIED_SINGLE_RELEASE_GATE.md`

And the next code packet should be:
- canonical project + academy readiness reconciliation

## Truth statement
As of this packet, FCA should still be described truthfully as:
**a unified SaaS + LMS system under active complete-spine hardening, moving toward one coordinated release**

It should **not** yet be described as fully release-ready until the unified gates pass.
