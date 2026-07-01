# Azure SWA Deployment Token Regeneration

This guide explains how to regenerate the Azure Static Web Apps deployment token when it expires or becomes invalid.

## Symptoms of an expired/invalid token

- GitHub Actions workflow step "Build And Deploy" fails with an authentication error
- Workflow logs show: `SWA deployment token appears too short — may be expired or invalid`
- Workflow step "Assert SWA deployment target configuration" warns about the token
- Azure returns a 401 or 403 error during deployment

## Recovery steps

### 1. Locate the Azure Static Web App resource

1. Sign in to the [Azure Portal](https://portal.azure.com).
2. Search for **Static Web Apps** in the top search bar.
3. Find the resource named **fca-frontend** (default hostname: `delightful-mushroom-0de67860f.7.azurestaticapps.net`).

### 2. Regenerate the deployment token

1. Open the **fca-frontend** Static Web App.
2. In the left menu, click **Configuration** → **Deployment token** (or navigate to **Overview** and find the **Manage deployment token** button).
3. Click **Regenerate value**.
4. Confirm the regeneration when prompted.
5. Copy the new token value immediately — it is only shown once.

### 3. Update the GitHub secret

1. Go to the [fca-bid-tracker repository](https://github.com/Future-Contractors-of-America-LLC/fca-bid-tracker).
2. Click **Settings** → **Secrets and variables** → **Actions**.
3. Find the secret: `AZURE_STATIC_WEB_APPS_API_TOKEN_DELIGHTFUL_MUSHROOM_0DE67860F`.
4. Click the **Update** (pencil) icon.
5. Paste the newly copied token.
6. Click **Save**.

### 4. Verify the fix

1. Navigate to the **Actions** tab in the repository.
2. Trigger the **Azure Static Web Apps CI/CD** workflow manually via **workflow_dispatch** on `main`.
3. Confirm the "Assert SWA deployment target configuration" step reports `SWA deployment token present.`
4. Confirm the "Build And Deploy" step completes without authentication errors.

## Token details

| Property | Value |
|----------|-------|
| GitHub secret name | `AZURE_STATIC_WEB_APPS_API_TOKEN_DELIGHTFUL_MUSHROOM_0DE67860F` |
| Azure resource name | `fca-frontend` |
| Azure default host | `delightful-mushroom-0de67860f.7.azurestaticapps.net` |
| Expected token length | > 40 characters |

## Related documentation

- [Azure SWA deployment token docs](https://learn.microsoft.com/en-us/azure/static-web-apps/deployment-token-management)
- [docs/API_FUNCTIONS_TROUBLESHOOTING.md](./API_FUNCTIONS_TROUBLESHOOTING.md) — for API function deployment issues
- [docs/operations/swa-deployment-promotion-policy.md](./operations/swa-deployment-promotion-policy.md) — deployment promotion policy

## Notes

- The deployment token is tied to the Azure subscription and resource. If the SWA resource is deleted and recreated, a new token must be generated and the secret updated.
- The token does not have a fixed expiry date but can be invalidated by Azure policy rotation or manual regeneration.
- Only users with **Contributor** or **Owner** role on the Azure subscription can regenerate the token.
