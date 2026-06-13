# FCA_PACKET_052U_RUNTIME_FILE_CREATION_OR_BLOCKER_PACKET

Status: Active
Classification: Binding runtime-file-creation-or-blocker packet
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `052U`
Next Packet: `052V`
Target Packet: `060A`

---

## Issue

`052T` verified that first-wave runtime files are still not repo-proven present.
`052U` must now force a binary path:
1. direct runtime file creation, or
2. explicit blocker capture.

No ambiguous planning-only middle state remains acceptable.

---

## Truth Boundary

This packet is a forced-execution gate.

It does **not** claim:
- the first-wave runtime files have already been created
- build/lint has passed on those files
- route stubs are live
- persistence, auth, or UI wiring is complete

It **does** define the exact files that must now either be created directly or elevated into a blocker artifact with named cause.

---

## Required Direct Creation Set

### Contract layer
- `src/lib/contracts/fcaEnums.ts`
- `src/types/fca-contracts.ts`
- `src/lib/api/fcaApiTypes.ts`
- `api/_lib/contracts/fcaEnums.js`
- `api/_lib/contracts/fcaContracts.js`

### Validation layer
- `src/lib/contracts/fcaSchemas.ts`
- `api/_lib/validation/fcaSchemas.js`
- `api/_lib/validation/assertValid.js`

### First route layer
- `api/projects/index.js`
- `api/projects/[projectId].js`
- `api/projects/[projectId]/takeoffs/index.js`
- `api/projects/[projectId]/rfis/index.js`
- `api/auricrux/actions/index.js`

---

## Allowed Outcomes

### Outcome A — runtime files created
This is the default and preferred path.

Requirements:
- files exist at exact approved paths
- file content comes only from approved packet sources
- file creation is committed in repo
- next packet records exact file presence and commit truth

### Outcome B — blocker artifact created
Allowed only if a real blocker prevents safe file creation.

Accepted blocker classes:
- path collision with existing runtime file needing merge, not create
- repo-standard incompatibility requiring verified adaptation
- import/runtime format uncertainty that would likely break build if applied blindly
- tool limitation preventing safe creation in this run

If blocker path is taken, the next packet must include:
- exact blocked file list
- blocker class
- required remediation action
- proof that direct creation was not safely executable

---

## Canonical Source Binding

### Contract + validation files
Source only from:
- `docs/FCA_PACKET_052J_EXACT_FILE_CONTENT_PACKET.md`

### Route files
Source only from:
- `docs/FCA_PACKET_052K_FIRST_ROUTE_STUB_PACKET.md`

No alternate content source is authorized.

---

## Direct Creation Rule

If no verified blocker exists, Auricrux must prefer direct file creation over additional planning.

The burden of proof is on any claimed blocker.
No vague blocker language is allowed.

---

## Blocker Reporting Rule

Any blocker packet following this one must include:
- `blockedFiles`
- `blockerType`
- `whyUnsafeNow`
- `exactNextRemediation`
- `whetherAnySafeSubsetCanStillProceed`

---

## Validation Gates After Creation

```bash
npm install
npm run lint
npm run build
```

Stub smoke checks required after route creation:
- `GET /api/projects`
- invalid `POST /api/projects`
- `GET /api/projects/{projectId}`
- invalid `POST /api/projects/{projectId}/takeoffs`
- invalid `POST /api/projects/{projectId}/rfis`
- invalid `POST /api/auricrux/actions`

---

## Non-Regression Guardrails

Do **not** during this wave:
- modify existing bid-tracker runtime files outside approved paths
- change deployment workflows
- alter static web app config
- wire UI navigation to the new routes yet
- add persistence assumptions into stubs
- create duplicate contract/helper layers

---

## Success Definition

`052U` is successful only if it leaves exactly two lawful next states:
- direct runtime file creation execution, or
- explicit blocker/remediation capture

No more packet-only drift without one of those outcomes.

---

## Acceptance Criteria

`052U` is complete only if:
- required direct creation set is fixed
- allowed outcomes are fixed
- canonical source bindings are fixed
- direct-creation preference rule is fixed
- blocker reporting rule is fixed
- validation gates are fixed
- non-regression guardrails are fixed

---

## Next Packet

`052V = Direct Runtime Creation Execution Or Hard Blocker Record`

Must deliver one of:
- repo-proven runtime file creation, or
- a hard blocker artifact with exact blocked files and remediation path

---

## Progress Lock

- Current packet: `052U`
- Next packet: `052V`
- Target packet: `060A`
- Save-after-every-prompt rule remains active
