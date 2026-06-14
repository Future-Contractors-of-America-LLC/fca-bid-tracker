# FCA_PACKET_059V_AUTH_LOGIN_ROUTE_REMEDIATION

Status: Active
Classification: Auth login route remediation
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `059V`
Next Packet: `059W`
Target Packet: `060A`

---

## Issue
The previous `api/customer-login.js` route was hard-coded to seeded test accounts and emitted a non-canonical cookie shape, which kept the auth boundary in a visibly incomplete state.

## Fix executed
Replaced direct seeded-account logic in `api/customer-login.js` with runtime use of:

- `validateCustomerCredentials()` from `api/customer-account-store.js`
- `createSessionCookie()` from `api/auth-boundary.js`
- `buildServerSession()` from `api/auth-boundary.js`
- `buildAuthBoundary()` from `api/auth-boundary.js`

## Result
The login route now resolves through the shared auth boundary and customer-account store instead of bypassing them.

## Truth boundary
This is a repo-level remediation. Production auth is not yet claimed complete merely because the route now honors the shared auth boundary.

## Progress Lock
- Current packet: `059V`
- Next packet: `059W`
- Target packet: `060A`
