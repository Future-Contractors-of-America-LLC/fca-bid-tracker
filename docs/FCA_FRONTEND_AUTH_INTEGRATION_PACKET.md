# FCA Frontend Auth Integration Packet

## Issue
The repo now contains backend starter auth routes, but the frontend still behaves like a seeded-login-first shell.

That leaves drift between:
- repo auth capability,
- login UX,
- session truth,
- live customer route protection.

## Decision
Promote the frontend to prefer true auth first, then degrade to seeded auth only when true auth is not configured or unavailable.

## Delivered in this packet
1. `src/customerSession.js`
   - token support added to customer session persistence.
2. `src/hooks/useCustomerSession.js`
   - session bootstrap now validates token-backed auth against `/api/customer-auth-session`.
   - invalid/expired token is cleared automatically.
3. `src/pages/website/Login.jsx`
   - login now tries `/api/customer-auth-login` first.
   - falls back to seeded auth only if true auth is unavailable or returns non-production config states.
   - preserves authentication mode so UI truth stays bounded.

## Resulting behavior
- If true auth is configured, frontend uses the real auth path.
- If true auth is not configured, seeded login still works for validation continuity.
- On reload, token-backed sessions are checked against the backend session endpoint.
- Invalid token sessions are removed instead of silently persisting fake auth continuity.

## Truth boundary
This improves repo truth substantially, but still does **not** equal full production auth completion.

Still missing:
- database-backed customer users,
- cookie/session hardening,
- refresh token rotation,
- password reset,
- invite flow,
- MFA,
- server-side authorization enforcement for all downstream APIs.

## Acceptance criteria
- login page prefers `/api/customer-auth-login`,
- seeded fallback remains bounded and explicit,
- token is persisted in customer session state,
- app startup can restore token-backed session through `/api/customer-auth-session`,
- invalid token sessions are cleared automatically,
- claims remain truthful when true auth env is not configured.

## Next build step
Next highest-value packet:
- server-side entitlement enforcement for SaaS / Academy / Auricrux APIs and route-facing data surfaces.
