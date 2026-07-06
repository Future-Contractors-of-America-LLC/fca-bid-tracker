# FCA Ecosystem Vision Audit — Cursor Deep Dive

- **Run by:** Cursor Agent (independent QC pass, parallel to Copilot in-IDE checks)
- **Date:** 2026-07-04
- **Repos in scope:** `auricrux-central` (governance + API spine), `fca-bid-tracker` (customer shell + QC hub), `fca-mobile-maui` (field shell)
- **Live API:** `https://api.futurecontractorsofamerica.com`
- **Live web:** `https://futurecontractorsofamerica.com`, `https://app.futurecontractorsofamerica.com`
- **Active branch during run:** `hotfix/header-dedupe-final` (preserved; not modified)

> All gates below were executed **fresh in this session** (not read from stale reports). Live gates ran with founder-authorized access: `az` CLI authenticated to Auricrux-Central, plus the documented sandbox QA account for the workflow simulation. No secret values are printed in this report.

---

## 1. Executive Summary

| Layer | Result |
|-------|--------|
| Governance & drift (central) | **PASS** — system law, law drift, Do+Teach registry, academy QC all green |
| Ecosystem tests (static + api-smoke + ci-gate) | **PASS** 15/15 |
| Ecosystem tests (`--include-live`) | **FAIL** 15/16 — deployment-proof witness SHA mismatch only |
| Product QC (market/saas/lms/golden-path/sovereignty/platform/portal-Auricrux) | **PASS** (SaaS 215/215, LMS 541/541 @ composite 9.9) |
| Master integrity (`validate:fca-total-integrity`) | **PASS** 16/16 strict + all optional (incl. mobile Android build) |
| Slice audit | **FAIL** — only `finance-ops` blocked (6 bank/payroll keys) |
| E2E pillar audit | **FAIL** — 6/7 pillars pass; only Pillar 3 (financials) blocked, same keys |
| Claim certainty (composite) | **FAIL** — strict-integrity PASS + M365/Graph PASS + finance-ops FAIL |
| Workflow simulation (LIVE, QA account) | **PASS 16/16** — full contractor lifecycle executed on live API |
| LMS simulation (LIVE) | **PASS** — customer-login step skipped only when creds absent |

**Bottom line:** The FCA ecosystem materially supports its one-system / Do+Teach / sovereignty vision. Every customer-facing surface, the full contractor lifecycle, and the Academy operate live and green. There are **no P0 functional failures**. The remaining reds are (a) a deployment-proof/witness stamping mismatch and (b) finance-ops secrets that live only as founder-held config — plus two documentation truth-vs-aspiration reconciliations.

---

## 2. Vision Alignment Scorecard

| Theme | Verdict | Evidence |
|-------|---------|----------|
| **1. One-system promise** | ✅ Strong | Golden path 6/6; customer-journey smoke 17/17 across website→portal→academy; SPA routes 200 |
| **2. Do + Teach covenant** | ⚠️ Verified but sources disagree | Registry structurally valid (validator PASS); but registry `status:"planned"` for RFI/CO/billing/job-cost contradicts Coverage Matrix `product-complete` + live proof (see §5 P2-1) |
| **3. Coverage spine** | ✅ Strong | Portal Auricrux coverage on **every** portal surface; platform QC matrix 12 slices + traverse PASS |
| **4. Sovereignty** | ✅ Strong | 25/25 sovereignty checks; native FCAM/FCAS/FCAP + FCA-native payment rail; Stripe/APS labeled optional |
| **5. Truth vs aspiration** | ⚠️ Needs reconciliation | Two canonical docs use overlapping words for different axes; academy count claims inconsistent (see §5 P2-1, P2-2) |
| **6. Construction-native credibility** | ✅ Strong | Live lifecycle mutations (lead→qualify→bid→estimate→award→project→RFI→CO→field→pay→warranty) all executed on live API via workflow sim |

---

## 3. Automated Gate Results (fresh this run)

