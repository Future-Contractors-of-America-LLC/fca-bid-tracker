# FCA_PACKET_052L_ROUTE_APPLY_PATCH_PACKET

Status: Active
Classification: Binding route-apply patch packet
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `052L`
Next Packet: `052M`
Target Packet: `060A`

---

## Issue

`052K` fixed the first exact route-stub packet.
`052L` must now classify how those route files should be applied against the current repository tree, define patch boundaries, and prevent regressions against the existing bid-tracker surfaces.

---

## Truth Boundary

This packet defines the apply patch plan against current repo truth.

It does **not** claim:
- route files are already created in runtime locations
- import paths have already been validated in CI
- route handlers are already wired to persistence
- the live product currently exposes these new routes

It **does** classify file creation vs replacement, import-path verification, patch boundaries, and commit sequencing for the first route insertion wave.

---

## Current Repo Truth Used

Verified in repo root:
- `api/` exists
- `src/` exists
- `docs/` exists
- no repo-visible proof yet that the new 052J/052K runtime files have been applied
- continuity artifacts are being saved in `docs/`

Therefore the first implementation wave should be treated as **new file creation** for the canonical contract/validation/route set unless direct file inspection proves otherwise.

---

## 1. File Classification

### 1.1 New files to create
These should be treated as **new files** unless current repo inspection later proves they already exist.

#### Frontend/shared contract layer
- `src/lib/contracts/fcaEnums.ts`
- `src/types/fca-contracts.ts`
- `src/lib/api/fcaApiTypes.ts`
- `src/lib/contracts/fcaSchemas.ts`

#### Backend/shared validation layer
- `api/_lib/contracts/fcaEnums.js`
- `api/_lib/contracts/fcaContracts.js`
- `api/_lib/validation/fcaSchemas.js`
- `api/_lib/validation/assertValid.js`

#### First route layer
- `api/projects/index.js`
- `api/projects/[projectId].js`
- `api/projects/[projectId]/takeoffs/index.js`
- `api/projects/[projectId]/rfis/index.js`
- `api/auricrux/actions/index.js`

### 1.2 Existing files to preserve
Do **not** replace blindly:
- existing bid entry surfaces
- existing bid tracker surfaces
- current build scripts
- current deployment workflow files
- current static web app config

### 1.3 Conditional-update files
These may require follow-on patching later, but not in the first safe apply wave:
- router files
- shared API client utilities
- project workspace UI shell files
- navigation files

Reason: first establish isolated, canonical files before wiring them into live navigation.

---

## 2. Directory Creation Rules

If missing, create in this order:

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

No alternate naming allowed.

---

## 3. Import Path Verification Notes

### 3.1 Frontend files
Expected import relationships:
- `src/types/fca-contracts.ts` imports from `../lib/contracts/fcaEnums`
- `src/lib/contracts/fcaSchemas.ts` imports from `./fcaEnums`

### 3.2 Backend files
Expected import relationships:
- `api/_lib/validation/fcaSchemas.js` imports from `../contracts/fcaEnums`
- `api/projects/index.js` imports from `../_lib/...`
- `api/projects/[projectId].js` imports from `../_lib/...` only if later expanded
- `api/projects/[projectId]/takeoffs/index.js` imports from `../../../../_lib/...`
- `api/projects/[projectId]/rfis/index.js` imports from `../../../../_lib/...`
- `api/auricrux/actions/index.js` imports from `../../_lib/...`

### 3.3 Verification rule
Before commit of applied code:
- every `require` / `import` path must resolve
- no mixed ESM/CommonJS drift inside the same file group without explicit repo-standard justification

### 3.4 Safe standard for this wave
Because existing route/runtime style is not yet fully inspected packet-by-packet here, backend files should prefer **CommonJS consistency** within the first route wave if existing `api/` surfaces appear CommonJS-based.

---

## 4. Patch Boundary Rules

### 4.1 Allowed in first apply wave
- create canonical contract files
- create canonical validation files
- create first route stubs
- add docs/checklists tied to those files

### 4.2 Not allowed in first apply wave
- changing existing customer-facing routing behavior
- removing existing bid routes
- rewriting deployment workflow files
- altering production auth behavior
- introducing persistence assumptions not yet contract-checked

### 4.3 Why
The goal is a **non-breaking additive wave**.

---

## 5. Commit Batch Order

### Commit A
`Add FCA shared contract and enum files`

Files:
- `src/lib/contracts/fcaEnums.ts`
- `src/types/fca-contracts.ts`
- `src/lib/api/fcaApiTypes.ts`
- `api/_lib/contracts/fcaEnums.js`
- `api/_lib/contracts/fcaContracts.js`

### Commit B
`Add FCA validation schema files`

Files:
- `src/lib/contracts/fcaSchemas.ts`
- `api/_lib/validation/fcaSchemas.js`
- `api/_lib/validation/assertValid.js`

### Commit C
`Add FCA first project spine route stubs`

Files:
- `api/projects/index.js`
- `api/projects/[projectId].js`
- `api/projects/[projectId]/takeoffs/index.js`
- `api/projects/[projectId]/rfis/index.js`
- `api/auricrux/actions/index.js`

### Commit D
`Add route apply verification docs`

Any supporting docs/checklists if needed.

---

## 6. Non-Regression Checks

Before merging applied-code wave:
- existing bid tracker build still passes
- no existing route path removed
- no static web app config changed unintentionally
- no deployment token/workflow touched unintentionally
- route stubs return structured envelopes
- invalid payloads fail with 400 on validated POST handlers

---

## 7. Minimum Validation Commands

```bash
npm install
npm run lint
npm run build
```

If repo script names differ, minimum checks still required:
- install succeeds
- lint-equivalent succeeds
- build-equivalent succeeds
- import resolution succeeds for new route files

### Route smoke checks
- `GET /api/projects`
- `POST /api/projects` invalid payload rejection
- `GET /api/projects/{projectId}`
- `POST /api/projects/{projectId}/takeoffs` invalid payload rejection
- `POST /api/projects/{projectId}/rfis` invalid payload rejection
- `POST /api/auricrux/actions` invalid payload rejection

---

## 8. Merge Safety Rule

Do not wire new routes into customer-facing UI navigation in the same patch batch as file creation unless:
- install succeeds
- lint succeeds
- build succeeds
- route stubs import cleanly

UI wiring belongs in a later controlled packet.

---

## 9. Acceptance Criteria

`052L` is complete only if:
- file creation vs preservation classification is fixed
- directory creation order is fixed
- import-path verification rules are fixed
- patch boundaries are fixed
- commit batch order is fixed
- non-regression checks are fixed
- validation commands are fixed

---

## 10. Next Packet

`052M = Applied Code Commit Packet`

Must deliver:
- exact `push_files`-ready runtime code application set for first wave
- canonical file contents grouped by commit batch
- no prose-only packeting
- direct repo-apply execution payload

---

## Progress Lock

- Current packet: `052L`
- Next packet: `052M`
- Target packet: `060A`
- Save-after-every-prompt rule remains active
