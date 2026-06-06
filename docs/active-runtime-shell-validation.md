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

### Verified active website shell pages
- `src/pages/website/Home.jsx`
- `src/pages/website/Platform.jsx`
- `src/pages/website/Login.jsx`
- `src/pages/website/Pricing.jsx`
- `src/pages/website/Contact.jsx`
- `src/pages/website/Auricrux.jsx`
- `src/pages/website/LegacyBidEntry.jsx`
- `src/pages/website/LegacyBidStatus.jsx`

### Verified active portal shell pages
- `src/pages/portal/PortalHome.jsx`
- `src/pages/portal/PlatformDashboard.jsx`

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

### 2. Active runtime platform shell is continuity-grade
Direct inspection of `src/pages/website/Platform.jsx` confirms:

- shell header and footer continuity
- platform-specific continuity strip
- founder journey continuity
- executive signal bar
- product-module cards
- linked product-area routing
- public proof of workspace continuity through dashboard CTA flow

### 3. Active runtime login shell is continuity-grade
Direct inspection of `src/pages/website/Login.jsx` confirms:

- live customer session handling and protected-route continuity
- workspace continuity strip
- persisted post-login routing behavior
- visible downstream portal/platform/academy destinations
- workspace module previews
- route-local CTA continuity without dead-end form posture

### 4. Active runtime pricing shell is continuity-grade
Direct inspection of `src/pages/website/Pricing.jsx` confirms:

- rollout-oriented pricing framing rather than detached brochure posture
- pricing continuity strip
- commercial readiness panel
- rollout checklist and pricing tiers
- shared conversion CTA posture into contact and platform review

### 5. Active runtime contact shell is continuity-grade
Direct inspection of `src/pages/website/Contact.jsx` confirms:

- contact continuity strip
- walkthrough and rollout framing tied to real operating context
- workspace snapshot continuity
- structured contact-path cards
- shared conversion posture rather than generic inquiry-page behavior

### 6. Active runtime Auricrux shell is continuity-grade
Direct inspection of `src/pages/website/Auricrux.jsx` confirms:

- shell-consistent Auricrux framing
- Auricrux continuity strip
- executive signal bar and founder journey continuity
- capability deck, command layer framing, and walkthrough path
- linkage into platform dashboard and rollout routes

### 7. Active runtime bid bridge routes are continuity-grade compatibility surfaces
Direct inspection of `src/pages/website/LegacyBidEntry.jsx` and `src/pages/website/LegacyBidStatus.jsx` confirms:

- canonical bid shorthand routes are present in the active runtime map
- each route uses `LegacyRouteBridge`
- each route explicitly forwards into the compatible customer-facing bid intake/status surfaces
- companion links preserve movement between bid intake and bid status rather than dead-ending

This means `/bid-entry` and `/bid-status` are valid continuity bridges in the active runtime shell, even though they are compatibility-style routes rather than full native workspace pages.

### 8. Active runtime portal home shell is continuity-grade
Direct inspection of `src/pages/portal/PortalHome.jsx` confirms the active portal route already includes:

- persisted overview state reporting
- portal continuity strip
- workspace quick actions
- Auricrux next-action section
- active tenant/project context
- connected workspace flow
- project snapshot continuity
- recent workspace signal continuity

### 9. Active runtime platform dashboard is continuity-grade
Direct inspection of `src/pages/portal/PlatformDashboard.jsx` confirms:

- persisted workspace dashboard state
- workspace quick actions
- recommended next step and current blocker visibility
- platform metrics
- workspace summary and Auricrux guidance sections
- automation/system-status card
- operational cards linking into portal/workspace sub-surfaces
- recent update continuity

### 10. Active runtime shell quality is stronger than the duplicate route tree suggested
The duplicate `src/routes/**` tree contained placeholder-style surfaces, but the active runtime shell in `src/pages/**` already carries real continuity architecture and customer-facing structure.

## Corrected Quality Read

### Verified strong surfaces now
- `/` via `src/pages/website/Home.jsx`
- `/platform` via `src/pages/website/Platform.jsx`
- `/login` via `src/pages/website/Login.jsx`
- `/pricing` via `src/pages/website/Pricing.jsx`
- `/contact` via `src/pages/website/Contact.jsx`
- `/auricrux` via `src/pages/website/Auricrux.jsx`
- `/bid-entry` via `src/pages/website/LegacyBidEntry.jsx`
- `/bid-status` via `src/pages/website/LegacyBidStatus.jsx`
- `/portal` via `src/pages/portal/PortalHome.jsx`
- `/portal/platform` via `src/pages/portal/PlatformDashboard.jsx`

These active routes should be treated as **validated continuity-grade runtime surfaces**.

### Still requiring direct active-runtime validation
The following active runtime pages still need direct page-file review in the same way:

#### Portal pages
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

### Resolved misconceptions
- The active runtime shell is **not** broadly a demo-placeholder shell.
- Canonical bid continuity routes are present and valid in the active runtime path.
- The active platform dashboard already carries continuity-grade operational context.

### Remaining task
The job now is to finish direct validation across the remaining active portal sub-surfaces and identify whether any of them lag behind the quality already present in the validated website shell, portal home, and platform dashboard.

## Founder Action Required

**No** — this remains repo-verifiable and repo-fixable.

## Next Concrete Action

Continue active-runtime validation in this order:

1. `src/pages/portal/PortalProjects.jsx`
2. `src/pages/portal/PortalFiles.jsx`
3. `src/pages/portal/PortalMessages.jsx`
4. `src/pages/portal/PortalNotifications.jsx`
5. `src/pages/portal/PortalBids.jsx`
6. `src/pages/portal/PortalBilling.jsx`
7. `src/pages/portal/PortalSupport.jsx`
8. `src/pages/portal/PortalAdmin.jsx`
9. `src/pages/portal/PortalProfile.jsx`

## Operating Rule

Do not let inactive placeholder files under `src/routes/**` overstate runtime defects.
Validate customer-facing quality against the active runtime pages under `src/pages/**` first.