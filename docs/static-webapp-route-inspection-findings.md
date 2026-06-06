# Static Web App Route Inspection Findings

_Last updated: 2026-06-06_

## Purpose

This document records the direct route-file inspection pass for the Static Web App recovery lane.
It converts the route audit from inferred structure into file-backed findings.

## Files Inspected

### Router and route inventory
- `src/routes/index.js`

### Public route components
- `src/routes/public/Home.js`
- `src/routes/public/Platform.js`
- `src/routes/public/Academy.js`
- `src/routes/public/Auricrux.js`
- `src/routes/public/Pricing.js`
- `src/routes/public/Contact.js`

### Entry route components
- `src/routes/entry/Login.js`
- `src/routes/entry/Portal.js`

### Portal subroute sample
- `src/routes/portal/Messages.js`

## Verified Findings

### 1. The route map exists and is broader than the current verified shell narrative
`src/routes/index.js` defines a route inventory including:

- `/`
- `/platform`
- `/academy`
- `/auricrux`
- `/pricing`
- `/contact`
- `/login`
- `/portal`
- `/portal/messages`
- `/portal/notifications`
- `/portal/projects`
- `/portal/files`
- `/portal/academy`
- `/portal/finance`
- `/portal/admin`

This confirms that the shell route structure is present in code.

### 2. The inspected public routes are still placeholder/demo-level surfaces
Direct inspection shows:

- `src/routes/public/Home.js` returns `Demo: Home`
- `src/routes/public/Platform.js` returns `Demo: Platform`
- `src/routes/public/Academy.js` returns `Demo: Academy`
- `src/routes/public/Auricrux.js` returns `Demo: Auricrux Intelligence`
- `src/routes/public/Pricing.js` returns `Demo: Pricing`
- `src/routes/public/Contact.js` returns `Demo: Contact`

### 3. The inspected entry routes are also placeholder/demo-level surfaces
Direct inspection shows:

- `src/routes/entry/Login.js` returns `Demo: Login`
- `src/routes/entry/Portal.js` returns `Demo: Portal Dashboard`

### 4. The inspected portal subroute sample is also placeholder/demo-level
Direct inspection shows:

- `src/routes/portal/Messages.js` returns `Demo: Messages`

This increases confidence that placeholder status is not isolated to one page, but is likely still present across multiple routed surfaces.

## What This Means

### Positive truth
- Route topology exists.
- Named public, entry, and portal surfaces exist.
- The repo is not missing the shell structure entirely.

### Blocking truth
- The inspected public routes are placeholder components.
- The inspected entry routes are placeholder components.
- The inspected portal subroute sample is also placeholder content.
- Route existence is currently stronger than route quality.
- Customer continuity cannot be treated as verified just because the paths are present.

## Route Status Update

| Route | Status After Inspection | Reason | Class | Next Action |
|---|---|---|---|---|
| `/` | Needs fix | component is still `Demo: Home` placeholder content | repo-fixable | replace placeholder with continuity-grade home shell |
| `/platform` | Needs fix | component is still `Demo: Platform` placeholder content | repo-fixable | replace placeholder with platform narrative + CTA continuity |
| `/academy` | Needs fix | component is still `Demo: Academy` placeholder content | repo-fixable | replace placeholder with academy continuity shell |
| `/auricrux` | Needs fix | component is still `Demo: Auricrux Intelligence` placeholder content | repo-fixable | replace placeholder with Auricrux operating-layer shell |
| `/pricing` | Needs fix | component is still `Demo: Pricing` placeholder content | repo-fixable | replace placeholder with pricing conversion shell |
| `/contact` | Needs fix | component is still `Demo: Contact` placeholder content | repo-fixable | replace placeholder with contact continuity shell |
| `/login` | Needs fix | component is still `Demo: Login` placeholder content | repo-fixable | replace placeholder with real login continuity shell |
| `/portal` | Needs fix | component is still `Demo: Portal Dashboard` placeholder content | repo-fixable | replace placeholder with real portal entry continuity shell |
| `/portal/messages` | Needs fix | inspected subroute sample is still `Demo: Messages` placeholder content | repo-fixable | replace placeholder with customer-message continuity shell |
| `/portal/notifications` and other portal subroutes | Route exists; likely placeholder risk | subroutes are wired in router, and sampled portal subroute is placeholder | repo-fixable pending review | inspect remaining portal subroute files and normalize |
| `/bid-entry/` | Not present in inspected route map | canonical bid continuity route is expected in recovery scope but not present in inspected `src/routes/index.js` map | repo-fixable pending route inventory alignment | determine whether route lives elsewhere, was renamed, or needs restoration |
| `/bid-status/` | Not present in inspected route map | canonical bid status continuity route is expected in recovery scope but not present in inspected `src/routes/index.js` map | repo-fixable pending route inventory alignment | determine whether route lives elsewhere, was renamed, or needs restoration |
| `/tyler-entry/` | Not present in inspected route map | legacy continuity route not present in inspected router file | repo-fixable pending route inventory alignment | determine whether preserved elsewhere or removed |
| `/tyler-status/` | Not present in inspected route map | legacy continuity route not present in inspected router file | repo-fixable pending route inventory alignment | determine whether preserved elsewhere or removed |

## Highest-Priority Repo-Fixable Defect

The highest-priority defect confirmed by direct inspection is:

**core public, entry, and at least one portal route are present in the route map but still render placeholder demo text rather than continuity-grade FCA shell content.**

## Secondary Route-Inventory Defect

A second defect is now visible:

**the currently inspected router does not show canonical bid continuity routes (`/bid-entry/`, `/bid-status/`) or legacy continuity routes (`/tyler-entry/`, `/tyler-status/`) that were expected in the recovery checklist.**

This requires route inventory alignment review before deployment-readiness claims.

## Founder Action Required

**No** — these are repo-fixable investigation and implementation defects.

## Next Concrete Action

Start replacing confirmed placeholder routes in this order:

1. `/`
2. `/platform`
3. `/login`
4. `/portal`
5. `/auricrux`
6. `/pricing`
7. `/contact`
8. `/academy`

Then continue inspection of:

- remaining portal subroutes
- canonical bid routes and whether they live in another router surface
- legacy continuity routes and whether they were intentionally retired

## Operating Rule

From this point forward, a route should not be treated as a real customer-facing surface until both are true:

1. the route exists in the route map
2. the route content is no longer placeholder/demo-only
