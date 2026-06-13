# FCA_PACKET_052N_RUNTIME_FILE_APPLY_EXECUTION_PACKET

Status: Active
Classification: Binding runtime-file apply execution packet
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `052N`
Next Packet: `052O`
Target Packet: `060A`

---

## Issue

`052M` defined the first-wave applied-code commit packet.
`052N` now locks the exact runtime file apply execution set for the first shared-contract, validation, and route-stub wave.

---

## Truth Boundary

This packet is the direct runtime-file apply execution artifact.

It does **not** claim:
- these files are already applied in runtime locations
- CI/build has already passed after application
- persistence, auth, or UI wiring is complete
- live deployment exposes the new route wave

It **does** define the exact runtime files to create now, their exact paths, and the exact batch structure for direct application into the repository.

---

## Apply Wave Summary

### Batch A — Shared contract layer
Create:
- `src/lib/contracts/fcaEnums.ts`
- `src/types/fca-contracts.ts`
- `src/lib/api/fcaApiTypes.ts`
- `api/_lib/contracts/fcaEnums.js`
- `api/_lib/contracts/fcaContracts.js`

### Batch B — Validation layer
Create:
- `src/lib/contracts/fcaSchemas.ts`
- `api/_lib/validation/fcaSchemas.js`
- `api/_lib/validation/assertValid.js`

### Batch C — First route wave
Create:
- `api/projects/index.js`
- `api/projects/[projectId].js`
- `api/projects/[projectId]/takeoffs/index.js`
- `api/projects/[projectId]/rfis/index.js`
- `api/auricrux/actions/index.js`

---

## 1. Runtime File Apply Map

### 1.1 Frontend / shared contract files
| Path | Action |
|---|---|
| `src/lib/contracts/fcaEnums.ts` | create |
| `src/types/fca-contracts.ts` | create |
| `src/lib/api/fcaApiTypes.ts` | create |
| `src/lib/contracts/fcaSchemas.ts` | create |

### 1.2 Backend contract / validation files
| Path | Action |
|---|---|
| `api/_lib/contracts/fcaEnums.js` | create |
| `api/_lib/contracts/fcaContracts.js` | create |
| `api/_lib/validation/fcaSchemas.js` | create |
| `api/_lib/validation/assertValid.js` | create |

### 1.3 First route files
| Path | Action |
|---|---|
| `api/projects/index.js` | create |
| `api/projects/[projectId].js` | create |
| `api/projects/[projectId]/takeoffs/index.js` | create |
| `api/projects/[projectId]/rfis/index.js` | create |
| `api/auricrux/actions/index.js` | create |

---

## 2. Canonical Content Source Binding

### Batch A source
Use the exact file contents defined in:
- `docs/FCA_PACKET_052J_EXACT_FILE_CONTENT_PACKET.md`

### Batch B source
Use the exact file contents defined in:
- `docs/FCA_PACKET_052J_EXACT_FILE_CONTENT_PACKET.md`

### Batch C source
Use the exact file contents defined in:
- `docs/FCA_PACKET_052K_FIRST_ROUTE_STUB_PACKET.md`

No alternate text source is authorized for this apply wave.

---

## 3. Directory Creation Order

Create missing directories in this exact order:

1. `src/lib/contracts/`
2. `src/lib/api/`
3. `api/_lib/contracts/`
4. `api/_lib/validation/`
5. `api/projects/`
6. `api/projects/[projectId]/`
7. `api/projects/[projectId]/takeoffs/`
8. `api/projects/[projectId]/rfis/`
9. `api/auricrux/`
10. `api/auricrux/actions/`

No alternate or duplicate folder names allowed.

---

## 4. Execution Order

### Step 1
Apply Batch A files.

### Step 2
Run validation gate:
```bash
npm install
npm run lint
npm run build
```

### Step 3
Apply Batch B files.

### Step 4
Run validation gate:
```bash
npm run lint
npm run build
```

### Step 5
Apply Batch C files.

### Step 6
Run validation gate:
```bash
npm run lint
npm run build
```

### Step 7
Run route smoke checks.

### Step 8
If all pass, continue to next packet for controlled UI and persistence extension.

---

## 5. Runtime Apply Guardrails

Do **not** in this packet:
- modify existing bid tracker UI wiring
- alter current public route surfaces
- change static web app config
- change GitHub workflow files
- add persistence or database assumptions into stubs
- add alternate envelope helpers or schema duplicates

This packet is a **safe additive runtime wave** only.

---

## 6. Smoke Check Matrix

### `/api/projects`
- `GET` must return 200 envelope
- `POST` invalid payload must return 400
- `POST` valid payload must return 202 stub envelope

### `/api/projects/{projectId}`
- missing `projectId` must return 400
- `GET` must return 200 envelope
- `PATCH` must return 202 stub envelope

### `/api/projects/{projectId}/takeoffs`
- missing `projectId` must return 400
- invalid payload must return 400
- valid payload must return 202

### `/api/projects/{projectId}/rfis`
- missing `projectId` must return 400
- invalid payload must return 400
- valid payload must return 202

### `/api/auricrux/actions`
- invalid payload must return 400
- valid payload must return 202

---

## 7. Commit Structure for Apply Execution

### Commit A
`Apply FCA shared contract runtime files`

### Commit B
`Apply FCA validation runtime files`

### Commit C
`Apply FCA first project spine route runtime files`

If batching must be compressed, only combine adjacent safe layers:
- A + B allowed
- B + C allowed only if validation imports were already proven locally
- A + B + C in one blast is discouraged

---

## 8. Stop Conditions

Stop execution immediately and record failure artifact if any of the following occur:
- unresolved import path
- zod dependency/import failure
- lint failure introduced by new files
- build failure introduced by new files
- route collision with existing repo behavior
- unintended change outside packet-approved file list

If stopped, next packet must become a remediation packet rather than pretending forward completion.

---

## 9. Runtime Apply Success Definition

`052N` runtime apply is successful only if:
- all Batch A files exist in repo
- all Batch B files exist in repo
- all Batch C files exist in repo
- installs/lint/build pass after each safe wave
- route smoke checks pass at stub level
- no existing bid tracker surface regresses

---

## 10. Acceptance Criteria

`052N` is complete only if:
- exact runtime file apply map is fixed
- canonical content sources are fixed
- directory creation order is fixed
- execution order is fixed
- guardrails are fixed
- smoke checks are fixed
- commit structure is fixed
- stop conditions are fixed

---

## 11. Next Packet

`052O = Direct Runtime File Push Packet`

Must deliver:
- actual repository runtime file creation in the approved paths
- commit hash proving first runtime wave application
- updated truth boundary distinguishing packeted apply plan from applied repo state

---

## Progress Lock

- Current packet: `052N`
- Next packet: `052O`
- Target packet: `060A`
- Save-after-every-prompt rule remains active
