# FCA COVERAGE MATRIX (NO-GAP ENFORCEMENT)

## Purpose

This file is the repo-level anti-gap enforcement surface for `Future-Contractors-of-America-LLC/fca-bid-tracker`.

It translates FCA system-law and Contractor Command continuity requirements into a route-aware, repo-truth matrix for this active customer-facing shell.

This file is intentionally grounded in **repo truth** as inspected in `fca-bid-tracker` on branch `main` at commit `b7e3a2b0158981f0db6b8a3c5e02e080dcfc0380`.

## Truth Hierarchy

For this repo, the following truth order applies:

1. Canonical FCA system-law and build sequence
2. Repo truth in `fca-bid-tracker`
3. Deployment truth
4. Live public truth

A mapped capability is not considered complete merely because it exists in vision documents.

## Continuity Law

Every applicable module must, where relevant, connect to:

- customer / tenant context
- project / job continuity
- file / evidence continuity
- Auricrux action surface
- audit / reporting surface
- output artifact or user-visible state change

If any required linkage is missing, a system gap exists.

---

## Route Surface Inventory (Repo Truth)

### Public website routes present in repo

- `/`
- `/platform`
- `/login`
- `/pricing`
- `/contact`
- `/auricrux`
- `/warranty`
- `/referrals`
- `/bid-entry`
- `/bid-status`
- `/academy`

### Portal routes present in repo

- `/portal`
- `/portal/platform`
- `/portal/operations`
- `/portal/projects`
- `/portal/files`
- `/portal/audit`
- `/portal/messages`
- `/portal/notifications`
- `/portal/bids`
- `/portal/billing`
- `/portal/support`
- `/portal/admin`
- `/portal/profile`
- `/portal/auricrux`
- `/portal/academy`

### Validation and governance scripts already present in repo

Observed scripts include, among others:

- `validate:routes`
- `validate:critical-routes`
- `validate:project-workspace`
- `validate:file-governance`
- `validate:billing-governance`
- `validate:support-governance`
- `validate:product-readiness`
- `validate:operations-pipeline`
- `validate:website-market-readiness`
- `verify:live-deployment`

This means the repo already contains a meaningful validation spine and should now carry a matching explicit coverage matrix.

---

## Lifecycle Coverage Matrix

| Lifecycle Stage | Primary Repo Surface | Status | Notes |
|---|---|---:|---|
| Lead / Intake | public website, contact, pricing, bid entry | repo-present | Public conversion surfaces exist in repo. |
| Bid / Qualification | `/bid-entry`, `/bid-status`, `/portal/bids` | repo-present | Bid workspace continuity exists at shell level. |
| Project / Job Spine | `/portal/projects` | repo-present | Project surface exists; deeper object/state verification still required. |
| Files / Evidence | `/portal/files` | repo-present | File workspace surface exists; evidence-depth remains subject to live verification. |
| Audit / Traceability | `/portal/audit` | repo-present | Audit surface exists in shell. |
| Messaging / Comms | `/portal/messages`, `/portal/notifications`, `/portal/support` | repo-present | Customer-facing comms surfaces exist. |
| Billing / Finance | `/portal/billing` | repo-present | Billing shell exists; financial depth must remain governed by validations. |
| Admin / Governance | `/portal/admin` | repo-present | Admin surface exists. |
| Auricrux Operator Presence | `/auricrux`, `/portal/auricrux` | repo-present | Auricrux visible in public + portal surfaces. |
| Academy Integration | `/academy`, `/portal/academy` | repo-present | Academy shell exists in both public and portal surfaces. |
| Warranty | `/warranty` | repo-present | Public warranty entry surface exists. |
| Referral / Growth | `/referrals` | repo-present | Public referral surface exists. |
| Optimization / Post-mortem | validation and report scripts | planned-partial | Governance scaffolding exists; operator-facing optimization UI is not yet explicit in this repo shell. |

