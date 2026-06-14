# FCA_PACKET_053T_ROUTE_SMOKE_CHECK_PACKET

Status: Active
Classification: First-wave route smoke-check packet
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `053T`
Next Packet: `053U`
Target Packet: `060A`

---

## Smoke-Check Route Targets
The first-wave runtime route set currently requires smoke-check coverage for:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `GET /api/projects/:projectId/takeoffs`
- `POST /api/projects/:projectId/takeoffs`
- `GET /api/projects/:projectId/rfis`
- `POST /api/projects/:projectId/rfis`
- `GET /api/auricrux/actions`
- `POST /api/auricrux/actions`

## Repo-Visible Truth
Current route files exist for the first-wave targets.
Current `projects` handlers return structured stub payloads and explicit `notYetImplemented` markers.

## Smoke-Check Acceptance Intent
A smoke-check result may only be called passing if all tested routes:

- respond on supported methods
- reject unsupported methods with structured errors
- preserve packet/timestamp metadata where defined
- avoid silent runtime crashes

## Not Yet Repo-Proven
- actual route invocation results
- route-level runtime stability under execution
- payload parity under all supported methods

## Progress Lock
- Current packet: `053T`
- Next packet: `053U`
- Target packet: `060A`
