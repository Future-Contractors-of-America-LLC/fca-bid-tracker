# FCA Contractor Command — Implementation Packet 02

Status: Active execution packet  
Scope: Project + File + Audit implementation mapping  
Priority: High  
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`

---

## Objective

Advance the flagship Contractor Command spine from bounded definition into executable implementation targets for the first continuity-critical workspace surfaces:

Project -> File -> Audit -> Guided Auricrux action

This packet stays inside the flagship spine. It does not open broad new lanes. It converts the already-defined route, object, API, and storage contracts into the next repo-ready build sequence.

---

## Verified Starting Point

The repository already contains:

- `FCA_COVERAGE_MATRIX.md`
- `docs/FCA_CONTRACTOR_COMMAND_IMPLEMENTATION_PACKET_01.md`
- `docs/fca-contractor-command-route-map.md`
- `docs/fca-contractor-command-api-map.md`
- `docs/fca-contractor-command-project-context-model.md`
- `docs/fca-contractor-command-file-spine-payload-schema.md`
- `docs/fca-contractor-command-audit-event-payload-schema.md`
- `docs/fca-contractor-command-route-implementation-checklist.md`
- an existing portal shell and API directory on `main`

What repo truth still does **not** prove:

- a callable `Project` persistence path wired through `/api/projects`
- a callable `File` registration / linkage path wired through `/api/files`
- a callable append-only `AuditEvent` path wired through product state transitions
- route-level proof that `/portal/projects`, `/portal/files`, and `/portal/audit` are driven by canonical shared workspace context rather than fragmented local state

---

## Implementation Law

1. No new workflow surface ships without `tenantId`, object identity, lifecycle state, and audit path.
2. Project is the continuity home for downstream file, evidence, estimate, proposal, and operations state.
3. File records must attach to a governed owner object on day one, even if deeper document intelligence is still bounded.
4. Audit records must distinguish user, system, and Auricrux actors.
5. UI may be staged, but route claims must stay truthful.
6. No step in this packet may increase founder routing burden.

---

## Packet 02A — Project persistence slice

### Required backend outputs
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `GET /api/projects/:projectId/context`

### Required object minimum
- `projectId`
- `tenantId`
- `projectNumber`
- `projectName`
- `status`
- `clientId`
- `sourceOpportunityId`
- `sourceBidId`
- `address`
- `createdAt`
- `updatedAt`

### Required behavior
- awarded opportunity or awarded bid can produce a project
- project list is tenant-scoped
- project detail can hydrate canonical workspace context
- project state changes emit audit events

### Acceptance gate
- project creation path is callable
- project identity is stable
- project list and detail use the same canonical model
- project context response includes downstream continuity placeholders for files, audit, and Auricrux next actions

---

## Packet 02B — File spine minimum callable slice

### Required backend outputs
- `GET /api/files`
- `POST /api/files`
- `GET /api/files/:fileId`
- `PATCH /api/files/:fileId`
- `GET /api/files/:fileId/versions`
- `POST /api/files/:fileId/link`
- `POST /api/files/:fileId/briefing`

### Required object minimum
- `fileId`
- `tenantId`
- `ownerObjectType`
- `ownerObjectId`
- `projectId`
- `fileName`
- `fileType`
- `classification`
- `storageKey`
- `version`
- `status`
- `uploadedBy`
- `uploadedAt`

### Required behavior
- file record attaches to project, opportunity, bid, or proposal
- owner linkage is visible in both API output and UI cards
- versions are queryable even if first release is single-version
- briefing endpoint can return bounded placeholder output, but must persist an auditable artifact record

### Acceptance gate
- no orphan file record can be created
- file listing can filter by `projectId` and owner object
- file detail exposes version and linkage truthfully
- document briefing does not pretend full native intelligence exists if not yet implemented

---

## Packet 02C — Audit spine minimum callable slice

### Required backend outputs
- `GET /api/audit-events`
- `POST /api/audit-events`
- `GET /api/audit-events/:auditEventId`
- append-only helper used by project and file mutations

### Required object minimum
- `auditEventId`
- `tenantId`
- `objectType`
- `objectId`
- `actorType`
- `actorId`
- `action`
- `reason`
- `summary`
- `beforeJson`
- `afterJson`
- `createdAt`

### Required behavior
- project create/update emits audit
- file register/classify/link/briefing emits audit
- actor types at minimum: `user`, `system`, `auricrux`
- audit feed can filter by `projectId`, `objectType`, and recent window

### Acceptance gate
- append-only rules are enforced in write path
- audit list is queryable by active project
- audit payload exposes reason and actor clearly enough for customer-visible timeline use
- Auricrux-generated actions are distinguishable without inventing capabilities

---

## Packet 02D — Route implementation sequence

### Route 1: `/portal/projects`
Ship first because it establishes canonical project selection.

Required UI outcomes:
- tenant-scoped project list
- active project selection
- lifecycle status display
- continuity alert summary
- handoff into project detail, files, and audit

Route completion standard:
- writes canonical active project context
- does not keep contradictory route-local project truth
- remains usable with partial downstream implementations

### Route 2: `/portal/projects/:projectId`
Ship second because it becomes the continuity home.

Required UI outcomes:
- project header and status
- upstream linkage to opportunity/bid/client
- file summary block
- audit summary block
- guided Auricrux next step block

Route completion standard:
- route param rebinds canonical project context
- missing project fails safely
- summary blocks reflect real API readiness, not shell theater

### Route 3: `/portal/files`
Ship third because file intake is a core spine requirement.

Required UI outcomes:
- project-aware or tenant-wide file list
- owner object linkage visibility
- status / classification / version visibility
- upload entry point and document briefing state

Route completion standard:
- active project filters correctly when present
- owner linkage is visible on every card row
- no fake “AI analyzed” copy appears without a stored briefing artifact

### Route 4: `/portal/audit`
Ship fourth because it proves continuity and founder-hands-off observability.

Required UI outcomes:
- project-aware audit timeline
- actor type, action, reason, time
- recent Auricrux actions
- recent corrections / state transitions

Route completion standard:
- route remains useful under bounded placeholder data
- actor types are visually distinguishable
- history reads like customer-facing product truth, not internal logs

---

## Shared State Contract

The following state must be treated as canonical and not re-invented route by route:

- `activeTenantId`
- `activeUserId`
- `activeProjectId`
- `activeOpportunityId`
- `activeFileContextId`
- `activeWorkspaceMode`

Failure condition:
any route that mutates or displays these values using contradictory local truth fails this packet.

---

## Storage Mapping Minimum

### Projects store
Required fields:
- partition key by tenant
- stable project identity
- source object linkage
- lifecycle status
- timestamps

### Files store
Required fields:
- tenant partitioning
- owner object linkage
- project linkage where applicable
- storage key / blob key
- classification / version / status

### Audit store
Required fields:
- tenant partitioning
- object linkage
- actor linkage
- append-only event data
- before/after snapshots where applicable

No storage implementation in this packet may break later expansion into drawing sets, RFIs, change events, QC, closeout, or Academy-linked training actions.

---

## Validation Matrix

### Build validation
- routes compile
- no missing imports from new shared modules
- no dead navigation into unimplemented route families

### Product validation
- project can be selected and revisited
- file can be listed with owner linkage
- audit timeline can render recent object events
- product surfaces use customer-facing construction language

### Continuity validation
- tenant scoping enforced
- active project context survives route movement
- project/file/audit surfaces reconcile to same object identity
- Auricrux action surfaces point to governed targets only

### Truth validation
- no route claims “live upload” without stored file metadata
- no route claims “analysis complete” without briefing or audit artifact
- no route claims autonomous execution without visible evidence trail

---

## Explicit Non-Goals

Not in Packet 02:
- full takeoff engine
- full plan viewer
- full RFI / change order module
- full Academy credential execution
- deep accounting integrations

Those remain downstream extensions of the same project/file/audit spine.

---

## Execution Order

1. canonical project model + project endpoints
2. append-only audit helper
3. file metadata model + file endpoints
4. project workspace composite read
5. `/portal/projects`
6. `/portal/projects/:projectId`
7. `/portal/files`
8. `/portal/audit`
9. bounded route and state validation pass

---

## Completion Standard

Packet 02 is complete only when repo truth shows:

- callable project, file, and audit endpoint families
- canonical project context across the first continuity routes
- customer-visible route utility on `/portal/projects`, `/portal/files`, and `/portal/audit`
- audit-backed product state rather than shell-only narrative

---

## Next Packet After 02

`FCA_CONTRACTOR_COMMAND_IMPLEMENTATION_PACKET_03.md`

Target:
- evidence linkage model
- proposal package artifact contract
- project file briefing outputs
- route-ready expansion into drawing sets, takeoff seeds, and customer-visible proposal history