---

## Module Coverage Table

| Module | Lifecycle Stage | UI Surface | Validation Surface | Repo Status | Required Next Truth Step |
|---|---|---|---|---:|---|
| Public Conversion Shell | Lead / Intake | `/`, `/platform`, `/pricing`, `/contact` | `validate:website-market-readiness`, `validate:public-top-nav` | repo-present | verify live CTA parity |
| Bid Workspace | Bid / Qualification | `/bid-entry`, `/bid-status`, `/portal/bids` | `validate:bid-workspace`, `validate:qualification-evidence-spine` | repo-present | verify customer-usable state |
| Project Workspace | Project / Job | `/portal/projects` | `validate:project-workspace`, `validate:auricrux-project-spine` | repo-present | confirm project anchoring depth |
| File Governance | Files / Evidence | `/portal/files` | `validate:file-governance`, `validate:auricrux-file-audit-layer` | repo-present | confirm evidence workflow depth |
| Billing Governance | Billing / Finance | `/portal/billing` | `validate:billing-governance`, `validate:billing-action-center` | repo-present | verify billing action truth |
| Support Governance | Support / Service | `/portal/support` | `validate:support-governance`, `validate:support-action-center` | repo-present | verify service action truth |
| Admin Governance | Admin | `/portal/admin` | `validate:admin-governance`, `validate:admin-action-center` | repo-present | verify admin continuity |
| Platform Command Center | Ops / Overview | `/portal/platform`, `/portal/operations` | `validate:platform-command-center`, `validate:operations-pipeline` | repo-present | verify route-state parity |
| Academy | Training / Academy | `/academy`, `/portal/academy` | `validate:academy-catalog`, `validate:academy-ctas` | repo-present | verify productized linkage from ops surfaces |
| Auricrux Embedment | Cross-cutting | `/auricrux`, `/portal/auricrux` | `validate:auricrux-embedment`, related Auricrux validations | repo-present | verify actionable embedment beyond copy |
| Warranty | Warranty | `/warranty` | no repo-specific warranty validator observed | planned-partial | add explicit warranty continuity validator |
| Referrals | Growth / Referral | `/referrals` | no repo-specific referral validator observed | planned-partial | add explicit referral/growth validator |

---

## Current No-Gap Findings (Repo-Truth, Not Live-Truth)

### Strongly present in repo

- public website shell
- portal shell
- academy shell
- Auricrux embedment surfaces
- route validation spine
- multiple governance and readiness validators

### Partial / still requiring enforcement follow-through

- explicit warranty validation parity
- explicit referral / growth validation parity
- explicit matrix-driven repo-to-live reporting linkage
- explicit status distinction between `repo-present` and `customer-usable`

### Not safe to claim from repo inspection alone

- deployed parity
- live-route parity
- authenticated production usability
- full project/file/audit depth under real user sessions

---

## Failure Conditions

A module fails no-gap enforcement if any of the following are true:

- route exists but has no validating governance surface where required
- public route exists but is not linked into customer continuity
- portal route exists but is not linked into project / file / audit / support context where applicable
- repo-present surface is described as live or customer-usable without verification
- warranty or referral surfaces exist only cosmetically without follow-through validation

---

## Immediate Next Enforcement Priorities

1. Add explicit validator coverage for warranty and referral surfaces.
2. Add repo-to-live alignment reporting linkage to this matrix.
3. Upgrade module statuses from `repo-present` to `customer-usable` only with verified deployment and smoke evidence.
4. Keep this file updated whenever routes, validations, or continuity surfaces materially change.

---

## Status Legend

- `missing` = not present in repo
- `planned-partial` = concept exists or route exists, but governance or continuity proof is incomplete
- `repo-present` = route/module/validator exists in repo
- `deployed` = verified in deployment
- `customer-usable` = verified usable in live customer-facing behavior

Only verified states may advance beyond `repo-present`.
