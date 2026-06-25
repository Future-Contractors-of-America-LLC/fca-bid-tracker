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
- `src/pages/portal/PortalProjects.jsx`
- `src/pages/portal/PortalFiles.jsx`
- `src/pages/portal/PortalMessages.jsx`
- `src/pages/portal/PortalNotifications.jsx`
- `src/pages/portal/PortalBids.jsx`
- `src/pages/portal/PortalBilling.jsx`
- `src/pages/portal/PortalSupport.jsx`
- `src/pages/portal/PortalAdmin.jsx`
- `src/pages/portal/PortalProfile.jsx`

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

### 10. Active runtime project flow page is continuity-grade
Direct inspection of `src/pages/portal/PortalProjects.jsx` confirms:

- project route is anchored to live workspace state through `SystemStateSummary`
- persisted project-state reporting is present
- current project root and lifecycle framing are visible
- project cards preserve stage, owner, due date, and next-action continuity

### 11. Active runtime file route is continuity-grade
Direct inspection of `src/pages/portal/PortalFiles.jsx` confirms:

- file route reads from canonical tenant/project/workspace/Auricrux state
- portal coordination CTA continuity is present
- file-spine context is made explicit
- `ProjectFileAuditPanel` keeps files and audit events attached to project continuity

### 12. Active runtime message route is continuity-grade
Direct inspection of `src/pages/portal/PortalMessages.jsx` confirms:

- persisted message continuity state is present
- message route is tied to current next action and blocker state
- build-expansion/continuity deck is embedded
- message stream is connected to downstream billing and academy CTA progression

### 13. Active runtime notifications route is continuity-grade
Direct inspection of `src/pages/portal/PortalNotifications.jsx` confirms:

- notifications unify customer session continuity, project audit events, messages, and Auricrux guidance
- persisted notification state is present
- notification continuity summarizes blocker, recommended move, and next action in one route

### 14. Active runtime bids route is continuity-grade
Direct inspection of `src/pages/portal/PortalBids.jsx` confirms:

- bid approval state reads from canonical operating state
- bid route is explicitly connected to project conversion context
- approval continuity focus is visible through next action, blocker, and downstream impact
- route-local CTA movement into bid-entry and billing/messages continuity is present

### 15. Active runtime billing route is continuity-grade
Direct inspection of `src/pages/portal/PortalBilling.jsx` confirms:

- billing reads from live workspace state
- billing continuity strip ties portal finance back to pricing/contact conversion posture
- persisted billing state and revenue continuity focus are explicit
- billing queue is presented alongside narrative linkage into academy, pricing, and contact next steps

### 16. Active runtime support route is continuity-grade
Direct inspection of `src/pages/portal/PortalSupport.jsx` confirms:

- support route is attached to canonical operating state
- support continuity is branded and tied to tenant/project context
- escalation lanes and support narrative stay inside the same workspace shell

### 17. Active runtime admin route is continuity-grade
Direct inspection of `src/pages/portal/PortalAdmin.jsx` confirms:

- admin route reads from canonical control state
- governance continuity is branded and route-local
- seat readiness, rollout state, and governance visibility are surfaced as part of one shell

### 18. Active runtime profile route is continuity-grade
Direct inspection of `src/pages/portal/PortalProfile.jsx` confirms:

- profile route binds authenticated session identity to tenant/project/Auricrux context
- persisted profile state is present
- the profile icon destination is a real customer-facing operating surface rather than a dead-end stub

### 19. Active runtime shell quality is stronger than the duplicate route tree suggested
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
- `/portal/projects` via `src/pages/portal/PortalProjects.jsx`
- `/portal/files` via `src/pages/portal/PortalFiles.jsx`
- `/portal/messages` via `src/pages/portal/PortalMessages.jsx`
- `/portal/notifications` via `src/pages/portal/PortalNotifications.jsx`
- `/portal/bids` via `src/pages/portal/PortalBids.jsx`
- `/portal/billing` via `src/pages/portal/PortalBilling.jsx`
- `/portal/support` via `src/pages/portal/PortalSupport.jsx`
- `/portal/admin` via `src/pages/portal/PortalAdmin.jsx`
- `/portal/profile` via `src/pages/portal/PortalProfile.jsx`

These active routes should be treated as **validated continuity-grade runtime surfaces**.

### Remaining direct active-runtime validation
No major public or portal route remains unvalidated from the current active runtime map, based on the inspected path inventory captured in `src/routes.js`.

## What This Means Operationally

### Resolved misconceptions
- The active runtime shell is **not** broadly a demo-placeholder shell.
- Canonical bid continuity routes are present and valid in the active runtime path.
- The active platform dashboard already carries continuity-grade operational context.
- The remaining validated portal sub-surfaces also carry continuity-grade workspace context rather than placeholder-only behavior.

### Remaining task
The highest-value remaining work in this lane is no longer broad route validation. It is now:

1. build/validation truth (`npm run build` / `npm run build:system`)
2. classification and eventual cleanup/deprecation of duplicate `src/routes/**` tree
3. Function App minimum execution spine work after Static Web App validation closes

## Founder Action Required

**No** â€” this remains repo-verifiable and repo-fixable.

## Next Concrete Action

1. verify build truth for the active shell
2. verify system validation truth for the active shell
3. classify duplicate `src/routes/**` tree for later removal/deprecation
4. then advance to the Function App minimum execution spine lane

## Operating Rule

Do not let inactive placeholder files under `src/routes/**` overstate runtime defects.
Validate customer-facing quality against the active runtime pages under `src/pages/**` first.