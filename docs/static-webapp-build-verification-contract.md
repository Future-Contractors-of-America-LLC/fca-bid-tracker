# Static Web App Build Verification Contract

_Last updated: 2026-06-06_

## Purpose

This artifact defines the exact build-truth checkpoint for the now-validated active FCA shell.
It exists because route-quality validation is largely complete, but deployment-readiness cannot be claimed until build execution is explicitly verified.

## Current Verified State

The active runtime shell has been repo-truth validated against:

- `src/main.jsx`
- `src/router.jsx`
- `src/routes.js`
- `src/pages/**`

The route validator has also been aligned with the active runtime map for:

- `/portal/notifications`
- `/portal/profile`

## Build Commands To Verify

### 1. Standard production build
```bash
npm run build
```

### 2. Full shell validation + build
```bash
npm run build:system
```

## Expected Verification Outcome

### `npm run build`
Must confirm:
- active runtime shell compiles successfully
- no unresolved imports in `src/pages/**`
- no JSX/runtime syntax failures
- no Vite build breakage caused by recent shell continuity work

### `npm run build:system`
Must confirm:
- route validation passes against the active runtime map
- shell navigation and CTA validators still pass
- Auricrux embedment validators still pass
- live customer/login continuity validators still pass
- final production build completes successfully

## Repo-Truth Hardening Already Completed Before This Checkpoint

- active runtime route reconciliation documented
- duplicate `src/routes/**` tree classified as non-primary runtime surface
- active runtime shell validated route by route across public shell, bid bridges, portal home, platform dashboard, and portal sub-surfaces
- `validate-routes.mjs` updated so runtime route inventory includes `/portal/notifications` and `/portal/profile`

## Current Limitation

The current GitHub connector tool surface available in this session can inspect and modify repository contents, but it does **not** execute `npm` commands directly.

That means build truth is the next required checkpoint, but not one that can be honestly claimed as executed from repository inspection alone.

## Blocker Classification

### Repo state
Ready for build verification.

### Tool-surface limitation
Build execution is not available through the current GitHub repository-editing tool surface.

This is **not** a product-code blocker by itself.
It is a verification-environment limitation for this session.

## Next Concrete Action

Run these commands in a real execution environment tied to the repository:

```bash
npm install
npm run build
npm run build:system
```

Then record:
- pass/fail result
- first failing script, if any
- exact file or validator causing failure
- whether failure is repo-fixable or environment-specific

## Success Definition

This Static Web App lane can be treated as build-verified only when both commands complete successfully or when the first failing repo-scoped defect is explicitly identified.

## Operating Rule

Do not describe the Static Web App shell as fully deployment-ready until command-level build truth is captured, even though route-quality validation is now largely complete.