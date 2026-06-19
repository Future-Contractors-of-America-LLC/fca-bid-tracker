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
| 7 | Android release keystore | Local + GitHub secrets | See FOUNDER_COMPLETION_GUIDE Section 2.3 |
| 8 | iOS signing cert + profile | Apple Developer + GitHub secrets | See FOUNDER_COMPLETION_GUIDE Section 2.4 |
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
| 18 | Merge open PRs after CI green | See PR links below ? ships /brand, /ip, LMS fix, MAUI icon |
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

---

## Agent commit session (2026-06-19)

**Decision:** Feature branches + PR to `main` (safer than direct merge; CI/deploy runs after merge).

| Repo | Branch | Commits | Push |
|------|--------|---------|------|
| fca-bid-tracker | `docs/ip-and-founder-prep` | `209de50c` (brand/legal/founder docs), `aad633ab` (/ip, QC, shells) | Pushed to origin |
| auricrux-central | `feature/launch-customer-lms` | `2af63b8` (launch.customer LMS) | Pushed to origin |
| fca-mobile-maui | `feature/fca-hex-app-icon` | `1473383` (hex app icons) | Pushed to origin |

**Open PRs (merge after CI green):**

- https://github.com/Future-Contractors-of-America-LLC/fca-bid-tracker/pull/138
- https://github.com/Future-Contractors-of-America-LLC/auricrux-central/pull/33
- https://github.com/Future-Contractors-of-America-LLC/fca-mobile-maui/pull/1

**Local QC (2026-06-19):** `npx vite build` passed; `npm run qc:market` 2/2 passed.

**Merge via GitHub UI** or:

```powershell
gh pr merge 138 --repo Future-Contractors-of-America-LLC/fca-bid-tracker --squash
gh pr merge 33 --repo Future-Contractors-of-America-LLC/auricrux-central --squash
gh pr merge 1 --repo Future-Contractors-of-America-LLC/fca-mobile-maui --squash
```

**Manual merge alternative:**

```powershell
# fca-bid-tracker (SWA marketing site + /brand specimens)
cd "c:\Users\Auricrux\OneDrive - Future Contractors of America LLC\fca-bid-tracker-work"
git checkout main; git pull; git merge docs/ip-and-founder-prep; git push origin main

# auricrux-central (Functions API + launch LMS)
cd "c:\Users\Auricrux\OneDrive - Future Contractors of America LLC\auricrux-central-work"
git checkout main; git pull; git merge feature/launch-customer-lms; git push origin main

# fca-mobile-maui (icon for CI/store)
cd "c:\Users\Auricrux\OneDrive - Future Contractors of America LLC\fca-mobile-maui-work"
git checkout main; git pull; git merge feature/fca-hex-app-icon; git push origin main
```

**Still founder-only:** Stripe live keys + webhook, USPTO/counsel filings, store keystores/certs, Azure portal secrets (`FCA_SESSION_SECRET`, Key Vault RBAC).

