# FCA_PACKET_052M_APPLIED_CODE_COMMIT_PACKET

Status: Active
Classification: Binding applied-code commit packet
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `052M`
Next Packet: `052N`
Target Packet: `060A`

---

## Issue

`052L` fixed the route-apply patch boundaries.
`052M` must now define the exact first-wave runtime code application set in commit-batch form so the repo can move from packet-only continuity into applied implementation.

---

## Truth Boundary

This packet is a repo-apply execution packet.

It does **not** claim:
- the runtime files below are already applied in `main`
- CI has already passed on the first-wave code set
- persistence or tenant auth wiring is complete
- the live product exposes the new project-spine routes yet

It **does** define the exact grouped runtime code application set for the first implementation wave.

---

## Commit Batch A â€” Shared Contract Layer

### Files to apply
- `src/lib/contracts/fcaEnums.ts`
- `src/types/fca-contracts.ts`
- `src/lib/api/fcaApiTypes.ts`
- `api/_lib/contracts/fcaEnums.js`
- `api/_lib/contracts/fcaContracts.js`

### Purpose
Create one canonical contract language across frontend and backend before adding route logic.

### Commit message
`Add FCA shared contract layer for project spine`

### Validation gate
- imports resolve
- no duplicate enum definitions elsewhere
- build still loads base frontend and backend entry points

---

## Commit Batch B â€” Validation Layer

### Files to apply
- `src/lib/contracts/fcaSchemas.ts`
- `api/_lib/validation/fcaSchemas.js`
- `api/_lib/validation/assertValid.js`

### Purpose
Establish one canonical payload-validation layer before route insertion.

### Commit message
`Add FCA shared validation layer for project spine`

### Validation gate
- schema imports resolve
- zod dependency path remains valid
- invalid payloads can be rejected consistently by helper contract

---

## Commit Batch C â€” First Route Wave

### Files to apply
- `api/projects/index.js`
- `api/projects/[projectId].js`
- `api/projects/[projectId]/takeoffs/index.js`
- `api/projects/[projectId]/rfis/index.js`
- `api/auricrux/actions/index.js`

### Purpose
Create the first canonical project-spine route surfaces using the shared contract and validation layer.

### Commit message
`Add FCA first project spine route stubs`

### Validation gate
- route imports resolve
- method guards respond correctly
- invalid POST payloads return 400
- structured envelopes return for GET/POST stubs

---

## Commit Batch D â€” Verification and Guard Docs

### Files to apply/update
- `docs/fca-contractor-command-route-implementation-checklist.md`
- `docs/fca-contractor-command-route-acceptance-enforcement.md`
- `docs/FCA_EXECUTION_CONTINUITY_LEDGER.md`

### Purpose
Bind the code wave to explicit non-regression and acceptance checks.

### Commit message
`Add FCA route-wave verification artifacts`

---

## Exact Runtime Code Set Reference

### Batch A content source
Use exact file contents from:
- `docs/FCA_PACKET_052J_EXACT_FILE_CONTENT_PACKET.md`

### Batch B content source
Use exact file contents from:
- `docs/FCA_PACKET_052J_EXACT_FILE_CONTENT_PACKET.md`

### Batch C content source
Use exact file contents from:
- `docs/FCA_PACKET_052K_FIRST_ROUTE_STUB_PACKET.md`

No alternate source packet is authorized for first-wave application.

---

## Apply Method

### Safe order
1. create missing directories
2. apply Batch A files
3. run install/lint/build
4. apply Batch B files
5. run install/lint/build
6. apply Batch C files
7. run install/lint/build
8. run route smoke checks
9. apply Batch D verification artifacts

### Stop conditions
Stop the wave if any of the following occur:
- import path failure
- missing zod/runtime dependency issue
- build failure in existing bid surfaces
- route path collision with current live endpoints
- static web app build regression

If stopped, record exact failure artifact before any additional change.

---

## Route Smoke Check Matrix

### `/api/projects`
- `GET` returns `200`
- `POST` invalid payload returns `400`
- `POST` valid payload returns `202` stub envelope

### `/api/projects/{projectId}`
- missing `projectId` returns `400`
- `GET` returns `200`
- `PATCH` returns `202` stub envelope

### `/api/projects/{projectId}/takeoffs`
- missing `projectId` returns `400`
- invalid payload returns `400`
- valid payload returns `202`

### `/api/projects/{projectId}/rfis`
- missing `projectId` returns `400`
- invalid payload returns `400`
- valid payload returns `202`

### `/api/auricrux/actions`
- invalid payload returns `400`
- valid payload returns `202`

---

## Non-Regression Boundaries

Do **not** in this wave:
- modify existing bid-tracker runtime behavior
- touch static web app config
- touch deployment workflow files
- wire new routes into visible UI navigation
- add persistence assumptions into route stubs
- introduce alternate envelope helpers

This is a **safe additive wave** only.

---

## Required Commands

```bash
npm install
npm run lint
npm run build
```

If script names differ, equivalent gates remain mandatory:
- dependency install success
- lint-equivalent success
- build-equivalent success
- manual route import resolution success

---

## Applied-Code Success Definition

`052M` first-wave application is successful only if:
- Batch A files are present and importable
- Batch B files are present and importable
- Batch C files are present and importable
- lint passes
- build passes
- route smoke checks pass at stub level
- no existing bid flow regression is introduced

---

## Next Packet

`052N = Runtime File Apply Execution Packet`

Must deliver:
- direct repo-write application of the first-wave runtime files
- commit hashes for each applied batch or merged combined batch
- exact runtime file paths saved in repo
- updated truth boundary after code application

---

## Progress Lock

- Current packet: `052M`
- Next packet: `052N`
- Target packet: `060A`
- Save-after-every-prompt rule remains active