### Governance layer — `auricrux-central`
| Gate | Result | Notes |
|------|--------|-------|
| `validate-system-law-compliance.mjs` | PASS | — |
| `detect-law-drift.mjs` | PASS | hashes aligned central/bid-tracker/mobile |
| `validate_do_teach_registry.py` | PASS | structural: handlers + teach paths present |
| `qc_academy.py` | PASS | 1212 programs; all 6 lanes; live API 1212; content substantive |
| `ecosystem/run-ecosystem-tests.mjs` | PASS 15/15 | ci-gate + static (cycles 1–14) + api-smoke |
| `ecosystem/run-ecosystem-tests.mjs --include-live` | **FAIL 15/16** | live deployment witness mismatch (see §4) |

### Product QC — `fca-bid-tracker`
| Gate | Result |
|------|--------|
| `run-market-qc.mjs` | PASS 2/2 (87 hrefs, 77 route metadata) |
| `validate-standing-directives-memory.mjs` | PASS |
| `validate-standing-directives-execution-standard.mjs` | PASS |
| `validate-fca-ecosystem-golden-path.mjs` | PASS 6/6 |
| `validate-fca-sovereignty.mjs` | PASS (25 checks) |
| `validate-portal-auricrux-coverage.mjs` | PASS (all portal surfaces) |
| `validate-platform-qc-matrix.mjs` | PASS (12 slices + traverse) |
| `run-saas-qc.mjs` | PASS 215/215 |
| `run-lms-qc.mjs` | PASS 541/541; benchmark composite **9.9** (min 9.7) |

### Integrity & enterprise gates — `fca-bid-tracker`
| Gate | Result | Notes |
|------|--------|-------|
| `validate-fca-total-integrity.mjs` | **PASS** | 16/16 strict incl. `ecosystem-leader-grade: exit 0`; all optional incl. `mobile:dotnet-build-android`, `mobile:play-ready-probe`. Prior 600s leader-grade timeout was **transient** — resolved this run |
| `run-slice-audit.mjs` | FAIL | 5/6 slices PASS (code-integrity, identity-graph-tenant, commerce, central-runtime, central-api). Only `finance-ops` BLOCKED |
| `run-e2e-pillar-audit.mjs` | FAIL | 6/7 pillars PASS. Only Pillar 3 (enterprise financials) blocked, same keys |
| Claim certainty (composite, derived) | FAIL | strict-integrity PASS + M365/Graph PASS + finance-ops FAIL. Only blocker is finance-ops |

### Live simulations
| Sim | Result | Notes |
|-----|--------|-------|
| `run-workflow-simulations.mjs` (QA account) | **PASS 16/16** | Live mutations: login, session, lead intake, qualify, bid advance, pipeline, award→project, RFI, change order, field task, payment intake, payment checkout, warranty intake, Auricrux recommend, academy catalog |
| `run-lms-simulations.mjs` | PASS | live academy reachable, catalog 1212, LMS snapshot, progress PATCH, commerce intake; customer-login step skips without creds |

---

## 4. Live Deployment Witness Finding (the one live red)

`test:ecosystem:live` failed **only** on the live-deployment smoke. The live hosts respond `200` and serve a real build (`gitSha 719df3a5…`), but:

- `commit-witness-unconfigured.txt` returns 404 (local expectation was `unconfigured`, i.e. no stamped local proof)
- deployment-status and runtime-fingerprint report SHA `719df3a5…` while the local verifier expected `unconfigured`
- deployment manifest reports default host `delightful-mushroom-0de67860f.7.azurestaticapps.net`

**Interpretation:** This is a **deployment-proof stamping / expectation mismatch**, not a customer outage — every customer journey, API endpoint, and lifecycle mutation is green. The verifier compared the live site against an *unstamped local* expectation (`gitSha=unconfigured`), so all three hosts read as "stale." The script's own note flags this as a possible SWA deployment token/resource-target drift worth confirming.

---

## 5. Gap List (ranked)

### P0 — blocks deploy/trust
**None.** Live customer surfaces, API spine, full lifecycle, and Academy are all verified green this session.

### P1 — integrity/config drift
1. **Deployment-proof witness mismatch** (`test:ecosystem:live`). Live SWA hosts serve `719df3a5…` with default host `delightful-mushroom-…azurestaticapps.net`; the verifier expected a stamped/`unconfigured` witness. Confirm the SWA deployment target/token and stamp a current commit witness so the live-proof gate reflects reality.
2. **finance-ops readiness (6 founder-held keys)** — `FCA_BANK_NAME`, `FCA_BANK_ROUTING_FINGERPRINT`, `FCA_BANK_ACCOUNT_FINGERPRINT`, `FCA_PAYOUT_DESTINATION_ID`, `FCA_PAYROLL_EMPLOYEE_MICHAEL_ID`, `FCA_PAYROLL_EMPLOYEE_AMANDA_ID`. Their absence is the *sole* cause of the slice-audit FAIL, e2e-pillar-3 FAIL, and claim-certainty FAIL. Supply via secure config (Key Vault / function-app settings / CI secrets) to turn all three green.

