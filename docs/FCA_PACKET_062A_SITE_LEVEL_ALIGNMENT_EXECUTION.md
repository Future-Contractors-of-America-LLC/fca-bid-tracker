# FCA Packet 062A — Site-Level Alignment Execution

## Decision
Repository truth already contains multiple real SaaS and LMS vertical slices. The active defect is not absence of slices; it is site-level alignment drift between website, portal, academy, auth posture, and packaged customer journey.

## Repo-truth correction
The following repo surfaces confirm existing real slices:

- SaaS routes in `src/routes.js`: `/portal/bids`, `/portal/estimates`, `/portal/proposals`, `/portal/projects`, `/portal/files`, `/portal/billing`, `/portal/operations`, `/portal/audit`, `/portal/messages`, `/portal/admin`, `/portal/auricrux`
- LMS routes in `src/routes.js`: `/academy` and `/portal/academy`
- SaaS execution pages in `src/pages/portal/*`: bids, estimates, proposals, projects, files, billing, operations, audit, support, notifications, messages, admin, profile, auricrux
- LMS execution pages in `src/pages/academy/*`: `AcademyHome.jsx`, `AcademyCatalog.jsx`
- Shared session/auth surfaces: `api/customer-login.js`, `api/customer-session.js`, `api/customer-logout.js`, `api/auth-boundary.js`, `api/customer-account-store.js`
- Academy program catalog in `src/academyCatalog.js`

## Site-level alignment problem
Public site, login, portal shell, and academy surfaces are not yet presenting those existing slices as one coherent customer journey.

## Alignment target
A visitor should be able to:

1. understand FCA offer from public website
2. enter real authenticated workspace from login
3. land in a truthful portal home
4. reach real SaaS vertical slices
5. reach real LMS vertical slices
6. understand Auricrux availability across both
7. see product packaging that matches actual reachable routes

## Enforced truth
No future packet may downgrade repo truth by implying SaaS/LMS slices still need to become real. The correct statement is:

- real slices exist in repo truth
- public/site-level packaging and alignment remain incomplete

## Next build step
Execute route-by-route site alignment hardening so website, login, portal, and academy all advertise and deep-link into the already-existing real slices.