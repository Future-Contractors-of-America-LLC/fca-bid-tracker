# FCA_PACKET_052I_REPO_FILE_SKELETON_AND_APPLY_ORDER

Status: Active
Classification: Binding implementation packet
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `052I`
Next Packet: `052J`
Target Packet: `060A`

---

## Issue

`052H` fixed the shared schema and payload contract.
`052I` must now translate that contract into exact repo file targets, apply order, non-regression rules, and validation commands so implementation can begin without drift.

---

## Truth Boundary

This packet defines the repo-safe skeleton and application order.

It does **not** claim:
- these files already exist in final form
- all routes are currently wired
- live deploy has passed
- frontend and backend are already consuming one canonical contract source

It **does** define the exact file set and implementation order for the next code application sequence.

---

## 1. Canonical File Map

### 1.1 Shared frontend contract files
- `src/types/fca-contracts.ts`
- `src/lib/contracts/fcaEnums.ts`
- `src/lib/contracts/fcaSchemas.ts`
- `src/lib/api/fcaApiTypes.ts`

### 1.2 Backend/shared API contract files
- `api/_lib/contracts/fcaContracts.js`
- `api/_lib/contracts/fcaEnums.js`
- `api/_lib/validation/fcaSchemas.js`
- `api/_lib/validation/assertValid.js`

### 1.3 Route starter files
- `api/projects/index.js`
- `api/projects/[projectId].js`
- `api/projects/[projectId]/files/index.js`
- `api/projects/[projectId]/drawing-sets/index.js`
- `api/projects/[projectId]/sheets/index.js`
- `api/projects/[projectId]/takeoffs/index.js`
- `api/projects/[projectId]/rfis/index.js`
- `api/projects/[projectId]/change-events/index.js`
- `api/projects/[projectId]/change-orders/index.js`
- `api/projects/[projectId]/qc-items/index.js`
- `api/projects/[projectId]/remediation-links/index.js`
- `api/auricrux/actions/index.js`
- `api/audit-events/index.js`
- `api/feature-gates/evaluate.js`

### 1.4 Frontend starter surfaces
- `src/pages/projects/ProjectWorkspacePage.jsx`
- `src/components/projects/ProjectWorkspaceTabs.jsx`
- `src/components/files/ProjectFilesPanel.jsx`
- `src/components/drawings/DrawingSetsPanel.jsx`
- `src/components/takeoff/TakeoffPanel.jsx`
- `src/components/rfi/RFIListPanel.jsx`
- `src/components/changes/ChangeEventsPanel.jsx`
- `src/components/qc/QCItemsPanel.jsx`
- `src/components/academy/ProjectRemediationPanel.jsx`
- `src/components/auricrux/AuricruxDock.jsx`

### 1.5 Documentation and enforcement files
- `docs/fca-contractor-command-schema-implementation-checklist.md`
- `docs/fca-contractor-command-route-validation-checklist.md`
- `docs/fca-contractor-command-ui-surface-acceptance.md`

---

## 2. Apply Order

### Step 1 — enums first
Create:
- `src/lib/contracts/fcaEnums.ts`
- `api/_lib/contracts/fcaEnums.js`

Reason:
All schema, UI, and route validation depends on stable enum values.

### Step 2 — core types/contracts
Create:
- `src/types/fca-contracts.ts`
- `api/_lib/contracts/fcaContracts.js`
- `src/lib/api/fcaApiTypes.ts`

Reason:
This fixes object naming and request/response shape before route wiring.

### Step 3 — validation layer
Create:
- `src/lib/contracts/fcaSchemas.ts`
- `api/_lib/validation/fcaSchemas.js`
- `api/_lib/validation/assertValid.js`

Reason:
No route should accept payloads before contract validation exists.

### Step 4 — route helpers and minimal route stubs
Create route files listed in section 1.3 with:
- method guard
- tenant/project param extraction
- payload validation call
- placeholder structured response
- audit/Auricrux TODO surface marker

Reason:
This creates deterministic implementation surfaces without pretending the business logic is complete.

