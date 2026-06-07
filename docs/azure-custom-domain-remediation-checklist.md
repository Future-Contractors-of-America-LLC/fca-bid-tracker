# Azure Custom Domain Remediation Checklist

## Current bounded finding

Repository `main` contains the current FCA shell route inventory, deployment verification surfaces, seeded login flow, a host-aware domain continuity witness, a raw host-binding audit page, a raw API continuity audit page, and a plain-text runtime fingerprint artifact, but the public custom domain is still not reflecting those changes. This indicates the remaining blocker is likely outside normal repository mutation and inside Azure domain/resource binding or deployment connection state.

## Why the runtime fingerprint was added

The FCA operating model requires artifacts for completed execution, not just claims. The master matrix makes artifact production mandatory and states that no step is complete without output. It also requires Auricrux to execute, validate, record, and optimize continuously. The runtime fingerprint gives a minimal raw witness that can be checked even if HTML rendering or SPA behavior is misleading. fileciteturn0file8

## New repository-side continuity finding

The repository had drift between the root `staticwebapp.config.json` and the deployed `public/staticwebapp.config.json`. Root/public parity has now been restored and deployment validation now fails if either copy drops the full witness pack routes. This removes another repo-side source of false confidence and narrows the remaining blocker further toward Azure-side host binding or deployment propagation.

## Required Azure checks

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

The raw witnesses should agree on governed build identity, expected hosts, and API availability.
