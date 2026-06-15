# Azure Static Web Apps deployment promotion policy

Status: active on main  
Effective date: 2026-06-15

## Issue

Packets 060F through 061Y demonstrated a repeated failure pattern on the `Azure Static Web Apps CI/CD` workflow for `main`: deployment attempts were being made too often, including preview-style pressure against the Azure Static Web App deployment surface, while the product path was still not fully proven.

This created operational drift between:

- repo truth
n- workflow truth
- Azure deployment-capacity truth
- live public truth

## Policy

1. `pull_request` runs are validation-only by default.
2. Azure Static Web Apps content deployment is promotion-only and should occur from:
   - `push` to `main`, or
   - `workflow_dispatch` on the final intended state.
3. Preview deployment pressure must not be used as the normal iteration loop.
4. Build validation must succeed before any production deployment attempt.
5. Live-domain smoke verification must run only after a real production deployment attempt.
6. Product-path truth overrides cosmetic deploy activity: no deployment is considered successful unless login/workspace continuity is verifiable.

## Required workflow posture

The canonical workflow must preserve the following behavior:

- PRs run `npm ci`
- PRs run `npm run build:system`
- PRs verify `dist/` and `api/` artifacts
- PRs do **not** consume Azure SWA staging capacity
- `main` runs perform the actual SWA upload
- `main` runs perform live smoke verification

## Founder-hands-off rule

The normal operating loop must be:

1. accumulate bounded repo-side fixes
2. validate in CI without Azure promotion pressure
3. promote once when the state is coherent
4. verify live routes and authenticated entry
5. only then continue packet advancement

## Immediate operator checklist

Before the next production promotion:

- Confirm stale Azure SWA preview environments are removed or naturally cleaned up.
- Confirm the deployment token still targets `delightful-mushroom-0de67860f`.
- Confirm the next run is a deliberate `workflow_dispatch` or the next intended `main` push, not speculative churn.
- Confirm the post-deploy verification target includes:
  - `/`
  - `/platform`
  - `/login`
  - `/login?seeded=1&autologin=1&next=/portal/platform`
  - `/portal/platform`

## Acceptance standard

The Azure SWA lane is not considered recovered until all of the following are true:

- GitHub Actions validation passes
- GitHub Actions production deploy passes
- Azure accepts the deployment
- live site reflects current repo state
- sign-in produces an actual path into the workspace
- the product route can be demonstrated without founder-only intervention
