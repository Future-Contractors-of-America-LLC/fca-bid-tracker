# FCA Server-Side Entitlement Enforcement Packet

## Issue
Frontend auth now prefers true auth, but downstream route-facing APIs still lack a standard server-side entitlement gate.

That creates a truth gap:
- login can be token-backed,
- frontend can know product flags,
- but API surfaces can still return protected data without enforcing authenticated product access.

## Decision
Add a reusable backend entitlement gate and protected starter APIs for the three flagship product surfaces:
- SaaS workspace
- Academy / LMS
- Auricrux guidance

## Delivered in this packet
1. `api/lib/auth/requestAuth.js`
   - bearer-token extraction
   - session verification
   - standard unauthorized response
2. `api/lib/auth/entitlements.js`
   - product normalization
   - product access evaluation
   - standard forbidden response
3. `api/customer-workspace-summary.js`
   - authenticated SaaS workspace summary endpoint
4. `api/customer-academy-overview.js`
   - authenticated LMS overview endpoint
5. `api/customer-auricrux-guidance.js`
   - authenticated Auricrux guidance endpoint

## Resulting behavior
- protected APIs now verify bearer token server-side
- product access is enforced server-side per endpoint
- unauthenticated requests receive `401`
- authenticated but unauthorized requests receive `403`
- responses return bounded account/product truth instead of relying only on frontend route checks

## Truth boundary
This packet adds **real server-side entitlement enforcement primitives** for starter product APIs.

It does **not** yet complete:
- universal enforcement across every API in the repo
- database-backed entitlements
- token revocation lists
- tenant-wide row-level authorization
- backend mutation enforcement across all workflow endpoints

## Endpoint map

### SaaS
`GET /api/customer-workspace-summary`
- requires valid bearer token
- requires `enabledProducts.saas === true`

### Academy / LMS
`GET /api/customer-academy-overview`
- requires valid bearer token
- requires `enabledProducts.lms === true`

### Auricrux
`GET /api/customer-auricrux-guidance`
- requires valid bearer token
- requires `enabledProducts.auricrux === true`

## Response posture
### Unauthorized
```json
{
  "ok": false,
  "error": "Bearer token is required."
}
```

### Forbidden
```json
{
  "ok": false,
  "error": "Customer does not have LMS access.",
  "requiredProduct": "lms"
}
```

### Allowed
Returns customer-scoped surface data shaped for the entitled product lane.

## Next build step
Highest-value next packet after this one:
- connect the frontend portal/platform/academy surfaces to these protected APIs so visible product truth comes from entitlement-checked backend responses instead of route shell state alone.
