# FCA_PACKET_052O_DIRECT_RUNTIME_FILE_PUSH_PACKET

Status: Active
Classification: Binding direct-runtime-push packet
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `052O`
Next Packet: `052P`
Target Packet: `060A`

---

## Issue

`052N` fixed the runtime file apply execution plan.
`052O` now defines the exact direct repository push set for the first-wave runtime files so packet continuity can transition from apply-planning into explicit repo-write execution scope.

---

## Truth Boundary

This packet authorizes and structures the first direct runtime file push wave.

It does **not** claim:
- the runtime files below are already present in `main`
- CI/build has already passed after push
- persistence wiring, auth wiring, or UI wiring is complete
- live deployment has exposed the new routes

It **does** define the exact runtime files to push, their grouping, and the post-push validation gates.

---

## Direct Push Scope

### Push Group A â€” Shared contract files
Push these files directly into repo runtime paths:
- `src/lib/contracts/fcaEnums.ts`
- `src/types/fca-contracts.ts`
- `src/lib/api/fcaApiTypes.ts`
- `api/_lib/contracts/fcaEnums.js`
- `api/_lib/contracts/fcaContracts.js`

### Push Group B â€” Validation files
Push these files directly into repo runtime paths:
- `src/lib/contracts/fcaSchemas.ts`
- `api/_lib/validation/fcaSchemas.js`
- `api/_lib/validation/assertValid.js`

### Push Group C â€” First route files
Push these files directly into repo runtime paths:
- `api/projects/index.js`
- `api/projects/[projectId].js`
- `api/projects/[projectId]/takeoffs/index.js`
- `api/projects/[projectId]/rfis/index.js`
- `api/auricrux/actions/index.js`

---

## Canonical Source Binding

### Group A source
Use exact code from:
- `docs/FCA_PACKET_052J_EXACT_FILE_CONTENT_PACKET.md`

### Group B source
Use exact code from:
- `docs/FCA_PACKET_052J_EXACT_FILE_CONTENT_PACKET.md`

### Group C source
Use exact code from:
- `docs/FCA_PACKET_052K_FIRST_ROUTE_STUB_PACKET.md`

No alternate runtime source is authorized for first-wave direct push.

---

## Direct Push Order

### Step 1
Push Group A.

### Step 2
Run:
```bash
npm install
npm run lint
npm run build
```

### Step 3
Push Group B.

### Step 4
Run:
```bash
npm run lint
npm run build
```

### Step 5
Push Group C.

### Step 6
Run:
```bash
npm run lint
npm run build
```

### Step 7
Run route smoke checks defined in Packet `052N`.

---

## Direct Push Commit Plan

### Commit 1
`Push FCA shared contract runtime files`

### Commit 2
`Push FCA validation runtime files`

### Commit 3
`Push FCA first route runtime files`

If batching must be compressed:
- Commit 1 + 2 allowed
- Commit 2 + 3 allowed only after import validation
- All three combined in a single push is discouraged for first-wave non-regression control

---

## Post-Push Validation Gates

### Contract gate
- shared enum imports resolve
- shared contract imports resolve
- no duplicate contract layer created elsewhere

### Validation gate
- zod-backed schemas import successfully
- invalid payloads produce validation failure shape

### Route gate
- `GET /api/projects` returns 200 envelope
- invalid `POST /api/projects` returns 400
- invalid `POST /api/projects/{projectId}/takeoffs` returns 400
- invalid `POST /api/projects/{projectId}/rfis` returns 400
- invalid `POST /api/auricrux/actions` returns 400

### Non-regression gate
- existing bid tracker build still passes
- existing public shell/build config unchanged
- existing workflow files unchanged

---

## Failure Handling Rule

If any push group fails validation:
1. stop further push groups
2. save failure artifact in `docs/`
3. classify failure as import / dependency / route / build / regression
4. next packet becomes remediation-focused rather than pretending forward completion

---

## Acceptance Criteria

`052O` is complete only if:
- exact direct push groups are fixed
- source bindings are fixed
- direct push order is fixed
- commit plan is fixed
- post-push validation gates are fixed
- failure handling rule is fixed
- no ambiguity remains about first-wave runtime push scope

---

## Next Packet

`052P = First Runtime Push Execution Record Packet`

Must deliver:
- runtime repo push result record
- commit hash(es) if push occurs
- exact files actually added
- explicit separation between planned push and verified push
- updated blocker state

---

## Progress Lock

- Current packet: `052O`
- Next packet: `052P`
- Target packet: `060A`
- Save-after-every-prompt rule remains active
