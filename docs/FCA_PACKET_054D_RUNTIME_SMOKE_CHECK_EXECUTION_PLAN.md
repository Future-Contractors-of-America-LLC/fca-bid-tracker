# FCA_PACKET_054D_RUNTIME_SMOKE_CHECK_EXECUTION_PLAN

Status: Active
Classification: Runtime smoke-check execution plan
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `054D`
Next Packet: `054E`
Target Packet: `060A`

---

## Route Set Under Validation
First-wave runtime smoke-check execution remains bounded to:

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

## Repo-Visible Handler Truth
Current inspected handlers prove:

- `/api/projects` returns structured stub responses for `GET` and validated acceptance for `POST`
- `/api/projects/:projectId` returns structured stub responses for `GET` and `PATCH`
- takeoff and RFI child routes return structured stub responses and validated acceptance on `POST`
- all inspected handlers reject missing `projectId` or unsupported methods through structured errors

## Smoke-Check Acceptance Conditions
A smoke-check record may be called passing only if execution proves:

- handler invocation succeeds without crash
- supported methods return structured payloads
- unsupported methods return `METHOD_NOT_ALLOWED`
- route-level error cases stay structured
- no route silently drops packet/timestamp metadata where defined

## Current Blocker
No in-session callable route-execution harness is currently available through the provided tools.

## Safe Next Action
The next valid proof artifact must capture either:

- a workflow-backed test harness added to the repo, or
- a repo-saved script contract that the next callable environment can execute deterministically

## Progress Lock
- Current packet: `054D`
- Next packet: `054E`
- Target packet: `060A`
