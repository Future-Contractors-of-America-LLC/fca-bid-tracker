# FCA Packet 062J — First Stacked Observation Matrix

Status: bound from in-session observable PR truth on 2026-06-17

| lane | workflow path | repo-wired | stack-head observed | main observed | live deployment observed | current truthful note |
|---|---|---:|---:|---:|---:|---|
| build validation | `.github/workflows/build-validation.yml` | yes | no exact current-stack run locked | no | n/a | workflow exists in stack truth; no exact build-validation run observed in-session for the current stacked head |
| alignment proof governance | `.github/workflows/alignment-proof-governance.yml` | yes | no exact current-stack run locked | no | n/a | dedicated governance lane exists in stack truth; no exact governance run observed in-session |
| static web app deploy | `.github/workflows/azure-static-web-apps-delightful-mushroom-0de67860f.yml` | yes | no | no | no | deployment lane exists in stack truth only |
| runtime smoke validation | `.github/workflows/runtime-smoke-validation.yml` | yes | no | no | no | runtime smoke lane exists in stack truth only |
| live deployment proof stamp | `.github/workflows/live-deployment-proof-stamp.yml` | yes | no | no | no | proof-stamp lane exists in stack truth only |
| live deployment run witness | `.github/workflows/live-deployment-run-witness.yml` | yes | no | no | no | witness lane exists in stack truth only |
| PR review automation (`062D`) | `copilot-pull-request-reviewer` | n/a | yes | no | n/a | PR #111 observed completed/success |
| PR review automation (`062E`) | `copilot-pull-request-reviewer` | n/a | yes | no | n/a | PR #112 observed completed/success |
| PR review automation (`062F`) | `copilot-pull-request-reviewer` | n/a | yes | no | n/a | PR #113 observed completed/success |
| PR review automation (`062G`) | `copilot-pull-request-reviewer` | n/a | no | no | n/a | no check run observed in-session for PR #114 |
| PR review automation (`062I`) | `copilot-pull-request-reviewer` | n/a | no | no | n/a | no check run observed in-session for PR #132 |

## Interpretation rules
- `yes` under `repo-wired` means only repo truth exists.
- `yes` under `stack-head observed` requires an actual observed run tied to the specific PR head.
- nothing in this matrix upgrades any lane to `main observed` or `live deployment observed`.
- nothing in this matrix reduces the unresolved `061Z` deployment blocker set.