### P2 — truth vs aspiration (documentation reconciliation)
1. **Do+Teach status vs Coverage Matrix contradiction.** `do_teach_registry.json` and the `FCA_Product_Vision.md` "Verified vs Planned" table mark RFIs, Change Orders, Billing/Pay Apps, and Job Cost as `planned` (buildPhase 6–7), while `FCA_COVERAGE_MATRIX.md` marks the same slices `product-complete` **and** the live workflow sim executed those exact mutations. Per `FCA_SYSTEM_INVENTORY.md` line 84 this is *intentional* (the spine-gated Auricrux `execute` handler is distinct from the live product surface), but the wording invites misreading. **Fix:** add an explicit axis note — "product surface (live/complete)" vs "Auricrux Do+Teach handler (Active vs spine-gated)" — and refresh the Vision table so the two canonical sources visibly agree.
2. **Academy program-count inconsistency.** Coverage Matrix cycle-11 text claims "**2,010** programs"; live API + `qc_academy.py` + LMS QC all report **1,212**; internal counts also vary (1,212 catalog / 1,227 program dirs / 1,267 balance-check API programs). **Fix:** normalize to the single verified number (1,212) across matrix, vision, and marketing copy.

---

## 6. Blocked / Could-Not-Fully-Verify Checks

| Check | Blocker | To unblock |
|-------|---------|------------|
| `test:ecosystem:live` deployment-proof phase | Live witness/SHA expectation mismatch (P1-1) | Confirm SWA target + stamp commit witness |
| Claim certainty (finance-ops leg) | 6 bank/payroll env keys absent locally (P1-2) | Provide founder finance secrets |
| `sim:workflow` in CI | `FCA_SIM_LOGIN_EMAIL` / `FCA_SIM_LOGIN_PASSWORD` GitHub secrets | Already green locally with QA account this run; add CI secrets for hourly gate |

*Note:* `az`-backed identity/M365 Graph readiness **passed** — Auricrux-Central holds `FCA_TENANT_ID`, `FCA_TENANT_PRIMARY_DOMAIN`, `FCA_CLIENT_ID`, `FCA_CLIENT_SECRET` and `customer_verify_route` is healthy.

---

## 7. Recommendations for Next Copilot/Agent Cycle

1. **Do not treat total-integrity as failing** — it passes now; the prior 600s leader-grade timeout was transient. If it recurs, run `run-ecosystem-leader-grading.mjs` standalone with an extended timeout rather than failing the master gate.
2. **P1 first:** resolve the deployment witness/SWA target and load finance-ops secrets — these flip slice-audit, e2e-pillar, claim-certainty, and live-ecosystem from red to green with no code change.
3. **P2 doc reconciliation:** one small edit each to `FCA_Product_Vision.md` (axis clarifier + refresh Planned rows) and the academy count in `FCA_COVERAGE_MATRIX.md`. These are the only true "vision vs reality" gaps and both are wording, not capability.
4. **Everything else is green** — preserve the active `hotfix/header-dedupe-final` work; no conflicting changes were made by this audit.

---

## 8. Method / Evidence Trail

- Governance validators run from `auricrux-central`; product/integrity/sim gates run from `fca-bid-tracker` via `node` directly (npm invoked fine as a child process inside orchestrators).
- Fresh report artifacts written this run: `docs/qc/fca-total-integrity-report.md` (PASS), `docs/qc/slice-audit-report.md`, `docs/qc/e2e-pillar-audit-report.md`, `docs/qc/workflow-simulation-latest.md` (16/16), `docs/qc/law-drift-report.json`, `auricrux-central/docs/ecosystem-test-reports/ecosystem-test-run.json`.
- Workflow simulation used the documented sandbox QA account against the live API; credentials were supplied in-process and not persisted or printed.
