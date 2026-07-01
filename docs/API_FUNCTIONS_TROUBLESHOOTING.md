# API Functions Troubleshooting Guide

This guide covers common issues with the Azure Functions proxy layer deployed to Azure Static Web Apps, and how to diagnose and fix them.

## Architecture overview

The FCA frontend relies on Azure Functions (`api_generated/`) deployed alongside the React SPA in Azure Static Web Apps. These functions act as reverse proxies to the Auricrux Central backend API.

```
Browser → Azure SWA (React SPA)
              ↓ /api/* requests
         Azure Functions (api_generated/)
              ↓ proxied to
         Auricrux Central API (auricrux-central.azurewebsites.net)
```

Functions are generated at build time by `scripts/generate-central-proxy-functions.mjs` and prepared by `scripts/prepare-api-functions.mjs`.

## Common failure scenarios

### 1. API endpoints return 404

**Symptom**: `/api/projects`, `/api/bids`, `/api/academy-lms` etc. return 404.

**Possible causes**:
- `api_generated/` directory was not included in the deployment payload.
- Azure SWA configuration does not specify `api_location: api_generated`.
- The proxy functions were not generated before deployment.

**Diagnosis**:
1. Check the workflow "Verify build artifact exists" step — it lists `api_generated/` contents.
2. Check the "Validate api_generated proxy function structure" step for missing `index.js` / `function.json`.
3. In Azure Portal → Static Web Apps → fca-frontend → **Functions**, verify functions are listed.

**Fix**:
1. Re-run the full workflow via `workflow_dispatch` on `main`.
2. If functions are still missing in Azure Portal, check that `api_location: api_generated` is set in the workflow (`.github/workflows/azure-static-web-apps-delightful-mushroom-0de67860f.yml`, step "Build And Deploy").

---

### 2. API endpoints return 503 or timeout

**Symptom**: `/api/*` routes respond but return 503 or hang.

**Possible causes**:
- Auricrux Central backend API (`auricrux-central.azurewebsites.net`) is temporarily unavailable.
- The proxy function cannot connect to the backend due to network policy or firewall.
- The Azure Function cold-start timeout is too short.

**Diagnosis**:
1. Check `scripts/verify-central-api.mjs` output: `node scripts/verify-central-api.mjs`.
2. Try the backend directly: `curl https://auricrux-central.azurewebsites.net/api/leads?view=job-board`.
3. Check Azure Portal → App Service → auricrux-central → **Log stream**.

**Fix**:
- If backend is down, restart the App Service plan.
- If the proxy target URL is wrong, check `scripts/domainHosts.constants.mjs` for `FCA_API_ORIGIN`.

---

### 3. API functions not in Azure Portal

**Symptom**: Azure Portal → Static Web Apps → fca-frontend → Functions shows no functions.

**Possible causes**:
- The deployment did not include the `api_generated/` directory.
- `api_location` in the workflow is wrong or blank.
- Deployment token was invalid so upload was skipped.

**Diagnosis**:
1. Check the workflow "Build And Deploy" step — look for `api_location: api_generated` in the action inputs.
2. Verify the deployment token is valid (see [AZURE_SWA_TOKEN_REGENERATION.md](./AZURE_SWA_TOKEN_REGENERATION.md)).
3. Download the `live-deployment-smoke` workflow artifact and inspect `governed_swa_payload.tgz`.

**Fix**:
1. Regenerate the deployment token (see [AZURE_SWA_TOKEN_REGENERATION.md](./AZURE_SWA_TOKEN_REGENERATION.md)).
2. Re-run the workflow.

---

### 4. api_generated function fails syntax/load check in CI

**Symptom**: "Validate proxy function initialization" step fails.

**Possible causes**:
- A generated function has a syntax error.
- A required dependency is missing from `api_generated/package.json`.
- The generation script (`generate-central-proxy-functions.mjs`) introduced a regression.

**Diagnosis**:
1. Look at the CI step output to identify which function failed.
2. Inspect `api_generated/<function-name>/index.js` locally.
3. Run locally: `node -e "require('./api_generated/<function-name>/index.js')"`.

**Fix**:
- Fix the generation template in `scripts/generate-central-proxy-functions.mjs`.
- Re-run `node scripts/generate-central-proxy-functions.mjs && node scripts/prepare-api-functions.mjs` locally.
- Inspect the output and commit any template fixes.

---

### 5. Post-deploy smoke verification fails for API routes

**Symptom**: Workflow log shows `::warning::` messages about API route failures in smoke verification.

**Note**: As of the current workflow configuration, API route failures in `verify-live-deployment.mjs` are **advisory only** (`AURICRUX_LIVE_VERIFY_NONBLOCKING=1`). The deployment is considered successful if the frontend SPA is reachable, even if backend API routes are temporarily unavailable.

**To investigate**:
1. Download the `live-deployment-smoke` workflow artifact.
2. Review `live_deployment_smoke_failures.txt` for details.
3. Review `live_deployment_smoke_summary.json` for per-host status.

**Recovery**:
- If API routes are consistently unavailable, escalate to backend (Auricrux Central) operations.
- If frontend routes (index.html, deployment-status.json) are failing, the SPA deployment itself has an issue — re-run the workflow.

---

## Validating api_generated locally

```bash
# Regenerate functions
node scripts/generate-central-proxy-functions.mjs
node scripts/prepare-api-functions.mjs

# Inspect structure
find api_generated -maxdepth 2 -type f | sort

# Validate all functions have index.js and function.json
for dir in api_generated/*/; do
  name=$(basename "$dir")
  [ "$name" = "_lib" ] && continue
  [ -f "$dir/index.js" ] || echo "MISSING: $dir/index.js"
  [ -f "$dir/function.json" ] || echo "MISSING: $dir/function.json"
done

# Run the SWA deployment validator
node scripts/validate-swa-deployment.mjs
```

## Related documentation

- [docs/AZURE_SWA_TOKEN_REGENERATION.md](./AZURE_SWA_TOKEN_REGENERATION.md) — token regeneration guide
- [docs/operations/swa-deployment-promotion-policy.md](./operations/swa-deployment-promotion-policy.md) — deployment policy
- `scripts/generate-central-proxy-functions.mjs` — function generation source
- `scripts/verify-central-api.mjs` — backend API smoke check
- `scripts/verify-live-deployment.mjs` — live deployment smoke verification
