# Founder-Only Checklist

Prioritized tasks only **you** can complete. Engineering agents handle code, docs, and CI preparation.

**Last updated:** 2026-06-19  
**Detail:** [FOUNDER_ONLY_ACTIONS.md](./FOUNDER_ONLY_ACTIONS.md) | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) | [legal/IP_MASTER_INDEX.md](./legal/IP_MASTER_INDEX.md)

---

## How to use this table

- **Priority:** 1 = do first (blocks revenue or legal clock)
- **Blocker for:** What stays blocked until this is done
- Work top-to-bottom within each group unless a specific deal forces reordering

---

## Legal / IP

| Priority | Item | Why | Doc link | Blocker for |
|:--------:|------|-----|----------|-------------|
| 1 | Confirm LLC ownership + contractor IP assignments | Copyright/trademark claimant must hold clean title | [COPYRIGHT_FILING_PREP.md](./legal/COPYRIGHT_FILING_PREP.md) | All IP filings |
| 1 | USPTO TESS search (FCA, Auricrux, Contractor Command) | Avoid wasted filing fees on conflicts | [TRADEMARK_FILING_PREP.md](./legal/TRADEMARK_FILING_PREP.md) | Trademark TEAS |
| 2 | Engage IP attorney | Goods/services IDs, filing strategy, provisional review | [IP_MASTER_INDEX.md](./legal/IP_MASTER_INDEX.md) | Patent + complex TM |
| 2 | File trademark applications (word + design marks) | Brand priority in commerce | [TRADEMARK_FILING_PREP.md](./legal/TRADEMARK_FILING_PREP.md) | TM symbols, enforcement |
| 3 | File copyright registrations (brand + UI + software) | Statutory damages, deposit record | [COPYRIGHT_FILING_PREP.md](./legal/COPYRIGHT_FILING_PREP.md) | Copyright registration numbers |
| 3 | Export Auricrux Crux Pulse MP4 | Motion mark specimen | `brand-assets/animations/AURICRUX_CRUX_PULSE_SPEC.md` | Motion trademark |
| 4 | Complete invention disclosures + provisional decision | Public website may start disclosure clock | [PATENT_OPPORTUNITIES_PREP.md](./legal/PATENT_OPPORTUNITIES_PREP.md) | Patent pending claims |
| 5 | Legal review of Terms, Privacy, DPA | Enterprise procurement | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 5 | Large contracts |

---

## Payments

| Priority | Item | Why | Doc link | Blocker for |
|:--------:|------|-----|----------|-------------|
| 1 | Stripe live keys in Auricrux-Central | Test mode cannot collect revenue | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 1.1 | Live checkout |
| 1 | Stripe webhook + `STRIPE_WEBHOOK_SECRET` | Payment confirmation -> workspace activation | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 1.2 | Post-payment onboarding |
| 2 | $99/mo Startup Payment Link + SWA env | Self-serve startup plan | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 1.3 | `/intake?plan=startup` revenue |
| 3 | Live charge smoke test ($0.50 + refund) | End-to-end billing proof | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 1.1 | Revenue sign-off |

---

## App stores

| Priority | Item | Why | Doc link | Blocker for |
|:--------:|------|-----|----------|-------------|
| 2 | Push `fca-mobile-maui` + green CI | Signed build pipeline | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 6 | Store uploads |
| 2 | Android release keystore + GitHub secrets | Signed AAB | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 2.3 | Play Store |
| 3 | Google Play Console app + listing | Android distribution | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 2.2 | Android customers |
| 3 | Apple Developer enrollment + signing certs | TestFlight / App Store | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 2.1 | iOS customers |
| 4 | Device screenshots (replace placeholders) | Store review requirement | `fca-mobile-maui-work/store-listing/` | Store approval |
| 4 | Submit AAB/IPA to internal tracks | First mobile users | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 2.7 | Mobile revenue narrative |

---

## Azure / infra

