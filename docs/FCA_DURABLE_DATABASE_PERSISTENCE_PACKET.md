# FCA Durable Database Persistence Packet

## Issue
The protected persistence packet created customer-scoped backend state, but it is still stored on host-local filesystem.

That means repo truth improved, but production truth is still constrained by:
- host recycle risk,
- single-instance assumptions,
- lack of durable multi-tenant backing store,
- lack of deploy-safe persistence authority.

## Decision
Introduce a durable-repository abstraction and a database-ready external state adapter so FCA can move protected state authority off host-local storage and onto a durable backing system.

## Truth boundary
This packet is **database-ready infrastructure and integration scaffolding**, not proof that a production database is already connected.

What it now does:
- introduces a repository abstraction for customer state
- preserves existing filesystem fallback for bounded continuity
- adds an external durable state adapter path for database-backed persistence through a configured persistence service
- updates protected reads/writes to use repository authority instead of directly depending on host-local storage implementation

What it does **not** yet prove by itself:
- an actual production database is already configured
- the external persistence service is already deployed
- multi-instance durability is already live in production

## Repository modes
### 1. `filesystem`
- existing host-local fallback
- bounded continuity only

### 2. `external-durable`
- uses configured persistence service endpoint
- intended to be backed by a real database outside this repo runtime

## Required environment for durable mode
- `FCA_STATE_REPOSITORY_MODE=external-durable`
- `FCA_DURABLE_STATE_API_URL`
- `FCA_DURABLE_STATE_API_KEY`

## Durable state API contract
### GET
`GET {FCA_DURABLE_STATE_API_URL}/customer-state/{customerId}`

Headers:
- `x-fca-state-api-key`

### PUT
`PUT {FCA_DURABLE_STATE_API_URL}/customer-state/{customerId}`

Headers:
- `x-fca-state-api-key`
- `content-type: application/json`

Body:
- canonical customer state object

## Delivered in this packet
1. `api/lib/persistence/repositories/filesystemCustomerStateRepository.js`
2. `api/lib/persistence/repositories/externalDurableCustomerStateRepository.js`
3. `api/lib/persistence/customerStateRepository.js`
4. `api/lib/persistence/customerStateStore.js` updated to route through repository abstraction
5. protected read/write endpoints updated to expose repository mode truth

## Resulting behavior
- repo now has a durable persistence integration path
- protected endpoints no longer depend directly on one storage mechanism
- production can switch from filesystem fallback to durable backing store by environment config
- visible product truth can distinguish fallback mode from durable-repository mode

## Operational note
This is the correct bounded step when direct database provisioning is not confirmed in-session.
It removes architectural lock-in to host-local storage and creates the clean handoff point for real durable database authority.

## Next build step
Highest-value next packet after this one:
- implement or connect the actual durable state service backed by a production database and then flip production to `external-durable` mode.
