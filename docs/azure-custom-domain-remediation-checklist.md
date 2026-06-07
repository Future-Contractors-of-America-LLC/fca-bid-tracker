# Azure Custom Domain Remediation Checklist

## Current bounded finding

Repository `main` contains the current FCA shell route inventory, deployment verification surfaces, seeded login flow, a host-aware domain continuity witness, a raw host-binding audit page, a raw API continuity audit page, a plain-text runtime fingerprint artifact, and the lifecycle revenue routes `/warranty` and `/referrals`, but the public custom domain is still not reflecting those changes. This indicates the remaining blocker is likely outside normal repository mutation and inside Azure domain/resource binding or deployment connection state.

## New repository-side deployment hardening

The SWA workflow now performs a **post-deploy live-domain smoke verification** against both apex and `www`. That smoke step checks:
- `/deployment-status.json`
- `/domain-continuity.json`
- `/runtime-fingerprint.txt`
- `/live-shell-verification.html`
- `/host-binding-audit.html`
- `/api-continuity-audit.html`

It also fails if:
- either host still serves `pending-build`
- `deployment-status.json` and `runtime-fingerprint.txt` disagree on `gitSha`
- an expected witness route returns a non-200 response
- a host is not declared in the continuity witness set

This means the GitHub workflow itself should now expose custom-domain drift immediately after deploy instead of silently succeeding while the live shell remains stale.

## Required Azure checks if smoke still fails

### 1) Confirm the intended Static Web App resource
1. Open **Static Web Apps**
2. Identify the app intended for `Future-Contractors-of-America-LLC/fca-bid-tracker`
3. Open **Deployment configuration**
4. Confirm repo = `Future-Contractors-of-America-LLC/fca-bid-tracker`, branch = `main`

### 2) Confirm both custom domains bind to the same intended resource
Open **Custom domains** on that same Static Web App and verify both:
- `futurecontractorsofamerica.com`
- `www.futurecontractorsofamerica.com`

### 3) Eliminate split-domain drift
If `www` and apex are attached to different Azure resources, normalize them so both point to the same intended Static Web App.

### 4) Refresh the deployment token if needed
If the resource binding is correct but deployment still does not reflect `main`:
1. Regenerate the deployment token
2. Replace GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN_DELIGHTFUL_MUSHROOM_0DE67860F`
3. Re-run workflow `Azure Static Web Apps CI/CD`

### 5) Verify the full public verification pack on both hosts
Check on both apex and `www`:
- `/deployment-status.json`
- `/domain-continuity.json`
- `/runtime-fingerprint.txt`
- `/live-shell-verification.html`
- `/host-binding-audit.html`
- `/api-continuity-audit.html`
- `/warranty`
- `/referrals`

The raw witnesses should agree on governed build identity, expected hosts, and API availability. In particular, `host-binding-audit.html` should report that `deployment-status.json` and `runtime-fingerprint.txt` agree on the same Git SHA.
