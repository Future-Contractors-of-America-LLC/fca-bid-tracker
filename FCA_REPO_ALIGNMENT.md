# FCA Repo Alignment

## Purpose

This file aligns `fca-bid-tracker` with the canonical FCA governance and continuity model.
`fca-bid-tracker` is the primary customer-facing shell and should reflect the same law, build order, and no-gap rules defined in `auricrux-central`.

## Canonical Governance Source

The governing source of truth is in `Future-Contractors-of-America-LLC/auricrux-central`:

- `FCA_SYSTEM_LAW.md`
- `FCA_BUILD_SEQUENCE.md`
- `FCA_RUNTIME_TRIGGER_CATALOG.md`
- `FCA_COVERAGE_MATRIX.md`
- `FCA_SYSTEM_INVENTORY.md`

## This Repo's Role

`fca-bid-tracker` is the primary active product shell for:

- public website conversion paths
- bid workspace continuity
- portal routes
- academy integration
- communications surfaces
- customer-visible operating continuity

## Platform Boundary For This Repo

`fca-bid-tracker` is the FCA web shell, not the entire FCA runtime.

This repo is the correct place for:

- Azure Static Web App frontend surfaces
- public marketing pages
- login and activation routes
- customer portal and contractor workspace UI
- route continuity and client-side flow enforcement
- customer-visible Auricrux assistance surfaces

This repo is not the right place to treat as the entire system of record for:

- durable workflow execution
- cross-object lifecycle orchestration
- authoritative business logic
- long-running automation
- canonical file/evidence processing
- full audit and correction enforcement

Those capabilities require a real backend execution layer and structured storage spine.

## Alignment Rules For This Repo

0. Machine and deploy boundaries: see `docs/THREE_MACHINE_WORKLOAD_MAP.md` (canonical copy in `auricrux-central/docs/`)
1. Public routes should remain customer-friendly, coherent, and conversion-safe
2. Portal, academy, comms, and public website surfaces should behave as one FCA system
3. New UX work should prefer shared components, shared state, and route continuity over isolated page edits
4. Product changes should move toward Project / File / Audit spine completeness rather than disconnected features
5. Auricrux should remain embedded as operating intelligence without degrading usability
6. Static Web App hosting may remain the frontend platform, but must not be mistaken for the full FCA application runtime
7. New product work should assume a split architecture: web shell here, execution spine in backend services

## Immediate Continuity Priorities

The highest-value continuity work in this repo remains:

- public-to-portal CTA consistency
- project/job anchoring in customer workflows
- file/evidence surface readiness
- academy linkage from operational next actions
- customer-visible continuity across messages, billing, support, and platform state
- explicit handoff boundaries between frontend shell and backend execution spine

## Execution Guard

If a change improves appearance but weakens continuity, traceability, routing, customer comprehension, or backend handoff clarity, it should be re-scoped before merge.
