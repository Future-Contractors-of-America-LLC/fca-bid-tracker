# Static Web App Validator Inventory Audit

_Last updated: 2026-06-06_

## Purpose

This audit captures the current repository-truth status of the build-validation script layer for the active FCA shell.
It exists to reduce false confidence before command-level build execution and to document which validator drift has already been corrected versus which checks still need runtime execution to prove success.

## Verified Script-Layer Facts

### 1. Active runtime route inventory is now reflected in `validate-routes.mjs`
The route validator now explicitly includes:

- `/portal/notifications`
- `/portal/profile`

This closes the known validator drift that could have produced false failures even though the active runtime shell already contained those routes.

### 2. `validate-critical-routes.mjs` is wired to the active runtime map
Direct inspection confirms:

- it imports `router.jsx` at repo root
- repo-root `router.jsx` re-exports the live `src/routes` map from `src/routes.js`
- it validates shell CTA hrefs against active runtime routes plus allowed static prefixes

This means the critical-route smoke validator is pointed at the **active** runtime map rather than the duplicate `src/routes/**` tree.

### 3. Critical-route required set is intentionally narrower than full route inventory
`validate-critical-routes.mjs` requires a subset of routes such as:

- `/`
- `/platform`
- `/login`
- `/pricing`
- `/contact`
- `/auricrux`
- `/portal`
- `/portal/platform`
- `/academy`
- `/not-found`

It does **not** attempt to assert every route in the runtime map as a mandatory route in its required list.

This is not yet proven wrong from repository inspection alone.
It appears to be a **smoke-validation scope choice**, not necessarily a defect.

## Corrected Status Read

### Corrected defect already fixed
- `validate-routes.mjs` runtime-route drift for `/portal/notifications` and `/portal/profile`

### Not yet proven defective
- `validate-critical-routes.mjs` narrower required-route list

From repository inspection alone, there is currently **no verified evidence** that this narrower list is wrong. It may simply define the minimum route set required for smoke validation rather than the full runtime inventory.

## What Still Requires Real Execution

The remaining unanswered questions are execution questions, not repository-reading questions:

1. Does `npm run build` pass?
2. Does `npm run build:system` pass?
3. If `build:system` fails, which validator fails first?
4. Is the first failure a repo-fixable defect or an execution-environment limitation?

## Repo-Scoped Next Action

Run in a command-capable environment:

```bash
npm install
npm run build
npm run build:system
```

Then record:
- first failing command, if any
- exact validator or file causing failure
- whether failure is repo-fixable or environment-specific

## Founder Action Required

**No** — not until command-level execution reveals an external dependency such as missing package installation capability, missing environment configuration, or platform-level permission issues.

## Operating Rule

Do not continue editing validator inventories speculatively without a command-level failure proving a specific mismatch.
The highest-value next checkpoint is real build execution, not more unverified validator rewrites.