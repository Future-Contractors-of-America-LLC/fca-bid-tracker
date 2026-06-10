# FCA Login + Product Truth Artifact

## Issue
User validation found three real problems:

1. There is no true customer login beyond preloaded seeded/demo accounts.
2. Much of the shell feels informational rather than product-functional.
3. Mobile navigation is layering over page content instead of behaving like a page-native nav.

## Verified Repo Truth

### Login truth
- `api/customer-login.js` only resolves a seeded account from `resolveSeededCustomerAccount(...)`.
- There is no database-backed user lookup.
- There is no password hash verification.
- There is no token issuance.
- There is no backend session persistence.
- There is no RBAC enforcement beyond client-side route/session checks.

### Product truth
- `/portal/projects` has real client-side state mutations backed by local persistence for project selection, stage advancement, and permit-blocker clearing.
- Portal routes appear to have some functional local-state workflow behavior.
- `/academy` is presently a structured LMS shell/catalog/continuity surface, but it is still mostly content and navigation rather than a true learner/course/progress system.
- The current login path can open SaaS, Academy, and Auricrux routes, but that is not the same as a production SaaS + LMS + identity system.

### Navigation truth
- `src/components/PublicTopNav.jsx` used a sticky nav shell with elevated z-index across all screen sizes.
- On mobile this creates the exact failure mode the user reported: the nav behaves like an overlay layer instead of a page-native header block.

## Fix Applied In This Branch
- Mobile nav shell changed from sticky to page-native relative positioning on small screens.
- Desktop retains sticky behavior.
- This is a bounded UX correction only; it does not claim completion of auth or LMS productization.

## Risk
If left unchanged:
- users will continue interpreting the product as brochureware,
- login claims will continue outrun actual auth truth,
- Academy will continue read as a marketing shell instead of LMS utility,
- mobile trust will remain degraded.

## Required Next Build Steps

### 1. True login packet
Build real auth, not seeded auth only:
- customer user table
- password hashing
- login API against persistent store
- signed session or token issuance
- logout invalidation
- backend entitlement lookup
- route/API enforcement by entitlement

### 2. SaaS truth packet
Strengthen the flagship product spine:
- lead/opportunity intake
- qualification record creation
- project/workspace object creation
- file upload + evidence attachment
- estimate/bid workflow mutations
- audit trail persistence

### 3. LMS truth packet
Convert Academy from continuity shell to LMS surface:
- learner objects
- enrollments
- course/module objects
- assignment actions
- progress state
- completions/certificates
- manager/customer view

### 4. Cross-product launch packet
After true auth exists:
- single customer account
- one entitlement model
- launch into SaaS, LMS, Auricrux from authenticated workspace hub
- truthful access-denied and upgrade paths

## Claim Boundary
Current repo state supports:
- seeded test login,
- client-side protected routing,
- local-session product access flags,
- some local-state SaaS workflow behavior.

Current repo state does **not** yet support:
- production authentication,
- production LMS behavior,
- production multi-tenant entitlement enforcement,
- backend-grade SaaS persistence across customer entities.
