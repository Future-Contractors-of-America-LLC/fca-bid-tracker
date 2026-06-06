# Static Web App Route Inspection Findings

_Last updated: 2026-06-06_

## Purpose

This document records the first direct route-file inspection pass for the Static Web App recovery lane.
It converts the route audit from inferred structure into file-backed findings.

## Files Inspected

### Router and route inventory
- `src/routes/index.js`

### Public route components
- `src/routes/public/Home.js`
- `src/routes/public/Platform.js`

### Entry route components
- `src/routes/entry/Login.js`
- `src/routes/entry/Portal.js`

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

### 3. The inspected entry routes are also placeholder/demo-level surfaces
Direct inspection shows:

- `src/routes/entry/Login.js` returns `Demo: Login`
- `src/routes/entry/Portal.js` returns `Demo: Portal Dashboard`

## What This Means

### Positive truth
- Route topology exists.
- Named public and portal-entry surfaces exist.
- The repo is not missing the shell structure entirely.

### Blocking truth
- At least the inspected core routes are still placeholder components.
- Route existence is currently stronger than route quality.
- Customer continuity cannot be treated as verified just because the paths are present.

## Route Status Update

| Route | Status After Inspection | Reason | Class | Next Action |
|---|---|---|---|---|
| `/` | Needs fix | component is still `Demo: Home` placeholder content | repo-fixable | replace placeholder with continuity-grade home shell |
| `/platform` | Needs fix | component is still `Demo: Platform` placeholder content | repo-fixable | replace placeholder with platform narrative + CTA continuity |
| `/login` | Needs fix | component is still `Demo: Login` placeholder content | repo-fixable | replace placeholder with real login continuity shell |
| `/portal` | Needs fix | component is still `Demo: Portal Dashboard` placeholder content | repo-fixable | replace placeholder with real portal entry continuity shell |
| `/academy` | Route exists; content unverified | route inventory confirms path, but route component not yet inspected in this pass | repo-fixable pending review | inspect file and classify |
| `/auricrux` | Route exists; content unverified | route inventory confirms path, but route component not yet inspected in this pass | repo-fixable pending review | inspect file and classify |
| `/pricing` | Route exists; content unverified | route inventory confirms path, but route component not yet inspected in this pass | repo-fixable pending review | inspect file and classify |
| `/contact` | Route exists; content unverified | route inventory confirms path, but route component not yet inspected in this pass | repo-fixable pending review | inspect file and classify |
| `/portal/messages` and other portal subroutes | Route exists; content unverified | subroutes are wired in router, but content has not yet been inspected in this pass | repo-fixable pending review | inspect portal subroute files |

## Highest-Priority Repo-Fixable Defect

The highest-priority defect confirmed by direct inspection is:

**core public and entry routes are present in the route map but still render placeholder demo text rather than continuity-grade FCA shell content.**

## Founder Action Required

**No** — this is repo-fixable.

## Next Concrete Action

Start replacing confirmed placeholder routes in this order:

1. `/`
2. `/platform`
3. `/login`
4. `/portal`

Then continue inspection of:

- `/academy`
- `/auricrux`
- `/pricing`
- `/contact`
- portal subroutes

## Operating Rule

From this point forward, a route should not be treated as a real customer-facing surface until both are true:

1. the route exists in the route map
2. the route content is no longer placeholder/demo-only
