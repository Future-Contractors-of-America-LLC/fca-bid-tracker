# Custom Domain Drift Evidence

## Why this exists

The repository `main` branch now contains routes such as:

- `/login`
- `/pricing`
- `/contact`
- `/auricrux`
- `/academy`
- `/portal/platform`
- `/portal/projects`
- `/portal/billing`
- `/portal/messages`
- `/portal/support`
- `/portal/admin`
- `/portal/academy`
- `/live-shell-verification.html`
- `/deployment-status.json`

The public custom domain still appears to expose content inconsistent with this route inventory.

## Repository evidence

The canonical route registry lives in `src/routes.js` and does **not** include `/team`.

The deployment witness manifest now also declares the expected public hosts:

- `futurecontractorsofamerica.com`
- `www.futurecontractorsofamerica.com`

## Interpretation

If `www.futurecontractorsofamerica.com/team` is live while the repository route registry has no `/team` route, then at least one of the following is true:

1. the custom domain is bound to a different Azure Static Web App than this repository deploys to
2. `www` and apex are split across different Azure resources
3. the custom domain is still serving an older app artifact unrelated to current `main`
4. a proxy or front-door layer is targeting the wrong backend

## Immediate Azure checks

1. In the Azure Static Web App bound to this repository, open **Custom domains**.
2. Confirm both `futurecontractorsofamerica.com` and `www.futurecontractorsofamerica.com` are attached to the same intended SWA resource.
3. Confirm the GitHub deployment source for that SWA points to `Future-Contractors-of-America-LLC/fca-bid-tracker` and branch `main`.
4. If `www` is attached elsewhere, detach it from the wrong resource and attach it to the intended SWA.
5. If deployment tokens were regenerated, update the GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN_DELIGHTFUL_MUSHROOM_0DE67860F`.

## Expected live verification after Azure correction

- `/live-shell-verification.html` should load
- `/deployment-status.json` should expose a real Git SHA and run ID
- `/login?seeded=1` should expose the seeded test-account path
- `/api/customer-login` and `/api/auricrux` should respond from the same host
- the verification page should show the current host as one of the manifest's declared expected hosts
