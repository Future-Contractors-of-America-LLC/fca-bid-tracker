# Active Runtime Shell Validation

_Last updated: 2026-06-06_

## Purpose

This document records continuity validation against the **actual active runtime shell** rather than the duplicate legacy route tree.

It exists to keep Static Web App hardening attached to the pages that are truly rendered by:

- `src/main.jsx`
- `src/router.jsx`
- `src/routes.js`
- `src/pages/**`

## Validation Scope Completed In This Pass

### Verified runtime entry chain
- `src/main.jsx`
- `src/router.jsx`
- `src/routes.js`

### Verified active website shell example
- `src/pages/website/Home.jsx`

### Verified active portal shell example
- `src/pages/portal/PortalHome.jsx`

## Verified Findings

### 1. Active runtime home shell is continuity-grade
Direct inspection of `src/pages/website/Home.jsx` confirms the active home route already includes:

- branded shell framing through `ShellHeader`, `ShellFooter`, and FCA/Auricrux brand marks
- founder journey and trust panels
- public operations strip continuity
- workspace snapshot continuity
- public surface CTA cards
- canonical bid-route CTA references
- legacy compatibility CTA references

### 2. Active runtime portal home shell is continuity-grade
Direct inspection of `src/pages/portal/PortalHome.jsx` confirms the active portal route already includes:

- persisted overview state reporting
- portal continuity strip
- workspace quick actions
- Auricrux next-action section
- active tenant/project context
- connected workspace flow
- project snapshot continuity
- recent workspace signal continuity

### 3. Active runtime shell quality is stronger than the duplicate route tree suggested
The duplicate `src/routes/**` tree contained placeholder-style surfaces, but the active runtime shell in `src/pages/**` already carries real continuity architecture and customer-facing structure.

## Corrected Quality Read

### Verified strong surfaces now
- `/` via `src/pages/website/Home.jsx`
- `/portal` via `src/pages/portal/PortalHome.jsx`

These active routes should be treated as **validated continuity-grade runtime surfaces**.

### Still requiring direct active-runtime validation
The following active runtime pages still need direct page-file review in the same way:

#### Website pages
- `src/pages/website/Platform.jsx`
- `src/pages/website/Login.jsx`
- `src/pages/website/Pricing.jsx`
- `src/pages/website/Contact.jsx`
- `src/pages/website/Auricrux.jsx`
- `src/pages/website/LegacyBidEntry.jsx`
- `src/pages/website/LegacyBidStatus.jsx`

#### Portal pages
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

## What This Means Operationally

### Resolved misconception
The active runtime shell is **not** broadly a demo-placeholder shell.
At least the verified home and portal-home runtime pages already show continuity-grade implementation.

### Remaining task
The job now is to finish direct validation across the remaining `src/pages/**` surfaces and identify whether any of them still lag behind the quality already present in `Home.jsx` and `PortalHome.jsx`.

## Founder Action Required

**No** — this remains repo-verifiable and repo-fixable.

## Next Concrete Action

Continue active-runtime validation in this order:

1. `src/pages/website/Platform.jsx`
2. `src/pages/website/Login.jsx`
3. `src/pages/website/Pricing.jsx`
4. `src/pages/website/Contact.jsx`
5. `src/pages/website/Auricrux.jsx`
6. `src/pages/website/LegacyBidEntry.jsx`
7. `src/pages/website/LegacyBidStatus.jsx`
8. `src/pages/portal/PlatformDashboard.jsx`
9. remaining portal pages

## Operating Rule

Do not let inactive placeholder files under `src/routes/**` overstate runtime defects.
Validate customer-facing quality against the active runtime pages under `src/pages/**` first.