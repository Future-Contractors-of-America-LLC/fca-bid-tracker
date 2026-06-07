# Azure Custom Domain Remediation Checklist

## Current bounded finding

Repository `main` contains the current FCA shell route inventory, deployment verification surfaces, seeded login flow, a host-aware domain continuity witness, a raw host-binding audit page, a raw API continuity audit page, a plain-text runtime fingerprint artifact, and the lifecycle revenue routes `/warranty` and `/referrals`, but the public custom domain is still not reflecting those changes. This indicates the remaining blocker is likely outside normal repository mutation and inside Azure domain/resource binding or deployment connection state.

## Why the runtime fingerprint and cross-artifact audit were added

The FCA operating model requires artifacts for completed execution, not just claims. The master matrix makes artifact production mandatory, requires every action to map to analyze, decide, generate, execute, validate, record, and optimize, and states that no step is complete without output. The runtime fingerprint and cross-artifact audits give minimal raw witnesses that can be checked even if HTML rendering or SPA behavior is misleading.

## New repository-side continuity finding

Public lifecycle governance is now explicitly validated across four surfaces together: router registration, site metadata, sitemap coverage, and shell navigation. This was added because `/warranty` and `/referrals` had been implemented but could still drift behind validation and crawl posture if left unchecked.

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
- `/warranty`
- `/referrals`

The raw witnesses should agree on governed build identity, expected hosts, and API availability. In particular, `host-binding-audit.html` should report that `deployment-status.json` and `runtime-fingerprint.txt` agree on the same Git SHA.
