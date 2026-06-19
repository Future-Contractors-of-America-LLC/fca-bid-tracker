# Revenue Sprint — Founder Bootstrap Audit

**Generated:** 2026-06-19  
**Sprint:** FCA 7-Day Hands-Off Revenue Sprint

This is the **only** founder gate before full automation. Estimated **15 minutes**.

## Required GitHub secrets

| Secret | Repo | Status | Blocks |
|--------|------|--------|--------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN_DELIGHTFUL_MUSHROOM_0DE67860F` | fca-bid-tracker | **Verify in GitHub UI** | SWA deploy |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE_AURICRUX_CENTRAL` (or OIDC deploy) | auricrux-central | **Verify** | Central API deploy |
| `AURICRUX_GITHUB_TOKEN` | org/repos | **Verify** | Cross-repo automation |
| `STRIPE_SECRET_KEY` | fca-bid-tracker + central | **Verify** | Live checkout + webhook |
| `STRIPE_WEBHOOK_SECRET` | fca-bid-tracker API | **Verify** | Payment provisioning |
| `AzureWebJobsStorage` / `FCA_TABLE_STORAGE_CONNECTION` | SWA API + Central | **Verify on Function App** | Table persistence |

**How to verify:** GitHub ? `Future-Contractors-of-America-LLC` ? Settings ? Secrets and variables ? Actions.

## Founder actions (cannot be automated)

| # | Action | When |
|---|--------|------|
| 1 | Confirm secrets above exist | Before first live charge |
| 2 | `az login` once if Azure CLI prompts | First deploy on new machine |
| 3 | Complete Stripe identity verification | If Stripe emails KYC request |
| 4 | Set `VITE_STRIPE_STARTUP_CHECKOUT_URL` in SWA app settings after link created | After `npm run stripe:provision-startup` |

## Agent-completed bootstrap prep

- Stripe webhook handler at `/api/stripe-webhook` (SWA API)
- Pilot checkout live: `https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01`
- Legal pages: `/terms`, `/privacy`, `/refunds`, `/ip`
- Revenue sprint work queue: `auricrux/system/work_queue.json` (REV-001–007)
- Smoke script: `npm run qc:revenue-sprint`

## After bootstrap

No further founder action required for deploy loops. You receive pass/fail digests only.
