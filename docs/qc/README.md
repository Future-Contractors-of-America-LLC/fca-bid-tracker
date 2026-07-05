# Product Quality Control

Run before deploy or after major SaaS/LMS changes.

| Command | Scope |
|---------|--------|
| `npm run qc:saas` | Portal routes, API health, client modules, route validation |
| `npm run qc:lms` | Academy catalog depth, lesson media slots, LMS API, CTA continuity |
| `npm run qc:product` | Both passes |
| `npm run qc:module-competitive-required` | Required module capability + competitive benchmark + ranking + standards freeze + executive/release artifacts |

Reports are written to this folder:

- `saas-qc-report.md` / `.json`
- `lms-qc-report.md` / `.json`
- `lms-simulation-latest.md` / `lms-simulation-report.json` (Academy behavioral simulation)
- `lms-repair-latest.md` / `lms-repair-report.json` (Academy repair loop)
- `module-capability-coverage-report.md` / `.json`
- `competitive-module-audit-report.md` / `.json`
- `module-competitive-ranking-report.md` / `.json`
- `portal-standards-freeze-report.md` / `.json`
- `weekly-executive-scorecard.md` / `.json`
- `release-communications-internal.md`
- `release-communications-external.md`
- `release-claim-proof-map.json`

## Continuous LMS repair loop

| Command | Scope |
|---------|--------|
| `npm run sim:lms` | Single Observe pass (static QC + learner workflow + SWA + central artifacts) |
| `npm run sim:lms:loop` | Full Observe -> Act -> Review bounded repair loop |

Protocol: `docs/FCA_LMS_REPAIR_LOOP_PROTOCOL.md`. Founder guide: `docs/FOUNDER_LMS_SIMULATIONS.md`.

## SaaS surfaces checked

All `/portal/*` tools, workflow/portal API clients, and live endpoints on auricrux-central.

## LMS depth checked

- Program metadata, course lesson counts, title alignment
- `lessonMedia[]` slots per lesson (lecture, lab demo, performance eval)
- Backend academy-lms enrollment snapshot
- Academy page CTA continuity

Media warnings (`productionStatus: pending`) are expected until Foundry fills video URLs.

## Finance secret-store operationalization

- Runbook: `docs/qc/FINANCE_SECRET_STORE_OPERATIONALIZATION.md`
- Strict gate: `npm run validate:finance-ops-readiness:strict`
- Purpose: require finance readiness keys from Function App settings (secure store evidence), not temporary shell overrides.

## Branch protection required checks

- Canonical mapping: `docs/qc/REQUIRED_STATUS_CHECKS.md`
- Includes exact check-run names to require on `main` branch protection.
