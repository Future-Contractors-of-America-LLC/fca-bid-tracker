# Founder Actions - Tomorrow

> **Full step-by-step guide:** see [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) for detailed instructions on every item below (Stripe, mobile stores, SSO, legal, DNS, signing keys).
>
> **Prioritized checklist:** [FOUNDER_ONLY_CHECKLIST.md](./FOUNDER_ONLY_CHECKLIST.md) | **Founder-only detail:** [FOUNDER_ONLY_ACTIONS.md](./FOUNDER_ONLY_ACTIONS.md)

Hands-off checklist for items that require your accounts, credentials, or legal approval. Everything else is being built and deployed autonomously.

## Revenue (highest priority)

| # | Action | Where | Notes |
|---|--------|-------|-------|
| 1 | Add Stripe live keys | Azure SWA + Auricrux-Central app settings | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| 2 | Configure Stripe webhook | Stripe Dashboard | Point to `https://auricrux-central.azurewebsites.net/api/stripe/webhook` |
| 3 | Create $99/mo Startup Payment Link | Stripe Dashboard | Set `EXPO_PUBLIC_STARTUP_CHECKOUT_URL` + SWA env |
| 4 | DNS for API subdomain | Domain registrar | TXT `asuid.api` + CNAME `api` -> `auricrux-central.azurewebsites.net` |

Script ready: `fca-bid-tracker-work/scripts/configure-stripe-azure.ps1`

## Mobile (TestFlight + Play Internal) - **use `fca-mobile-maui` (.NET MAUI / C#)**

| # | Action | Where | Notes |
|---|--------|-------|-------|
| 5 | Apple Developer enrollment | developer.apple.com | App ID `com.futurecontractorsofamerica.mobile` |
| 6 | Google Play Console | play.google.com/console | Create app, complete store listing |
| 7 | Android release keystore | Local + GitHub secrets | See FOUNDER_COMPLETION_GUIDE �2.3 |
| 8 | iOS signing cert + profile | Apple Developer + GitHub secrets | See FOUNDER_COMPLETION_GUIDE �2.4 |
| 9 | Install Android SDK (local) | Android Studio | Required for `dotnet build -f net8.0-android` on your PC |
| 10 | Device screenshots | iPhone + Android | Replace placeholders; see `fca-mobile-maui-work/store-listing/` |
| 11 | Submit signed builds | Play Console + App Store Connect | After CI produces AAB/IPA |

**Deprecated:** Expo/EAS steps for legacy `fca-mobile` - do not use for product delivery.

Store copy: `fca-mobile-maui-work/store-listing/STORE_COPY.md`

## Enterprise auth (vs Microsoft / Google SSO)

| # | Action | Where | Notes |
|---|--------|-------|-------|
| 12 | Azure Entra ID app registration | Azure Portal | Replace launch login with SSO |
| 13 | Set `FCA_SESSION_SECRET` | Auricrux-Central | Production session signing key |
| 14 | Retire hardcoded launch account | After SSO | `launch.customer@futurecontractorsofamerica.com` |

## Azure / M365 (SharePoint bridge)

| # | Action | Where | Notes |
|---|--------|-------|-------|
| 15 | Grant Key Vault RBAC | `auricrux-kv` | Currently ForbiddenByRbac for CLI user |
| 16 | M365 app registration secrets | Azure Portal | Graph + SharePoint write (beyond preflight) |
| 17 | Foundry agent IDs | Azure AI Foundry | Map env vars in Auricrux-Central |

## Legal / IP / enterprise sales

| # | Action | Notes |
|---|--------|-------|
| 18 | Push uncommitted repos (web + central + mobile) | See [FOUNDER_ONLY_ACTIONS.md](./FOUNDER_ONLY_ACTIONS.md) deploy commands |
| 19 | IP filings (trademark, copyright, patent counsel) | Start at [legal/IP_MASTER_INDEX.md](./legal/IP_MASTER_INDEX.md) |
| 20 | DPA + data residency policy | Required for Procore/Autodesk-tier buyers |
| 21 | SOC2 roadmap | Enterprise procurement blocker |
| 22 | Electrical apprenticeship content sign-off | Academy authority / accreditation |

---

## What the build is delivering tonight (no action needed)

- **Auricrux-Central**: Table-backed RFIs + takeoffs (`FcaRecords`), CORS on tenant APIs, mobile push registration; launch.customer LMS enabled in code (pending deploy)
- **fca-bid-tracker**: `/ip` route, brand specimens in `public/brand/**`, legal prep docs, market QC route fixes
- **fca-mobile-maui**: App icon updated to FCA hex mark
- **CI**: Mobile asset validation + typecheck passing; central deploy via GitHub Actions on push

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
curl -sL -o /dev/null -w "%{http_code}" https://futurecontractorsofamerica.com/brand/fca/fca-hex-mark.svg
```

---

_Last updated: 2026-06-19 - autonomous build sprint_
