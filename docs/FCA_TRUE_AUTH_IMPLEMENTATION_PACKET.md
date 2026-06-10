# FCA True Auth Implementation Packet

## Issue
FCA currently has seeded login only.

That means:
- no persistent customer user store,
- no hashed password verification against a live user record,
- no signed session token lifecycle,
- no backend identity check for downstream SaaS / LMS surfaces.

## Decision
Build true auth in a bounded sequence without breaking the current seeded validation path.

## This packet adds
1. `api/lib/auth/passwords.js`
   - PBKDF2 password hash generation and verification.
2. `api/lib/auth/sessionTokens.js`
   - signed HMAC session-token issue and verification.
3. `api/lib/auth/customerUserStore.js`
   - environment-backed customer user store reader.
4. `api/customer-auth-login.js`
   - real auth login endpoint against environment-backed user records.
5. `api/customer-auth-session.js`
   - authenticated session introspection endpoint.

## Truth boundary
This packet is **implementation-ready auth scaffolding**, not full production completion.

It improves repo truth by adding:
- hashed-password primitives,
- signed token primitives,
- user-record normalization,
- auth routes that work when environment is configured.

It does **not** yet complete:
- database persistence,
- refresh-token rotation,
- password reset,
- MFA,
- admin user management,
- tenant-wide backend authorization enforcement across all product APIs.

## Environment contract
The new auth packet expects:

- `FCA_AUTH_SESSION_SECRET`
- `FCA_CUSTOMER_USERS_JSON`

### `FCA_CUSTOMER_USERS_JSON` shape
```json
[
  {
    "email": "owner@example.com",
    "passwordHash": "pbkdf2_sha512$120000$base64Salt$base64Hash",
    "company": "Example Contracting",
    "role": "Owner / Admin",
    "customerId": "CUST-EXAMPLE-001",
    "workspaceLabel": "Example Contracting Workspace",
    "selectedPlan": "enterprise",
    "enabledProducts": {
      "saas": true,
      "lms": true,
      "auricrux": true
    },
    "enabledComms": {
      "chat": true,
      "sms": true,
      "phone": true,
      "email": true,
      "teams": true,
      "conference": true,
      "lecture": true
    },
    "status": "active"
  }
]
```

## Request / response contract

### POST `/api/customer-auth-login`
Request:
```json
{
  "email": "owner@example.com",
  "password": "plain-text-password"
}
```

Success response:
```json
{
  "ok": true,
  "account": {
    "email": "owner@example.com",
    "company": "Example Contracting",
    "role": "Owner / Admin",
    "customerId": "CUST-EXAMPLE-001",
    "workspaceLabel": "Example Contracting Workspace",
    "selectedPlan": "enterprise",
    "enabledProducts": {
      "saas": true,
      "lms": true,
      "auricrux": true
    },
    "enabledComms": {
      "chat": true,
      "sms": true,
      "phone": true,
      "email": true,
      "teams": true,
      "conference": true,
      "lecture": true
    },
    "authVersion": "customer-auth-v1"
  },
  "token": "signed-session-token",
  "authenticationMode": "env-backed-customer-auth"
}
```

### GET `/api/customer-auth-session`
Header:
```txt
Authorization: Bearer <token>
```

Returns current authenticated customer account if token is valid.

## Build sequence after this packet
1. Wire login page to prefer `/api/customer-auth-login`.
2. Persist token in customer session state.
3. Add token-based session bootstrap on app load.
4. Protect portal/LMS API calls with server-side token verification.
5. Replace environment JSON store with database-backed customer user store.
6. Add customer admin UI for password reset / invite / activation.

## Acceptance criteria
- repo contains true auth primitives rather than seeded-only validation,
- backend can verify hashed passwords when environment is configured,
- backend can issue signed session tokens,
- backend can resolve current customer session from bearer token,
- seeded login may remain temporarily for validation continuity, but true auth path now exists in repo truth.
