# FCA Academy LMS Repair Loop Protocol

**Coverage law:** Every sovereign module must support **Observe -> Act -> Review** (see `docs/FCA_VISION_AND_SCOPE.md`). Academy LMS simulations are the behavioral Observe lane; this protocol defines bounded Act and Review.

## Purpose

Continuously prove Academy LMS workflows work on live API and SWA surfaces **and** self-heal when safe, queue repairs when not, and improve over time — without the founder manually walking catalog, enrollments, and commerce paths.

## Protocol

| Phase | What happens | Artifact |
|-------|----------------|----------|
| **Observe** | Run `simulate-academy-lms.mjs` (static QC + learner workflow + SWA probes + central artifacts) | `docs/qc/lms-simulation-report.json` |
| **Act** | Map failures to playbooks; retry transients; enqueue engineering/founder work; optional SWA redeploy | `auricrux/system/work_queue.json`, `auricrux/system/next_action.json` |
| **Review** | Re-run simulation (up to N rounds); Auricrux recommends on remaining failures | `docs/qc/lms-repair-latest.md` |

## Commands

```powershell
npm run sim:lms          # single observe pass
npm run sim:lms:loop     # full Observe -> Act -> Review loop
```

## Observe phases

| Phase | What is tested |
|-------|----------------|
| 1 — Static QC | Catalog, media slots, CTAs, commerce wiring (`qc:lms` bundle) |
| 2 — Learner workflow | Login, catalog summary, LMS snapshot, PATCH progress, commerce intake |
| 3 — SWA probes | `/academy`, `/academy/catalog`, `/academy/store`, `/portal/academy` |
| 4 — Central artifacts | `verify_academy_media.py --artifacts-only` when auricrux-central sibling present |

## Bounded auto-repair (Act)

| Class | Behavior |
|-------|----------|
| `retry-transient` | Backoff and re-run (API 5xx, cold start) |
| `founder-action` | Queue item + fail with clear secret/config instructions |
| `engineering-queue` | Queue item for Central/web code fix |
| `swa-redeploy` | Optional `gh workflow run` for SWA deploy when token present |
| `auricrux-review` | POST `/api/auricrux/actions` recommend on failed steps |

**Not auto-repaired (by design):** code bugs, missing GitHub secrets, catalog drift, missing media. Those become work-queue items — not silent failures.

## Configuration

| Env | Default | Meaning |
|-----|---------|---------|
| `FCA_LMS_REPAIR_LOOP_MAX_ROUNDS` | `3` | Max Observe->Act->Review cycles per run |
| `FCA_LMS_REPAIR_LOOP_RETRY_MS` | `5000` | Delay before transient retry |
| `FCA_SIM_LOGIN_EMAIL` | — | Required for authenticated learner workflow |
| `FCA_SIM_LOGIN_PASSWORD` | — | Required for authenticated learner workflow |
| `FCA_GITHUB_TOKEN` | — | Optional; enables SWA redeploy dispatch |
| `FCA_CENTRAL_ROOT` | — | Optional; path to auricrux-central for artifact phase |

## Founder read path

1. `docs/qc/lms-repair-latest.md` — last loop outcome
2. `docs/qc/lms-simulation-latest.md` — last simulation steps
3. GitHub Actions -> **FCA LMS Repair Loop** -> Summary
4. `auricrux/system/work_queue.json` — open repair backlog
5. `auricrux/system/next_action.json` — current bounded fix for Cursor sessions

## Schedule

Runs with **FCA LMS Repair Loop** every hour at **:30** (staggered from contractor workflow sim at :00) and on push to `main`.

## Validation

- `scripts/validate-lms-repair-loop.mjs` — protocol wiring gate
- `scripts/validate-fca-sovereignty.mjs` — static sovereignty (complementary)

## Relation to contractor workflow loop

The **workflow repair loop** includes one Academy catalog read as a contractor-spine check. This **LMS repair loop** is the sovereign Academy proof + recovery layer with full catalog depth, learner mutations, SWA routes, and commerce intake.

## Loop contract

See `auricrux/system/loops/lms-repair-loop.json`.
