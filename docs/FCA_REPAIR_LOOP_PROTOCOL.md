# FCA / Auricrux Repair Loop Protocol

**Coverage law:** Every sovereign module must support **Observe -> Act -> Review** (see `docs/FCA_VISION_AND_SCOPE.md`). Workflow simulations are the behavioral Observe lane; this protocol defines bounded Act and Review.

## Purpose

Continuously prove contractor workflows work on the live API **and** self-heal when safe, queue repairs when not, and improve over time — without the founder manually testing in the field.

## Protocol

| Phase | What happens | Artifact |
|-------|----------------|----------|
| **Observe** | Run `simulate-contractor-workflow.mjs` against live Central | `docs/qc/workflow-simulation-report.json` |
| **Act** | Map failures to playbooks; retry transients; enqueue engineering/founder work | `auricrux/system/work_queue.json` |
| **Review** | Re-run simulation (up to N rounds); Auricrux recommends on remaining failures | `docs/qc/workflow-repair-latest.md` |

## Commands

```powershell
npm run sim:workflow          # single observe pass
npm run sim:workflow:loop     # full Observe -> Act -> Review loop
```

## Bounded auto-repair (Act)

| Class | Behavior |
|-------|----------|
| `retry-transient` | Backoff and re-run (API 5xx, cold start, lead hydration) |
| `founder-action` | Queue item + fail with clear secret/config instructions |
| `engineering-queue` | Queue item for Central/web code fix |
| `auricrux-review` | POST `/api/auricrux/actions` recommend on failed steps |

**Not auto-repaired (by design):** code bugs, missing GitHub secrets, production credential changes. Those become work-queue items — not silent failures.

## Configuration

| Env | Default | Meaning |
|-----|---------|---------|
| `FCA_REPAIR_LOOP_MAX_ROUNDS` | `3` | Max Observe->Act->Review cycles per run |
| `FCA_REPAIR_LOOP_RETRY_MS` | `5000` | Delay before transient retry |
| `FCA_SIM_LOGIN_EMAIL` | — | Required for authenticated workflow |
| `FCA_SIM_LOGIN_PASSWORD` | — | Required for authenticated workflow |

## Founder read path

1. `docs/qc/workflow-repair-latest.md` — last loop outcome
2. `docs/qc/workflow-simulation-latest.md` — last simulation steps
3. GitHub Actions -> **FCA Workflow Simulations** -> Summary
4. `auricrux/system/work_queue.json` — open repair backlog

## Schedule

Runs with **FCA Workflow Simulations** every hour and on push to `main`.

## Validation

- `scripts/validate-workflow-repair-loop.mjs` — protocol wiring gate
- `scripts/validate-fca-sovereignty.mjs` — static sovereignty (complementary)

## Relation to Auricrux Law

Sovereignty law (`auricrux-central/FCA_SOVEREIGNTY_LAW.md`) requires native spine completeness. The repair loop is the **runtime proof + recovery** layer: if sovereignty wiring passes but behavior fails, the loop observes, acts within bounds, and reviews until green or until work is explicitly queued.
