# Agent context — fca-bid-tracker

## Governance

Align to `Future-Contractors-of-America-LLC/auricrux-central` system law and build sequence artifacts.

## Three-machine workload map

**Read first:** [docs/THREE_MACHINE_WORKLOAD_MAP.md](docs/THREE_MACHINE_WORKLOAD_MAP.md)

Canonical copy: `auricrux-central/docs/THREE_MACHINE_WORKLOAD_MAP.md`

| Machine | Role for this repo |
|---------|-------------------|
| Primary | Build, deploy, FCA secrets, push to `main` |
| Laptop | Triage, verify live site, continuity docs, PR review |
| Secondary | Do not primary-dev this repo |

## Repo role

Primary customer-facing FCA web shell: SWA frontend, Azure Functions API, portal/academy continuity, embedded Auricrux surfaces.

Default deploy path: GitHub Actions on `main` — not local-only builds.
