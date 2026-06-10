# FCA Packet A Conversion Status

Status: Executed in repo  
Scope: Convert login path toward managed customer account store while preserving seeded fallback

## What changed

- introduced `api/customer-account-store.js`
- customer login now validates against a managed account store sourced from `FCA_CUSTOMER_ACCOUNTS_JSON`
- seeded accounts remain as fallback only when managed accounts are absent or fallback is explicitly allowed
- auth boundary now reports:
  - production readiness
  - managed account mode vs seeded fallback mode
  - seeded fallback enabled state
  - precise next build step
- login UI now authenticates against the API only, instead of silently falling back client-side
- customer session now tracks `accountMode`

## New deployment variables

- `FCA_CUSTOMER_ACCOUNTS_JSON`
  - JSON array of managed customer accounts
  - each account should include at minimum:
    - `email`
    - `passwordHash` or `password`
    - `company`
    - `customerId`
    - `workspaceLabel`
- `FCA_SESSION_SECRET`
  - required to remove fallback-secret mode
- optional: `FCA_ALLOW_SEEDED_LOGIN_FALLBACK`
  - `true` or `false`

## Important truth boundary

Repo logic is now converted for managed customer auth.

However, production auth is only truly ready when:

1. `FCA_CUSTOMER_ACCOUNTS_JSON` is set
2. `FCA_SESSION_SECRET` is set
3. runtime deployment picks up both values

## Safe behavior preserved

- internal seeded validation path can still exist
- login flow was converted without removing current fallback protections
- customer-facing truth surfaces now reflect the actual auth state more honestly
