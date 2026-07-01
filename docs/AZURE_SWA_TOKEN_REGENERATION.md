# Azure SWA Deployment Token Regeneration

The GitHub Actions workflow that deploys this repository to Azure Static Web Apps
(`azure-static-web-apps-delightful-mushroom-0de67860f.yml`) authenticates with a
long-lived deployment token stored as a GitHub Actions secret.

**Secret name:** `AZURE_STATIC_WEB_APPS_API_TOKEN_DELIGHTFUL_MUSHROOM_0DE67860F`

If this token is missing, expired, or mismatched you will see one of these symptoms:
- Workflow step "Assert SWA deployment target configuration" warns that the token is missing
- "Build And Deploy" step is skipped entirely
- Smoke verification reports all hosts are stale (your new code never reaches the live site)

---

## Step 1 — Regenerate the token in Azure Portal

1. Open [Azure Portal](https://portal.azure.com) and sign in with the FCA subscription owner account.
2. In the search bar type **Static Web Apps** and open the service.
3. Locate the resource whose default hostname contains `delightful-mushroom-0de67860f`
   (the resource is named **fca-frontend** in the FCA subscription).
4. In the left sidebar click **Configuration** → **Deployment**.
5. Verify the following settings match the repository:

   | Setting | Expected value |
   |---------|----------------|
   | Repository | `Future-Contractors-of-America-LLC/fca-bid-tracker` |
   | Branch | `main` |
   | App location | `/` |
   | API location | `api_generated` |
   | Output location | *(leave empty)* |

6. Click **Manage deployment token**.
7. Click **Regenerate token** (or copy the existing value if it was never changed).
8. **Copy the full token string** — you will only see it once.

---

## Step 2 — Update the GitHub Actions secret

1. Open the GitHub repository:
   `https://github.com/Future-Contractors-of-America-LLC/fca-bid-tracker`
2. Navigate to **Settings → Secrets and variables → Actions**.
3. Find the secret named
   `AZURE_STATIC_WEB_APPS_API_TOKEN_DELIGHTFUL_MUSHROOM_0DE67860F`.
4. Click **Update** (pencil icon) and paste the token you copied in Step 1.
5. Click **Save**.

---

## Step 3 — Trigger a deployment

1. In the GitHub repository click **Actions**.
2. Select the workflow **Azure Static Web Apps CI/CD**.
3. Click **Run workflow** → choose branch `main` → click **Run workflow**.
4. Wait for the run to complete (~8–12 minutes for a full build + deploy + smoke check).
5. A green checkmark means the site is live. A yellow exclamation on the smoke step
   means the site was deployed but the post-deploy verification hit a transient issue
   (DNS propagation, API warm-up) — re-check the live site manually or re-run the
   workflow to confirm.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| "Build And Deploy" step skipped | Token secret is empty | Redo Step 1–2 |
| Token present but deploy action fails with 403 | Token points to wrong SWA resource | Re-generate in the correct SWA resource |
| Deployment succeeds but smoke check fails | API functions not reachable | See [`API_FUNCTIONS_TROUBLESHOOTING.md`](API_FUNCTIONS_TROUBLESHOOTING.md) |
| Site still serves old code after deploy | CDN caching or wrong custom-domain binding | Hard-refresh or check Azure custom domain bindings |

---

## Related

- [`API_FUNCTIONS_TROUBLESHOOTING.md`](API_FUNCTIONS_TROUBLESHOOTING.md)
- Workflow file: `.github/workflows/azure-static-web-apps-delightful-mushroom-0de67860f.yml`
- Smoke verifier: `scripts/verify-live-deployment.mjs`
