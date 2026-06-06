# Static Web App Deployment Verification

_Last updated: 2026-06-06_

## Purpose

This document is the compact verification baseline for the Static Web App recovery lane.
It records what is already true in the repository, what still needs verification, and what must be hardened before this shell can be treated as a trustworthy founder demo and customer-facing surface.

## Recovery Goal

Make the FCA customer-facing shell buildable, coherent, and deployment-verifiable.

## Verified Current State

### 1. Branded entry shell exists
The root `index.html` is already branded to:

- `Future Contractors of America | FCA Operating System`

It also includes FCA-oriented description and social metadata pointing to:

- `https://futurecontractorsofamerica.com`

### 2. SPA fallback posture exists
The root `staticwebapp.config.json` currently provides:

- navigation fallback rewrite to `/index.html`
- `/api/*` exclusion from fallback
- static asset exclusions for common file types
- `404` rewrite back to `/index.html`

This is the correct starting posture for a routed shell hosted as an SPA.

### 3. Product build surface already exists
`package.json` already contains:

- `npm run build`
- `npm run build:system`

The repository also has a strong validation surface for routes, shell actions, navigation, Auricrux embedment layers, public navigation, customer continuity, and workspace persistence.

## What This Means

The repository is **not** starting from zero.
The shell already has:

- product branding
- a deployment-oriented SPA routing posture
- an existing validation/build system

The current work should therefore focus on **verification and hardening**, not reinvention.

## What Still Requires Verification

### Build verification
Confirm that the current repository state passes:

1. `npm run build`
2. `npm run build:system`

### Route continuity verification
Confirm that the main public and shell routes present a coherent experience, especially:

- `/`
- `/login`
- `/platform`
- `/auricrux`
- `/pricing`
- `/contact`
- portal and bid workspace continuity surfaces

### Deployment readiness truth
Confirm that the repository layout, build output assumptions, and SPA routing expectations remain aligned with the intended Static Web App deployment path.

## Hardening Priorities

1. Preserve FCA + Auricrux branding consistency
2. Preserve SPA route continuity
3. Preserve customer-visible clarity across public-to-product flows
4. Verify the build before making broader copy or layout changes
5. Treat any deployment mismatch as a blocker, not a cosmetic issue

## Founder Action Required

**No** — not for baseline verification.

Escalate only if build/deployment verification reveals:

- Azure account-level permission gaps
- missing deployment secrets
- custom domain or DNS ownership tasks
- environment configuration outside repository control

## Next Concrete Action

Run the Static Web App hardening lane as a verification-first sequence:

1. validate current build surface
2. identify any shell or route continuity failures
3. record blockers as repo-fixable vs external
4. only then expand customer-facing polish

## Operating Rule

Static Web App work counts as progress only if it does one of the following:

- verifies the shell builds
- improves route continuity
- removes a deployment blocker
- improves customer-facing clarity without weakening continuity
