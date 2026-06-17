# FCA Packet 062J — First Stacked Observation Matrix

Status: initial matrix shell

| lane | workflow path | repo-wired | stack-head observed | main observed | live deployment observed | current truthful note |
|---|---|---:|---:|---:|---:|---|
| build validation | `.github/workflows/build-validation.yml` | yes | unobserved here | unobserved here | n/a | workflow exists in stack truth; no exact current-stack run locked in-session |
| alignment proof governance | `.github/workflows/alignment-proof-governance.yml` | yes | unobserved here | unobserved here | n/a | dedicated governance lane exists in stack truth; no exact current-stack run locked in-session |
| static web app deploy | `.github/workflows/azure-static-web-apps-delightful-mushroom-0de67860f.yml` | yes | unobserved here | unobserved here | unobserved here | deployment lane exists in stack truth; no exact current-stack deploy run locked in-session |
| runtime smoke validation | `.github/workflows/runtime-smoke-validation.yml` | yes | unobserved here | unobserved here | unobserved here | runtime smoke lane exists in stack truth; no exact current-stack runtime observation locked in-session |
| live deployment proof stamp | `.github/workflows/live-deployment-proof-stamp.yml` | yes | unobserved here | unobserved here | unobserved here | proof-stamp lane exists in stack truth; no exact current-stack stamp run locked in-session |
| live deployment run witness | `.github/workflows/live-deployment-run-witness.yml` | yes | unobserved here | unobserved here | unobserved here | witness lane exists in stack truth; no exact current-stack witness run locked in-session |

## Rule
This matrix must only be promoted from `unobserved here` when an exact run is actually observed and recorded.