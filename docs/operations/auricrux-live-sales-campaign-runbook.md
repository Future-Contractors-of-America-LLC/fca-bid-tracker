# Auricrux Live Sales Campaign Runbook

Status: Active
Scope: Production activation of live Auricrux sales and marketing campaigns across commercial FCA accounts.

## Objective

Enable live campaign execution in the FCA shell with hard security gates still enforced.

This runbook assumes these code paths are present:

- commercial live permission logic in `src/lib/auricruxPermissions.js`
- safe-mode override controls in `src/lib/cteSafeModeConfig.js` and `api/_lib/runtime/cteSafeModeStore.js`
- campaign launch and auto-run controls in `src/pages/portal/PortalAuricrux.jsx`
- immutable audit + zero-trust hard gating in `api/_lib/runtime/securityHardeningControls.js`

## Required Runtime Settings

Set all values in the deployment environment before go-live.

Backend settings:

- `FCA_AURICRUX_LIVE_ENABLED=1`
- `FCA_FORCE_LIVE_MODE=1`
- `FCA_SESSION_SECRET=<strong secret>`
- `FCA_IMMUTABLE_AUDIT_ENABLED=1`
- `FCA_IMMUTABLE_AUDIT_SINK=<real immutable sink name>`

Frontend settings:

- `VITE_FCA_FORCE_LIVE_MODE=1`
- `VITE_AURICRUX_AUTORUN_CAMPAIGNS=1`

## Preflight Checks

Run from repository root:

```bash
npm run validate:auricrux-live-campaign-readiness
npm run validate:auricrux-live-campaign-readiness:strict
npm run validate:system-security-hardening
npm run validate:phase3-zero-trust-audit
npm run validate:cte-shadow-environment
```

Expected: all commands pass.

## Go-Live Steps

1. Apply required backend and frontend settings in production.
2. Redeploy the shell and Functions runtime.
3. Open `/portal/auricrux` with a commercial account.
4. Confirm campaign panel does not show `Live campaign blocked by runtime policy`.
5. Confirm campaign run starts automatically when auto-run setting is enabled.
6. Confirm campaign result cards show pass/fail entries for all six campaign steps.

## Hard Failure Conditions

Do not proceed if any of the following occur:

- error code `FCA_SESSION_SECRET_REQUIRED`
- error code `FCA_IMMUTABLE_AUDIT_REQUIRED`
- error code `FCA_SECURITY_LOCKDOWN`
- campaign launch remains blocked by runtime policy after settings are applied

## Rollback

To revert to safe non-live campaign mode:

- set `FCA_FORCE_LIVE_MODE=0`
- set `VITE_FCA_FORCE_LIVE_MODE=0`
- optionally set `VITE_AURICRUX_AUTORUN_CAMPAIGNS=0`
- redeploy

This keeps hardening gates active while restoring safe-mode behavior.
