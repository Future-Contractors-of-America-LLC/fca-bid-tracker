# Static Web App Deployment Verification

## Current deployment hardening posture

The FCA Static Web App is now expected to expose all of the following on the live public deployment:

- `/login`
- `/login?seeded=1`
- `/login?seeded=1&autologin=1&next=/portal/platform`
- `/deployment-status.json`
- `/api/customer-login`
- `/api/auricrux`

## Cache policy

To reduce stale public-shell behavior and make live login fixes visible faster, `staticwebapp.config.json` now applies `Cache-Control: no-store, no-cache, must-revalidate` to:

- `/api/*`
- `/deployment-status.json`
- `/index.html`
- the SPA fallback 404 rewrite posture

This is intended to reduce the risk that the custom domain continues serving an older shell after `main` has already advanced.

## Expected public verification steps

The public deployment should now be checked in this order:

1. Open `/deployment-status.json` and confirm it contains a real Git SHA and GitHub Actions run ID rather than `pending-build`.
2. Open `/login?seeded=1` and confirm the seeded customer credentials are preloaded.
3. Open `/login?seeded=1&autologin=1&next=/portal/platform` and confirm the workspace routes directly into the live platform surface.
4. Open `/api/customer-login` and `/api/auricrux` and confirm the Functions runtime is present.

## Interpretation

If the repository contains the seeded login flow but the public domain still does not expose these routes or still shows stale shell behavior, the remaining fault is in the live Azure Static Web App deployment/runtime chain rather than in the route layer itself.
