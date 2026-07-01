# API Functions Troubleshooting Guide

The FCA frontend shell deploys **Azure Functions** alongside the React SPA. These
functions (`api_generated/`) are thin proxies that forward requests to the
`auricrux-central` backend API. If the functions are missing, broken, or cannot
reach the backend, the post-deploy smoke check will report route failures.

---

## Architecture overview

```
Browser
  └─► Azure SWA  (futurecontractorsofamerica.com)
        ├─ /              → React SPA (dist/)
        └─ /api/*         → Azure Functions (api_generated/)
              └─► auricrux-central API
                    (AURICRUX_CENTRAL_API env var)
```

The functions are **generated** at build time:

```
node scripts/generate-central-proxy-functions.mjs  # creates api_generated/<route>/
node scripts/prepare-api-functions.mjs             # installs api_generated deps
```

---

## Symptom: smoke check fails with `/api/projects` 404 or 500

### Check 1 — Was `api_generated/` actually deployed?

The workflow deploys with `api_location: api_generated`. Confirm the directory
was present when the Azure/static-web-apps-deploy action ran:

1. Open the failed workflow run in GitHub Actions.
2. Expand the **Diagnose api_generated deployment structure** step.
3. Verify `api_generated/host.json` and at least one `function.json` are listed.
4. If the directory is empty or absent, the generation scripts failed earlier —
   look at the **Generate deployable Azure Functions layout** step logs.

### Check 2 — Azure SWA API location setting

In Azure Portal → Static Web Apps → `fca-frontend` → Configuration → Deployment:

| Setting | Required value |
|---------|---------------|
| API location | `api_generated` |

If this is blank, Azure will not deploy the functions at all.

### Check 3 — Function runtime version

`api_generated/host.json` sets the Node runtime version. Azure Functions v4 on
Node 20+ is required. Verify:

```bash
cat api_generated/host.json
# Expected: { "version": "2.0", ... }
```

If the runtime mismatch exists, update the Functions runtime in Azure Portal →
Static Web Apps → `fca-frontend` → Configuration → Runtime.

---

## Symptom: functions deploy but return 500 or empty response

### Check 4 — `AURICRUX_CENTRAL_API` application setting

Each proxy function reads `process.env.AURICRUX_CENTRAL_API` to find the backend.
If this is not set, functions will return an error.

Set it in Azure Portal → Static Web Apps → `fca-frontend` → Configuration →
Application settings:

| Name | Value |
|------|-------|
| `AURICRUX_CENTRAL_API` | `https://api.futurecontractorsofamerica.com` (or the actual backend URL) |

### Check 5 — Backend API reachability

Verify the backend is responding:

```bash
curl -I https://api.futurecontractorsofamerica.com/health
# Expected: HTTP 200
```

If the backend is down, the proxy functions will return upstream errors. This is
a backend infrastructure issue unrelated to the SWA deployment itself.

### Check 6 — CORS / custom domain binding

If the frontend is served from `futurecontractorsofamerica.com` but the API
functions are configured for a different hostname, CORS preflight requests may
fail. Check:

1. `staticwebapp.config.json` — ensure `allowedOrigins` includes all expected
   custom domains.
2. Azure Portal → Static Web Apps → `fca-frontend` → Custom domains — verify
   all three domains are bound:
   - `futurecontractorsofamerica.com`
   - `www.futurecontractorsofamerica.com`
   - `app.futurecontractorsofamerica.com`

---

## Symptom: smoke check passes locally but fails in CI

The `verify:live-deployment` script checks the **live** domains over HTTPS. It
will fail if:

- The deployment token is wrong (site not updated) — see
  [`AZURE_SWA_TOKEN_REGENERATION.md`](AZURE_SWA_TOKEN_REGENERATION.md)
- DNS has not propagated a new custom-domain binding yet (wait 5–10 minutes)
- The smoke check runs before Azure has finished activating the new deployment
  (the workflow retries 20 times at 30-second intervals — check whether all
  retries exhausted without success)

**With `AURICRUX_LIVE_VERIFY_NONBLOCKING=1`** (now set in the workflow), smoke
failures are recorded and surfaced as warnings but do **not** block the
deployment. This means a site update can reach production even when the backend
API is temporarily unavailable.

---

## Manually regenerating `api_generated/`

If you need to test locally:

```bash
npm ci
npm run build:system          # full build including manifest generation
# OR just regenerate the functions:
node scripts/generate-central-proxy-functions.mjs
node scripts/prepare-api-functions.mjs
ls api_generated/             # should show route directories + host.json + package.json
```

---

## Related

- [`AZURE_SWA_TOKEN_REGENERATION.md`](AZURE_SWA_TOKEN_REGENERATION.md)
- Workflow file: `.github/workflows/azure-static-web-apps-delightful-mushroom-0de67860f.yml`
- Function generator: `scripts/generate-central-proxy-functions.mjs`
- Function preparer: `scripts/prepare-api-functions.mjs`
- Smoke verifier: `scripts/verify-live-deployment.mjs`
