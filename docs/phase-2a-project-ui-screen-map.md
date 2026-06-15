# Phase 2A Project UI Screen Map

## Objective
Wrap the existing bid tracker inside a real Project / Job continuity surface so FCA can pivot from opportunity-only tracking into the flagship product spine.

## Primary screens

### 1. Projects Index
**Route:** `/projects`

**Purpose:**
List all projects for the selected tenant/customer.

**Sections:**
- page header
- create project CTA
- customer filter / tenant context
- project search
- project cards or table
- empty state with guidance from Auricrux

**Required fields shown:**
- project name
- stage
- status
- location
- linked bid count
- file count
- next action
- last Auricrux review

---

### 2. Project Detail
**Route:** `/projects/:projectId`

**Purpose:**
Home for all continuity attached to one job.

**Header block:**
- project name
- customer name
- stage
- status
- location
- estimator
- project manager
- quick action buttons

**Tabs:**
- Overview
- Bids
- Files
- Briefings
- Activity

---

### 3. Overview Tab
**Purpose:**
Show summary and required next fields.

**Panels:**
- Auricrux narrative
- next action
- missing continuity items
- tags
- notes
- lifecycle stage controls

---

### 4. Bids Tab
**Purpose:**
Link existing bids/opportunities to the project spine.

**Interactions:**
- show linked bids
- show unlinked bids for same customer
- link / unlink control
- display bid value, trade, status, recommendation

---

### 5. Files Tab
**Purpose:**
Future home for plan/spec upload continuity.

**Initial MVP layout:**
- upload dropzone
- files table
- version badge
- file type
- upload date
- source
- Auricrux action menu

**Empty state CTA:**
Upload plans, specs, and intake evidence to start project continuity.

---

### 6. Briefings Tab
**Purpose:**
Display Auricrux-generated document briefings.

**Elements:**
- briefing list
- created at
- source files count
- summary excerpt
- regenerate button

---

### 7. Activity Tab
**Purpose:**
Auditability.

**Elements:**
- timeline of changes
- who/what created event
- before/after highlights
- document generation events
- file ingestion events

## Component map
- `ProjectsPage`
- `ProjectList`
- `ProjectCard`
- `ProjectDetailPage`
- `ProjectHeader`
- `ProjectTabs`
- `ProjectOverviewPanel`
- `ProjectBidLinkPanel`
- `ProjectFilesPanel`
- `ProjectBriefingsPanel`
- `ProjectActivityPanel`

## API dependencies
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/{id}`
- `PATCH /api/projects/{id}`
- future: `GET /api/projects/{id}/files`
- future: `POST /api/projects/{id}/briefings`
- future: bid linking endpoint

## State rules
- no project detail renders without project id
- files tab remains visibly present even before upload
- briefings tab remains visibly present even before first briefing
- Auricrux next action is always shown
- every mutation should later emit an audit event

## Exit criteria for UI packet implementation
- user can create a project from the portal
- user can view project list
- user can open project detail
- user can update core fields
- user can see placeholder tabs for files/briefings/activity
