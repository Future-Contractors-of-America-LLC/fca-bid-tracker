# 062A Login-to-Workspace Alignment

## Existing truth
- `api/customer-login.js` validates credentials and issues a signed cookie
- `api/customer-session.js` restores authenticated session state
- `api/customer-logout.js` clears the cookie
- `src/customerSession.js` resolves protected routes and product access

## Alignment requirement
Successful login must route users into a workspace that clearly exposes:

- SaaS path: bids, estimates, proposals, projects, files, billing
- LMS path: academy
- Auricrux path: `/portal/auricrux`

## Defect to avoid
A technically valid login that lands users in a shell-like or ambiguous surface is still a product-alignment failure.