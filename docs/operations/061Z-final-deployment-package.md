# 061Z final deployment package

Status: prepared for next controlled promotion  
Date: 2026-06-15

## Issue

Azure Static Web Apps promotion was being used too frequently while preview environments remained occupied. This blocked deployment acceptance and obscured product-truth verification.

## Decision

Treat Azure Static Web Apps as a promotion lane, not an iteration lane.

## Repo truth included in this package

This final package preserves current `main` progress through the 061Z recovery line, including:

- SWA workflow hardening to skip PR preview deployment pressure
- removal of unsupported `skip_api_build` workflow input
- bounded login continuity repair through local seeded fallback when `/api/customer-login` is unavailable
- SWA deployment promotion policy artifact
- preview-environment clearance list for Azure capacity recovery

## Canonical release candidate routes to verify after next production run

- `/`
- `/platform`
- `/login`
- `/login?seeded=1&autologin=1&next=/portal/platform`
- `/portal/platform`

## Required pre-run conditions

1. stale preview environments cleared
2. no speculative rerun loop
3. next action is one controlled production promotion only
4. deployment token still targets `delightful-mushroom-0de67860f`

## Required run shape

- trigger: `workflow_dispatch` on `main`, or one deliberate intended push to `main`
- no PR preview deployment attempts
- build validation must pass before Azure upload
- live smoke verification runs only after a real production upload attempt

## Acceptance standard

The next run counts as successful only if all are true:

- GitHub Actions build validation passes
- Azure SWA upload passes
- smoke verification passes
- live site reflects current repo state
- sign-in produces a path into the actual workspace
- founder does not need to manually stitch the route path together

## Immediate next operator action

1. clear the listed preview environments in Azure
2. trigger exactly one controlled production run
3. validate the five release-candidate routes
4. if the server-backed auth path still fails, continue bounded login access while normalizing the `api/` function model in the next packet
