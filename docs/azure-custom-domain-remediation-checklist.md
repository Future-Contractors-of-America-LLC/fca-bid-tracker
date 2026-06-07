# Azure Custom Domain Remediation Checklist

## Current bounded finding

Repository `main` contains the current FCA shell route inventory, deployment verification surfaces, seeded login flow, and a host-aware domain continuity witness, but the public custom domain is still not reflecting those changes. This indicates the remaining blocker is likely outside normal repository mutation and inside Azure domain/resource binding or deployment connection state.

## Symptoms consistent with Azure-side drift

- repo `main` continues advancing
- public shell does not expose latest verification surfaces
- public custom domain appears to serve route behavior inconsistent with `src/routes.js`
- `www` behavior may differ from apex behavior
- the host-aware witness is designed to declare both expected hosts and expose route drift once the correct artifact reaches the live site

## Required Azure checks

### 1) Confirm the intended Static Web App resource

In Azure Portal:

1. Open **Static Web Apps**
2. Identify the app intended for `Future-Contractors-of-America-LLC/fca-bid-tracker`
3. Open **Deployment configuration**
4. Confirm:
   - GitHub organization/repo = `Future-Contractors-of-America-LLC/fca-bid-tracker`
   - branch = `main`

If the linked repo or branch differs, reconnect it to the correct repository and branch.

### 2) Confirm both custom domains bind to the same intended resource

Open **Custom domains** on that same Static Web App and verify both:

- `futurecontractorsofamerica.com`
- `www.futurecontractorsofamerica.com`

are attached to the same intended Static Web App resource.

If either domain is missing or attached elsewhere, correct that first.

### 3) Eliminate split-domain drift

If `www` and apex are attached to different Azure resources, normalize them so both point to the same intended Static Web App.

### 4) Refresh the deployment token if needed

If the resource binding is correct but deployment still does not reflect `main`:

1. In Azure Static Web App, regenerate the deployment token
2. In GitHub repo secrets, replace:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN_DELIGHTFUL_MUSHROOM_0DE67860F`
3. Re-run the workflow `Azure Static Web Apps CI/CD`

### 5) Verify functions continuity

After deployment, confirm:

- `/api/customer-login`
- `/api/auricrux`

respond from the same host as the web shell.

### 6) Verify the raw witness on both hosts

After Azure-side correction, verify on both:

- `https://futurecontractorsofamerica.com/live-shell-verification.html`
- `https://www.futurecontractorsofamerica.com/live-shell-verification.html`
- `https://futurecontractorsofamerica.com/domain-continuity.json`
- `https://www.futurecontractorsofamerica.com/domain-continuity.json`

The witness should show the current host as expected and expose the governed route inventory.

## Expected success criteria

After Azure-side correction, the following should all be visible on the same public host:

- `/live-shell-verification.html`
- `/deployment-status.json`
- `/domain-continuity.json`
- `/login?seeded=1`
- `/login?seeded=1&autologin=1&next=/portal/platform`
- `/api/customer-login`
- `/api/auricrux`

## Interpretation after correction

- If these routes appear, the blocker was Azure-side custom-domain or deployment binding drift.
- If the raw verification route updates but the shell still looks stale, the remaining issue is browser/app cache persistence.
- If the raw verification route updates but API routes fail, the remaining issue is Functions continuity inside the SWA deployment.
