# FCA_PACKET_052S_DIRECT_RUNTIME_FILE_CREATION_EXECUTION_PACKET

Status: Active
Classification: Binding direct-runtime-file-creation execution packet
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `052S`
Next Packet: `052T`
Target Packet: `060A`

---

## Issue

`052R` recorded the runtime-file creation execution boundary.
`052S` must now define the exact direct runtime-file creation execution step so the sequence moves toward actual runtime insertion rather than remaining only in packet planning.

---

## Truth Boundary

This packet defines the next direct runtime-file creation execution step.

It does **not** claim:
- the first-wave runtime files are already present in repo
- build/lint has already passed after runtime insertion
- route stubs are live
- persistence, auth, or UI wiring is complete

It **does** lock the exact runtime creation execution scope and forces the next step toward actual file creation or explicit blocker capture.

---

## Direct Runtime Creation Scope

### Wave A â€” Shared contract files
Create directly in runtime tree:
- `src/lib/contracts/fcaEnums.ts`
- `src/types/fca-contracts.ts`
- `src/lib/api/fcaApiTypes.ts`
- `api/_lib/contracts/fcaEnums.js`
- `api/_lib/contracts/fcaContracts.js`

### Wave B â€” Validation files
Create directly in runtime tree:
- `src/lib/contracts/fcaSchemas.ts`
- `api/_lib/validation/fcaSchemas.js`
- `api/_lib/validation/assertValid.js`

### Wave C â€” First route files
Create directly in runtime tree:
- `api/projects/index.js`
- `api/projects/[projectId].js`
- `api/projects/[projectId]/takeoffs/index.js`
- `api/projects/[projectId]/rfis/index.js`
- `api/auricrux/actions/index.js`

---

## Canonical Runtime Content Sources

### Wave A + B
Use exact code from:
- `docs/FCA_PACKET_052J_EXACT_FILE_CONTENT_PACKET.md`

### Wave C
Use exact code from:
- `docs/FCA_PACKET_052K_FIRST_ROUTE_STUB_PACKET.md`

No alternate runtime code source is authorized for first-wave creation.

---

## Execution Order

1. create missing directories
2. create Wave A files
3. run install/lint/build
4. create Wave B files
5. run lint/build
6. create Wave C files
7. run lint/build
8. run stub-route smoke checks
9. record exact runtime-file presence or failure artifact

---

## Directory Creation Order

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

---

## Validation Gates

### Gate 1 â€” contract layer
```bash
npm install
npm run lint
npm run build
```

### Gate 2 â€” validation layer
```bash
npm run lint
npm run build
```

### Gate 3 â€” route layer
```bash
npm run lint
npm run build
```

### Stub smoke checks
- `GET /api/projects`
- `POST /api/projects` invalid payload rejection
- `GET /api/projects/{projectId}`
- `POST /api/projects/{projectId}/takeoffs` invalid payload rejection
- `POST /api/projects/{projectId}/rfis` invalid payload rejection
- `POST /api/auricrux/actions` invalid payload rejection

---

## Guardrails

Do **not** during this execution wave:
- alter existing bid-tracker runtime files outside approved first-wave paths
- change UI routing or navigation
- change deployment workflow/config files
- add persistence assumptions into route stubs
- introduce duplicate contracts or helper layers
- imply runtime completion before file presence is repo-proven

---

## Failure Rule

If any of the following occurs, stop and record a blocker artifact:
- path collision requiring merge instead of create
- unresolved import path
- zod/runtime dependency failure
- lint failure introduced by new files
- build failure introduced by new files
- unintended regression in existing bid-tracker surfaces

The next packet must then become remediation-first.

---

## Success Definition

`052S` is successful only if the execution scope is fixed so the next packet can either:
1. directly create the approved runtime files, or
2. truthfully emit a hard blocker/remediation artifact.

No additional planning-only drift is preferred.

---

## Acceptance Criteria

`052S` is complete only if:
- direct runtime creation scope is fixed
- canonical content sources are fixed
- execution order is fixed
- directory order is fixed
- validation gates are fixed
- guardrails are fixed
- failure rule is fixed

---

## Next Packet

`052T = Runtime File Presence Verification Packet`

Must deliver:
- exact verification record of whether first-wave runtime files now exist in repo
- explicit file-presence truth
- commit hash(es) if files were created
- blocker artifact if they were not

---

## Progress Lock

- Current packet: `052S`
- Next packet: `052T`
- Target packet: `060A`
- Save-after-every-prompt rule remains active
