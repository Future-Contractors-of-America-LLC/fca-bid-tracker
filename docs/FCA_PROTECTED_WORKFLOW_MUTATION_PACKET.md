# FCA Protected Workflow Mutation Packet

## Issue
Protected product pages can now read entitlement-checked backend summaries, but core actions still mostly mutate local shell state only.

That means FCA still lacks truthful backend-backed workflow mutation lanes for:
- bid progression
- project progression
- academy readiness / assignment actions

## Decision
Add protected starter workflow mutation endpoints and frontend mutation plumbing that prefer token-backed backend actions first, then degrade to seeded continuity mode only when true auth is not active.

## Delivered in this packet
1. `api/customer-bid-action.js`
2. `api/customer-project-action.js`
3. `api/customer-academy-action.js`
4. `src/hooks/useProtectedWorkflowMutation.js`
5. `src/components/BidActionCenter.jsx`
6. `src/components/ProjectActionCenter.jsx`
7. `src/components/AcademyReadinessOverlay.jsx`
8. `src/pages/portal/PortalBids.jsx`
9. `src/pages/portal/PortalProjects.jsx`
10. `src/pages/academy/AcademyHome.jsx`

## Resulting behavior
- token-backed sessions can now send protected workflow actions to backend starter endpoints
- seeded sessions remain usable for continuity validation
- UI action centers now surface whether action execution ran through protected backend mode or seeded fallback mode
- local continuity mutations remain in place so visible product progress is preserved even when true auth is unavailable

## Truth boundary
This packet adds **protected workflow mutation starters**, not full production workflow completion.

It does **not** yet provide:
- database-backed bid/project/academy records
- durable backend object persistence
- row-level tenant enforcement on all workflow objects
- universal replacement of local continuity stores
- full LMS learner/progress lifecycle

## Endpoint map
- `POST /api/customer-bid-action`
- `POST /api/customer-project-action`
- `POST /api/customer-academy-action`

Each route requires:
- valid bearer token
- appropriate product entitlement

## Next build step
Highest-value next packet after this one:
- protected persistence packet to move these workflow mutations from starter backend acknowledgements into durable customer-scoped backend state.
