# FCA_PACKET_061A_RUNTIME_SMOKE_ROOT_CAUSE_REMEDIATION

Status: Active
Classification: Runtime smoke blocker remediation
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `061A`
Next Packet: `061B`
Target Packet: `060Z`

---

## Objective
Remove the repo-visible current-head runtime smoke root causes identified in `060Z` without making a false deployment-complete claim.

## Root causes targeted
1. `zod` dependency failure inside `api/_lib/validation/fcaSchemas.js`
2. broken nested route imports in project takeoff and RFI endpoints
3. response contract mismatch between runtime smoke expectations and API payload shape/status codes

## Remediation implemented
### 1. Removed hard runtime dependency on `zod`
`api/_lib/validation/fcaSchemas.js` now uses a repo-native `safeParse` contract implemented in plain JavaScript for the currently exercised FCA runtime schemas.

### 2. Corrected nested route import paths
The takeoff and RFI project routes now import shared validation, contract, and runtime modules from `../../../_lib/...`, which is the correct path from `api/projects/[projectId]/*/index.js`.

### 3. Aligned API success contracts with runtime smoke classification
`api/_lib/contracts/fcaContracts.js` now returns both `ok` and `success` booleans so the bounded smoke harness can classify success/error bodies truthfully without breaking existing consumers that already read `ok`.

### 4. Aligned mutation route status codes to current smoke expectations
The following mutation handlers now return `202`:
- `POST /api/projects`
- `PATCH /api/projects/[projectId]`
- `POST /api/projects/[projectId]/takeoffs`
- `POST /api/projects/[projectId]/rfis`

## Truth boundary after 061A
### Repo-proven by code inspection
- the prior missing-module failure path for `zod` is removed from the active runtime schema file
- the previously broken nested route imports are corrected in repo truth
- the runtime smoke harness success classifier can now detect route success bodies because `success: true|false` is emitted
- the previously mismatched mutation statuses are aligned to the harness expectation set

### Not yet proven in-session
- a fresh current-head runtime smoke pass
- refreshed proof artifacts persisted by CI on `main`
- build-validation proof lane restoration on `main`
- live deployment verifier success
- managed auth deployed runtime proof
- academy deployed parity proof
- commercial live runtime proof

## Gate decision
**PASS for blocker-first repo remediation.**

`061A` truthfully closes only the code-level root-cause remediation step.
It does **not** prove that the runtime smoke lane, build-validation lane, or live deployment lanes now pass.

## Required next packet
- `061B` — runtime smoke revalidation and proof refresh packet
