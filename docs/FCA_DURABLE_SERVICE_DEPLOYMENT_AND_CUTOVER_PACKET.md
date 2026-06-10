# FCA Durable State Service Deployment and Cutover Packet

## Issue
The repo now contains:
- a durable repository abstraction,
- an external durable adapter path,
- and a durable state service starter.

But it still lacked the next required execution artifact:
- deployment packet,
- cutover sequence,
- validation gates,
- and repo-to-live truth controls for switching from bounded filesystem mode to durable external mode.

That gap matters because FCA must operate as **one system** with shared data, shared logic, and shared execution flow rather than disconnected surfaces. fileciteturn2file5turn2file12 Auricrux is also required to maintain durable, tenant-resident memory and autonomous continuity rather than relying on ephemeral interface state. fileciteturn2file9turn0file4

## Decision
Add an explicit deployment and cutover packet that makes the durable service operationally installable, verifiable, and switchable with bounded rollback.

## Truth boundary
This packet is **deployment-ready governance + validation scaffolding**.

It does:
- define exact service env contracts,
- define cutover order,
- define rollback order,
- define validation witnesses,
- add repo scripts to validate durable-service deployment artifacts.

It does **not** prove:
- production env vars are already present,
- the external durable state service is already deployed,
- production has already been cut over.

## Deployment target model
Per the FCA integration map, compute remains in Azure / Baguba execution surfaces while FCA remains the data authority. Cross-tenant data access must preserve correct tenant binding and prevent drift. fileciteturn2file14turn2file15 This packet keeps that posture by treating the durable service as a controlled external state authority rather than as ad hoc state inside the frontend shell.

## Required deployment order

### Stage 1 — Durable service deployment
Deploy `durable-state-service` with:
- `FCA_DURABLE_STATE_SERVICE_API_KEY`
- `FCA_DURABLE_SERVICE_REPOSITORY_MODE`
- optional `FCA_DURABLE_SERVICE_STATE_DIR`
- optional database-ready env if upstream durable DB authority exists

### Stage 2 — Durable service smoke verification
Verify:
- `GET /api/customer-state/{customerId}` returns `404` before seed
- `PUT /api/customer-state/{customerId}` persists canonical state
- follow-up `GET` returns the same state

### Stage 3 — App-side external durable config
Set app runtime env:
- `FCA_STATE_REPOSITORY_MODE=external-durable`
- `FCA_DURABLE_STATE_API_URL=<durable-service-url>`
- `FCA_DURABLE_STATE_API_KEY=<shared-service-key>`

### Stage 4 — Protected read/write verification
Verify from app runtime:
- `/api/customer-workspace-summary`
- `/api/customer-academy-overview`
- `/api/customer-auricrux-guidance`
- `/api/customer-bid-action`
- `/api/customer-project-action`
- `/api/customer-academy-action`

All must report repository mode as `external-durable` after cutover.

## Rollback order
If cutover fails:
1. keep durable service deployed
2. switch app env back to `FCA_STATE_REPOSITORY_MODE=filesystem`
3. redeploy app runtime
4. verify protected routes recover in filesystem mode

Do **not** remove the durable service first. Remove the app dependency first.

## Validation rules
No cutover is complete until all are true:
- durable service reachable
- app auth intact
- protected reads succeed
- protected writes succeed
- repository mode visible as `external-durable`
- no seeded-only fallback is silently masking durable-mode failure

## Artifact output rule
This packet adds:
- deployment env example
- cutover checklist
- validation script
- report generator
- workflow artifact for durable-service validation

That satisfies the system-law requirement that no step is complete without output. fileciteturn2file2turn2file3

## Next build step
After this packet, the next high-priority packet is:
- **production durable service live-state verification packet**

That packet should verify actual deployment truth rather than repo truth only.
