# FCA Auth Boundary Alignment Status

Status: Executed in branch `auricrux/auth-boundary-alignment`
Scope: Login path reconciliation with the current server-session auth boundary

## Verified current state before change

- `api/customer-session.js` already reads the signed `fca_session` cookie through `auth-boundary.js`.
- `api/customer-logout.js` already clears the signed `fca_session` cookie through `clearSessionCookie()`.
- `api/customer-account-store.js` already supports managed accounts plus seeded fallback.
- `api/customer-auth-state.js` already reports current auth-boundary readiness.
- `api/customer-login.js` was still using an older isolated flow with:
  - a different cookie name (`fca_customer_session`)
  - an unsigned base64 token
  - hardcoded seeded accounts
  - CommonJS-style handler logic inconsistent with the rest of the active API surface

## What this branch changes

- aligns `api/customer-login.js` with the active auth boundary
- authenticates through `validateCustomerCredentials()`
- issues the signed `fca_session` cookie through `createSessionCookie()`
- returns the same session/account shape expected by the current frontend login flow
- removes duplicate hardcoded account logic from the login handler

## Why this matters

Without this alignment, login success and session hydration could drift:

- login could appear successful while `/api/customer-session` could not validate the issued cookie
- managed customer accounts could exist in repo logic but never actually be used by the login route
- auth readiness reporting would diverge from the real login path

## Next recommended packet

- verify live runtime is loading the aligned login route in Azure
- then continue Packet D: page-native hierarchy and shell cleanup on top of the now-aligned SaaS + LMS + auth spine
