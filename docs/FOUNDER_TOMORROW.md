# Founder Actions — Tomorrow

Hands-off checklist for items that require your accounts, credentials, or legal approval. Everything else is being built and deployed autonomously tonight.

## Revenue (highest priority)

| # | Action | Where | Notes |
|---|--------|-------|-------|
| 1 | Add Stripe live keys | Azure SWA + Auricrux-Central app settings | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| 2 | Configure Stripe webhook | Stripe Dashboard | Point to `https://auricrux-central.azurewebsites.net/api/stripe/webhook` |
| 3 | Create $99/mo Startup Payment Link | Stripe Dashboard | Set `EXPO_PUBLIC_STARTUP_CHECKOUT_URL` + SWA env |
| 4 | DNS for API subdomain | Domain registrar | TXT `asuid.api` + CNAME `api` ? `auricrux-central.azurewebsites.net` |

Script ready: `fca-bid-tracker-work/scripts/configure-stripe-azure.ps1`

## Mobile (TestFlight + Play Internal)

| # | Action | Where | Notes |
|---|--------|-------|-------|
| 5 | `eas login` + `eas init` | Dev machine | Run `fca-mobile-work/scripts/link-eas-project.ps1` |
| 6 | Add GitHub secrets | Repo `fca-mobile` | `EXPO_TOKEN`, `EAS_PROJECT_ID` |
| 7 | Apple Developer enrollment | developer.apple.com | App ID `com.futurecontractorsofamerica.mobile` |
| 8 | Google Play Console | play.google.com/console | Create app, upload first AAB from `eas build` |
| 9 | Real device screenshots | iPhone + Pixel | Replace `assets/store-feature.png` with captures |
| 10 | Submit builds | Terminal | `eas submit --platform ios --latest` / `android --latest` |

Store copy is ready in `fca-mobile-work/store-listing/`.

## Enterprise auth (vs Microsoft / Google SSO)

| # | Action | Where | Notes |
|---|--------|-------|-------|
| 11 | Azure Entra ID app registration | Azure Portal | Replace launch login with SSO |
| 12 | Set `FCA_SESSION_SECRET` | Auricrux-Central | Production session signing key |
| 13 | Retire hardcoded launch account | After SSO | `launch.customer@futurecontractorsofamerica.com` |

## Azure / M365 (SharePoint bridge)

| # | Action | Where | Notes |
|---|--------|-------|-------|
| 14 | Grant Key Vault RBAC | `auricrux-kv` | Currently ForbiddenByRbac for CLI user |
| 15 | M365 app registration secrets | Azure Portal | Graph + SharePoint write (beyond preflight) |
| 16 | Foundry agent IDs | Azure AI Foundry | Map env vars in Auricrux-Central |

## Legal / enterprise sales

| # | Action | Notes |
|---|--------|-------|
| 17 | DPA + data residency policy | Required for Procore/Autodesk-tier buyers |
| 18 | SOC2 roadmap | Enterprise procurement blocker |
| 19 | Electrical apprenticeship content sign-off | Academy authority / accreditation |

---

## What the build is delivering tonight (no action needed)

- **Auricrux-Central**: Table-backed RFIs + takeoffs (`FcaRecords`), CORS on tenant APIs, mobile push registration
- **fca-bid-tracker**: Full frontend repoint to central via `backendBase.js` + expanded `fca-backend-config.js`
- **fca-mobile**: Projects + Academy tabs, platform API client, enterprise store metadata
- **CI**: Mobile asset validation + typecheck passing; central deploy via GitHub Actions

## Competitive positioning (built toward)

| Competitor class | FCA answer shipping |
|------------------|---------------------|
| Procore | Project spine, RFIs, takeoffs, files, audit, closeout routes |
| Autodesk ACC | Drawing refs on RFIs/takeoffs, SharePoint read bridge |
| Intuit / Sage | Billing, pay apps, job cost demo data + Stripe revenue path |
| NCCER / LMS | Academy catalog, enrollments, credentials, remediation links |
| Microsoft / Google | M365 status routes, mobile + web + central API split (SSO tomorrow) |

## Quick verify after deploy completes

```bash
curl https://auricrux-central.azurewebsites.net/api/health
curl https://auricrux-central.azurewebsites.net/api/projects/PRJ-001/rfis
curl https://auricrux-central.azurewebsites.net/api/academy-lms
```

---

_Last updated: 2026-06-18 — autonomous build sprint_
