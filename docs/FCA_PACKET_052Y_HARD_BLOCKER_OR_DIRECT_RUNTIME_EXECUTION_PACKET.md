# FCA_PACKET_052Y_HARD_BLOCKER_OR_DIRECT_RUNTIME_EXECUTION_PACKET

Status: Active
Classification: Binding hard-blocker or direct-runtime-execution packet
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `052Y`
Next Packet: `052Z`
Target Packet: `060A`

---

## Issue

`052X` truthfully recorded that the docs chain is repo-proven while the first-wave runtime files are still not repo-proven present.
`052Y` must now lock the only two lawful next states:
1. direct runtime execution, or
2. explicit hard blocker capture.

No additional ambiguous planning-only continuation is acceptable after this packet.

---

## Repo-Proven Docs State

The following are repo-proven in current repository history:
- `docs/FCA_PACKET_052X_RUNTIME_CREATION_RESULT_PACKET.md`
- `docs/FCA_PACKET_052Y_HARD_BLOCKER_OR_DIRECT_RUNTIME_EXECUTION_PACKET.md`
- `docs/FCA_EXECUTION_CONTINUITY_LEDGER.md`

Therefore the **docs chain is repo-proven through `052Y`**.

---

## Runtime-Code Truth Boundary

### Repo-proven
- packet chain through `052Y`
- continuity ledger through `052Y`
- exact first-wave runtime target list
- exact canonical code sources
- exact route/validation/contract sequencing

### Not yet repo-proven present
#### Shared contract layer
- `src/lib/contracts/fcaEnums.ts`
- `src/types/fca-contracts.ts`
- `src/lib/api/fcaApiTypes.ts`
- `api/_lib/contracts/fcaEnums.js`
- `api/_lib/contracts/fcaContracts.js`

#### Validation layer
- `src/lib/contracts/fcaSchemas.ts`
- `api/_lib/validation/fcaSchemas.js`
- `api/_lib/validation/assertValid.js`

#### First route layer
- `api/projects/index.js`
- `api/projects/[projectId].js`
- `api/projects/[projectId]/takeoffs/index.js`
- `api/projects/[projectId]/rfis/index.js`
- `api/auricrux/actions/index.js`

As of this packet, those runtime files remain **not repo-proven present**.

---

## Allowed Next States

### State A — Direct runtime execution
Preferred default.

Requirements:
- create the exact first-wave runtime files in approved paths
- use only packet-approved content sources
- commit the new runtime files into repo
- next packet records exact created files and commit truth

### State B — Hard blocker capture
Allowed only if a real blocker prevents safe direct creation.

Accepted blocker classes:
- `path_collision`
- `repo_standard_incompatibility`
- `import_or_module_format_risk`
- `tooling_limitation`
- `build_regression_risk`

If this path is used, the next packet must include:
- exact blocked files
- blocker class
- why unsafe now
- remediation action
- safe subset, if any

---

## Direct Runtime Execution Rule

If no verified blocker exists, Auricrux must prefer **direct runtime file creation** over any further planning packet.

The burden of proof is on any blocker claim.

---

## Hard Blocker Rule

A hard blocker is valid only if it is:
- specific
- file-scoped or system-scoped
- safety-relevant
- incompatible with safe direct creation in the current run

Vague uncertainty is not a blocker.

---

## Required Runtime Creation Set

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

## Canonical Runtime Sources

### Contract + validation files
Source only from:
- `docs/FCA_PACKET_052J_EXACT_FILE_CONTENT_PACKET.md`

### Route files
Source only from:
- `docs/FCA_PACKET_052K_FIRST_ROUTE_STUB_PACKET.md`

No alternate code source is authorized.

---

## Validation Gates After Direct Creation

```bash
npm install
npm run lint
npm run build
```

Required stub smoke checks:
- `GET /api/projects`
- invalid `POST /api/projects`
- `GET /api/projects/{projectId}`
- invalid `POST /api/projects/{projectId}/takeoffs`
- invalid `POST /api/projects/{projectId}/rfis`
- invalid `POST /api/auricrux/actions`

---

## Guardrails

Do **not** during the next execution step:
- modify existing bid-tracker runtime files outside approved first-wave paths
- alter deployment workflows
- alter static web app config
- wire UI navigation to new routes yet
- add persistence assumptions into stubs
- invent substitute paths or helper layers

---

## 052Y Success Definition

`052Y` is successful if:
- docs continuity is repo-proven through this packet
- runtime-code truth boundary is explicit
- allowed next states are narrowed to direct execution or hard blocker capture
- no ambiguous middle state remains

---

## Next Packet

`052Z = Direct Runtime Execution Result Or Hard Blocker Packet`

Must deliver one of:
- exact repo-proven runtime file creation result with commit hash, or
- exact hard blocker artifact with blocked file set and remediation path

---

## Progress Lock

- Current packet: `052Y`
- Next packet: `052Z`
- Target packet: `060A`
- Docs chain: **repo-proven**
- Runtime file chain: **not yet repo-proven**
- Save-after-every-prompt rule remains active
