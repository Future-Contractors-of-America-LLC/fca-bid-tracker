# FCA External Durable State Service Packet

## Issue
The repo now supports `external-durable` repository mode, but the actual service behind `FCA_DURABLE_STATE_API_URL` did not exist in repo truth.

That meant FCA had:
- a durable adapter contract,
- a repository abstraction,
- but no concrete external state service implementation artifact.

## Decision
Add a standalone, database-ready durable state service starter that can sit behind `FCA_DURABLE_STATE_API_URL` and provide customer-scoped state read/write authority.

## Why this packet matters
FCA is required to operate as **one system**, not fragmented applications, and all components must share data and execution flow under Auricrux orchestration. That system-unity requirement is explicit in FCA system definition material. fileciteturn0file3 Durable, tenant-resident memory is also a binding continuity expectation in Auricrux autonomy documentation. fileciteturn0file2turn0file4 This packet creates the concrete service artifact needed to move protected state toward that requirement.

## Truth boundary
This is a **database-ready durable service starter**, not proof that production database persistence is already live.

What this packet now provides:
- an external service implementation artifact,
- customer-scoped `GET` / `PUT` state endpoints,
- API-key protection,
- pluggable repository mode,
- filesystem fallback inside the service,
- clear handoff point for a real database-backed repository.

What it does **not** yet prove:
- production database is connected,
- production durable service is deployed,
- multi-region HA persistence is already active.

## Delivered in this packet
1. `durable-state-service/package.json`
2. `durable-state-service/host.json`
3. `durable-state-service/lib/apiKeyAuth.js`
4. `durable-state-service/lib/defaultState.js`
5. `durable-state-service/lib/repositories/filesystemDurableStateRepository.js`
6. `durable-state-service/lib/repositories/externalDatabaseReadyRepository.js`
7. `durable-state-service/lib/durableStateRepository.js`
8. `durable-state-service/customer-state.js`
9. `durable-state-service/README.md`
10. `durable-state-service/.env.example`

## Service contract
### GET
`GET /api/customer-state/{customerId}`

Headers:
- `x-fca-state-api-key`

Response:
- `200` with canonical customer state when present
- `404` when no state exists yet

### PUT
`PUT /api/customer-state/{customerId}`

Headers:
- `x-fca-state-api-key`
- `content-type: application/json`

Body:
- canonical customer state object

Response:
- `200` with persisted canonical state

## Repository modes inside the service
### `filesystem`
- bounded starter persistence inside service runtime

### `database-ready`
- adapter contract for a real external database gateway
- controlled by env:
  - `FCA_DURABLE_SERVICE_REPOSITORY_MODE=database-ready`
  - `FCA_DATABASE_READY_STATE_API_URL`
  - `FCA_DATABASE_READY_STATE_API_KEY`

## Operational note
This service is intentionally separated from the primary FCA app runtime so customer state authority can move toward a dedicated durable service boundary while preserving repo/deployment clarity.

## Next build step
Highest-value next packet after this one:
- production deployment packet for the durable service, including environment binding, smoke tests, and cutover guidance from `filesystem` to `external-durable` mode.
