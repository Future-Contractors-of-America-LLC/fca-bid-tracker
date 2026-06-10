# FCA Protected Persistence Packet

## Issue
Protected workflow mutations existed, but they only returned starter acknowledgements. They did not update a customer-scoped backend state store that later protected reads could consume.

That left a real truth gap:
- protected actions could run,
- protected reads could run,
- but action results were not feeding back into protected backend state.

## Decision
Add a bounded protected persistence layer that stores customer-scoped SaaS / project / academy state on the backend host filesystem and wire protected reads + writes to it.

## Truth boundary
This is a **backend persistence starter**, not full production persistence.

What it now does:
- creates customer-scoped backend state files per authenticated customer
- lets protected workflow mutations update backend state
- lets protected protected-read endpoints return mutated backend state

What it does **not** yet guarantee:
- durable cloud database persistence across host recycle or multi-instance scale-out
- row-level production tenancy enforcement in a real database
- conflict resolution across concurrent writers
- production-grade audit/event sourcing

## Delivered in this packet
1. `api/lib/persistence/customerStateStore.js`
2. updates to:
   - `api/customer-workspace-summary.js`
   - `api/customer-academy-overview.js`
   - `api/customer-auricrux-guidance.js`
   - `api/customer-bid-action.js`
   - `api/customer-project-action.js`
   - `api/customer-academy-action.js`
3. frontend truth surface updates:
   - `src/hooks/useProtectedProductData.js`
   - `src/components/ProtectedProductDataPanel.jsx`

## Storage model
Backend state is stored by customer id under a host-local persistence directory.

Shape includes:
- `workspace`
- `bids`
- `projects`
- `academy`
- `auricrux`
- `meta`

## Resulting behavior
- protected bid actions now mutate backend bid state
- protected project actions now mutate backend project state
- protected academy actions now mutate backend academy readiness state
- protected SaaS / LMS / Auricrux reads now return persisted backend state when present

## Operational warning
Because this persistence layer is host-local filesystem based, it is truthful only as a **starter persistence layer**.

It is suitable for:
- repo truth improvement
- protected workflow linkage
- local/dev validation
- bounded live-state progression on a single host

It is **not** yet the final persistence architecture for multi-tenant production.

## Next build step
Highest-value next packet after this one:
- replace host-local persistence with a durable database-backed customer state repository and move frontend local continuity stores behind backend authority.
