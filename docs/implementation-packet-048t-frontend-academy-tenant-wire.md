# Implementation Packet 048T Frontend Wire — Academy Tenant Identity Propagation

## Classification
Repo-ready frontend wire packet.

## Issue
The backend Academy LMS API can support tenant-backed state, but the frontend was still calling `/api/academy-lms` without explicit tenant identity. That would leave tenant isolation relying on fallback defaults rather than real session identity.

## Fix
This packet wires Academy API calls to current customer session identity by pushing:

- `customerId`
- `customerName`
- `X-FCA-Customer-Id`
- `X-FCA-Customer-Name`

through both GET and PATCH Academy requests.

## Files
- `src/api/academyClient.js`
- `scripts/verify-real-lms-depth.mjs`

## Truth boundary
This packet upgrades frontend repo truth only. It depends on the backend Academy LMS API packet being merged and deployed before live end-to-end behavior can be claimed.

## Validation target
- Academy client reads current customer session.
- Academy GET carries tenant query and headers.
- Academy PATCH carries tenant body and headers.
- Validator enforces tenant-wire presence.

## Next recommended packet
Packet 048U — replace remaining browser-local transcript / cohort / credential surfaces with API-backed reads and mutations so Academy truth converges on one durable spine.