### Step 5 — workspace shell entry points
Create/update:
- `src/pages/projects/ProjectWorkspacePage.jsx`
- `src/components/projects/ProjectWorkspaceTabs.jsx`
- `src/components/auricrux/AuricruxDock.jsx`

Reason:
UI must expose the shared project spine before module-specific panels.

### Step 6 — module panels
Create/update:
- files
- drawings
- takeoff
- RFI
- change
- QC
- Academy remediation panels

Reason:
Panels must consume the canonical project context and types defined in earlier steps.

### Step 7 — documentation and acceptance checklists
Create/update docs listed in section 1.5.

Reason:
Prevents silent drift during later packet application.

---

## 3. Minimum Skeleton Content Rules

Every new code file must:
- import only what it uses
- export deterministic names matching packet contracts
- avoid placeholder lorem text
- avoid fake completion comments like `done` or `fully working`
- clearly distinguish stub behavior from live implementation

Every route file must include:
- accepted HTTP methods
- input validation invocation
- canonical `ApiSuccess` / `ApiError` response shape
- no direct browser-local-state assumptions

Every UI panel file must include:
- explicit props or context contract
- empty-state rendering
- loading-state rendering
- error-state rendering
- no standalone mock data as truth source

---

## 4. Non-Regression Rules

Do **not**:
- rename existing stable bid/tracker surfaces without explicit mapping
- break current routes while adding project-spine routes
- create duplicate contract files under alternate names
- create separate Academy-only schema files for shared objects
- create parallel object names that differ from 052H canonical names

Must preserve:
- current bid-tracker continuity
- current docs packet chain
- shared shell direction
- single product rule

---

## 5. Route Stub Requirements

Every route stub must follow this minimum structure:
1. import validator + contract helpers
2. reject unsupported methods
3. parse path parameters
4. validate body/query
5. return structured response envelope
6. emit explicit `notYetImplemented` field where live logic is absent

Example response shape:

```json
{
  "ok": true,
  "data": {
    "route": "projects/:projectId/takeoffs",
    "notYetImplemented": true
  },
  "meta": {
    "packet": "052I"
  }
}
```

This is allowed only in route stubs, not final acceptance.

---

## 6. Frontend Wiring Rules

### 6.1 Project workspace page
Must own:
- `projectId` extraction
- shared tab state
- panel switching
- shared Auricrux dock presence

### 6.2 Tabs contract
Required tabs:
- Overview
- Files
- Drawings
- Takeoff
- RFIs
- Changes
- Quality
- Academy
- Audit

### 6.3 Auricrux dock
Must expose:
- Explain
- Recommend
- Execute
- Teach

Dock must remain visible regardless of selected tab.

---

## 7. Validation Commands

Run after file application:

```bash
npm install
npm run lint
npm run build
```

If repo scripts differ, minimum required validation is:
- static type or schema import integrity check
- lint pass
- production build pass

Route-level smoke checks required next packet:
- projects route import loads
- files route import loads
- takeoff route import loads
- RFI route import loads
- feature-gate route import loads

---

## 8. Commit Sequencing Plan

### Commit A
`Add FCA shared enums and contract skeletons`

### Commit B
`Add FCA validation schemas and assert helpers`

### Commit C
`Add project-spine route stubs for Contractor Command`

### Commit D
`Add project workspace shell and module panel skeletons`

### Commit E
`Add schema implementation checklists and acceptance docs`

If batching is required, combine only adjacent phases.
Do not mix route stubs and panel skeletons into one unreviewable dump unless tooling constraints force it.

---

## 9. Acceptance Criteria

`052I` is complete only if:
- exact file map is fixed
- apply order is fixed
- non-regression rules are fixed
- validation commands are fixed
- commit sequence is fixed
- route stub contract is fixed
- UI shell contract is fixed
- no ambiguous file naming remains

---

## 10. Next Packet

`052J = Exact File Content Packet`

Must deliver:
- full contents for enum files
- full contents for shared contract files
- full contents for validation files
- full contents for first route stubs
- no partial snippets

---

## Progress Lock

- Current packet: `052I`
- Next packet: `052J`
- Target packet: `060A`
- Save-after-every-prompt rule remains active