| Priority | Item | Why | Doc link | Blocker for |
|:--------:|------|-----|----------|-------------|
| ~~1~~ | ~~Merge PR + deploy~~ `fca-bid-tracker` | Done — PR #138 merged, SWA deployed | — | — |
| ~~1~~ | ~~Merge PR + deploy~~ `auricrux-central` | Done — PR #33 merged | — | — |
| 2 | Set `FCA_SESSION_SECRET` | Production session signing | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 3.2 | Managed auth promotion |
| 3 | Key Vault RBAC on `auricrux-kv` | CLI/scripts cannot read secrets | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 4.1 | Secret rotation |
| 3 | M365 Graph + SharePoint write consent | Document bridge beyond read/preflight | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 4.2 | SharePoint write |
| 4 | Azure Entra ID SSO app registration | Enterprise login | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 3.1 | SSO sales demos |
| 4 | API subdomain DNS (`api.`) | Clean API URL for buyers | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 1.4 | Enterprise polish |
| 5 | Foundry agent ID env vars | Live agent routing | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 4.3 | Auricrux agent features |

---

## Enterprise sales

| Priority | Item | Why | Doc link | Blocker for |
|:--------:|------|-----|----------|-------------|
| 3 | SOC 2 roadmap | Procore/Autodesk-tier procurement | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 5 | Enterprise RFPs |
| 4 | DPA template with counsel | Data processing agreements | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 5 | EU/enterprise deals |
| 5 | Academy accreditation sign-off | Training authority claims | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 5 | Academy marketing |

---

## Testing sign-off

| Priority | Item | Why | Doc link | Blocker for |
|:--------:|------|-----|----------|-------------|
| 1 | Portal + Academy walkthrough (founder test account) | Validates SaaS + LMS live | [FOUNDER_PRODUCT_TEST_ACCESS.md](./FOUNDER_PRODUCT_TEST_ACCESS.md) | Product demo confidence |
| 2 | Launch customer LMS after central deploy | Confirms seeded account change | [FOUNDER_PRODUCT_TEST_ACCESS.md](./FOUNDER_PRODUCT_TEST_ACCESS.md) | Single-user launch QA |
| 2 | Verify `/brand/**` URLs return 200 after SWA deploy | Trademark specimen URLs | [TRADEMARK_FILING_PREP.md](./legal/TRADEMARK_FILING_PREP.md) | TEAS specimens |
| 3 | Intake -> Stripe -> portal E2E | Revenue path validation | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) Section 7 | Go-live sign-off |
| 4 | Install Node.js locally (optional) | Run `vite build` + `qc:market` pre-push | [FOUNDER_ONLY_ACTIONS.md](./FOUNDER_ONLY_ACTIONS.md) | Local QC before deploy |

---

## Top 10 — do these first

| # | Item | Group |
|---|------|-------|
| 1 | Stripe live keys + webhook | Payments |
| 2 | $99/mo Startup Payment Link | Payments |
| 3 | USPTO TESS trademark search | Legal / IP |
| 4 | Confirm LLC ownership + contractor assignments | Legal / IP |
| 5 | Portal + Academy test walkthrough | Testing |
| 6 | Verify `/brand/**` URLs return 200 on live site | Testing / IP |
| 7 | Android keystore + Play Console app | App stores |
| 8 | Set `FCA_SESSION_SECRET` | Azure / infra |
| 9 | Engage IP attorney (before provisional if desired) | Legal / IP |
| 10 | Key Vault RBAC on `auricrux-kv` | Azure / infra |

---

## Agent-completed (no founder action)

- PRs #138, #33, #1 merged to `main` (2026-06-19)
- SWA emergency deploy shipped `/brand/**` and `/ip` to production
- `/ip` route, footer links, and `siteMetadata` entry
- `public/brand/**` and `brand-assets/**` specimens live
- Legal prep docs: copyright, trademark, patent, invention template
- `validate-routes.mjs` updated; `npm run qc:market` 2/2 passed
- MAUI app icon SVGs updated to FCA hex mark
- `launch.customer` LMS enabled — merged to central `main`
