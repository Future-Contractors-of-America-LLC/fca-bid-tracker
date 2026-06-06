# Static Web App Runtime Route Reconciliation

_Last updated: 2026-06-06_

## Purpose

This artifact reconciles the route-inspection work against the actual runtime entry path.
It exists because the repository currently contains **two route architectures**:

1. a legacy/demo-style route tree under `src/routes/`
2. the active runtime path driven by `src/main.jsx` -> `src/router.jsx` -> `src/routes.js` -> `src/pages/**`

Without this reconciliation, route audits can accidentally inspect inactive files and report the wrong customer-facing truth.

## Verified Active Runtime Path

Direct runtime inspection confirms the browser entry path is:

- `src/main.jsx`
- `src/router.jsx`
- `src/routes.js`
- `src/pages/website/**`
- `src/pages/portal/**`
- `src/pages/academy/**`

### Evidence
- `src/main.jsx` renders `<Router />`
- `src/router.jsx` imports `routes` from `src/routes.js`
- `src/routes.js` maps live shell paths to `src/pages/**` components

## Verified Inactive-or-Non-Primary Route Surface

The repository also contains:

- `src/routes/index.js`
- `src/routes/public/**`
- `src/routes/entry/**`
- `src/routes/portal/**`

These files may represent a legacy, alternate, or incomplete route surface, but they are **not** the currently verified primary runtime path for the shell loaded by `src/main.jsx`.

## Reconciled Route Inventory Truth

### Canonical routes confirmed in active runtime map (`src/routes.js`)
- `/`
- `/platform`
- `/login`
- `/pricing`
- `/contact`
- `/auricrux`
- `/bid-entry`
- `/bid-status`
- `/portal`
- `/portal/platform`
- `/portal/projects`
- `/portal/files`
- `/portal/messages`
- `/portal/notifications`
- `/portal/bids`
- `/portal/billing`
- `/portal/support`
- `/portal/admin`
- `/portal/profile`
- `/portal/academy`
- `/academy`

## What This Resolves

### Resolved blocker
The earlier route-inventory concern that canonical bid continuity routes were missing from the product shell is **not true for the active runtime path**.

`/bid-entry` and `/bid-status` are present in `src/routes.js` and mapped to:
- `src/pages/website/LegacyBidEntry.jsx`
- `src/pages/website/LegacyBidStatus.jsx`

### Newly visible architecture defect
The real architecture defect is:

**the repository contains duplicate route systems, and prior continuity inspection touched a non-primary route tree rather than the active runtime pages.**

That means future shell-hardening work must be applied against the `src/pages/**` route components unless runtime wiring is intentionally changed.

## Corrected Execution Target

For customer-facing remediation, the priority files are now confirmed to be:

### Website shell
- `src/pages/website/Home.jsx`
- `src/pages/website/Platform.jsx`
- `src/pages/website/Login.jsx`
- `src/pages/website/Pricing.jsx`
- `src/pages/website/Contact.jsx`
- `src/pages/website/Auricrux.jsx`
- `src/pages/website/LegacyBidEntry.jsx`
- `src/pages/website/LegacyBidStatus.jsx`

### Portal shell
- `src/pages/portal/PortalHome.jsx`
- `src/pages/portal/PlatformDashboard.jsx`
- `src/pages/portal/PortalProjects.jsx`
- `src/pages/portal/PortalFiles.jsx`
- `src/pages/portal/PortalMessages.jsx`
- `src/pages/portal/PortalNotifications.jsx`
- `src/pages/portal/PortalBids.jsx`
- `src/pages/portal/PortalBilling.jsx`
- `src/pages/portal/PortalSupport.jsx`
- `src/pages/portal/PortalAdmin.jsx`
- `src/pages/portal/PortalProfile.jsx`

## Founder Action Required

**No** — this is still repo-fixable.

## Next Concrete Action

1. treat `src/pages/**` as the active customer-facing shell
2. validate whether those active pages already satisfy continuity requirements
3. classify the legacy `src/routes/**` tree as:
   - removable
   - deprecable
   - or intentionally retained for a future alternate runtime
4. stop treating inactive placeholder route files as proof of active runtime defects

## Operating Rule

From this point forward, route-quality claims must be tied to the verified runtime path:

`src/main.jsx` -> `src/router.jsx` -> `src/routes.js` -> `src/pages/**`
