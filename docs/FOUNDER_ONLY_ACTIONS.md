# Founder-Only Actions

Tasks that require **your** accounts, legal authority, store enrollment, or portal access. Engineering agents can prepare code, docs, and CI; they cannot complete these steps for you.

**Last updated:** 2026-06-19  
**Companion:** [FOUNDER_ONLY_CHECKLIST.md](./FOUNDER_ONLY_CHECKLIST.md) (prioritized table) | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) (step-by-step)

---

## Legal / IP

| # | Action | Why | Reference |
|---|--------|-----|-----------|
| L1 | Confirm LLC owns all brand assets and code | Required copyright/trademark claimant | [legal/IP_MASTER_INDEX.md](./legal/IP_MASTER_INDEX.md) |
| L2 | Execute IP assignment agreements for any non-employee creators | Closes ownership gaps before filing | [legal/COPYRIGHT_FILING_PREP.md](./legal/COPYRIGHT_FILING_PREP.md) � Assignment gap |
| L3 | Run USPTO TESS trademark search | Avoid filing into known conflicts | [legal/TRADEMARK_FILING_PREP.md](./legal/TRADEMARK_FILING_PREP.md) |
| L4 | Engage IP attorney | TEAS goods/services IDs, filing strategy | [legal/IP_MASTER_INDEX.md](./legal/IP_MASTER_INDEX.md) |
| L5 | File copyright registrations (eCO) | Register visual identity, UI, software | [legal/COPYRIGHT_FILING_PREP.md](./legal/COPYRIGHT_FILING_PREP.md) |
| L6 | File trademark applications (TEAS) | Protect FCA, Auricrux, design marks | [legal/TRADEMARK_FILING_PREP.md](./legal/TRADEMARK_FILING_PREP.md) |
| L7 | Export Auricrux Crux Pulse MP4 | Motion mark specimen for USPTO | `brand-assets/animations/AURICRUX_CRUX_PULSE_SPEC.md` |
| L8 | Complete invention disclosures + counsel review | Provisional patent clock may be running | [legal/PATENT_OPPORTUNITIES_PREP.md](./legal/PATENT_OPPORTUNITIES_PREP.md) |
| L9 | Sign DPA and finalize Terms/Privacy with counsel | Enterprise procurement | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �5 |
| L10 | Academy content accreditation sign-off | NCCER / apprenticeship authority claims | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �5 |

---

## Payments

| # | Action | Why | Reference |
|---|--------|-----|-----------|
| P1 | Add Stripe **live** secret + webhook keys | Revenue beyond test mode | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �1.1�1.2 |
| P2 | Create $99/mo Startup Payment Link | Self-serve startup checkout | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �1.3 |
| P3 | Run live $0.50 charge + refund smoke test | Confirms end-to-end billing | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �1.1 |

Script helper: `scripts/configure-stripe-azure.ps1` (after keys exist).

---

## App stores

| # | Action | Why | Reference |
|---|--------|-----|-----------|
| M1 | Apple Developer Program enrollment | TestFlight / App Store | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �2.1 |
| M2 | Google Play Console account + app record | Android distribution | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �2.2 |
| M3 | Generate Android release keystore | Signed AAB required | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �2.3 |
| M4 | Add signing secrets to GitHub | CI signed builds | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �2.3�2.4 |
| M5 | Capture device screenshots | Store listing requirement | `fca-mobile-maui-work/store-listing/` |
| M6 | Submit signed AAB/IPA to stores | Public mobile availability | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �2.7 |
| M7 | Install Android SDK locally (optional) | Local `dotnet build -f net8.0-android` | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �2.6 |

---

## Azure / infrastructure

| # | Action | Why | Reference |
|---|--------|-----|-----------|
| A1 | Push + deploy uncommitted repo changes | Ship IP page, brand specimens, LMS fix | See deploy commands below |
| A2 | Set `FCA_SESSION_SECRET` in Auricrux-Central | Production session signing | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �3.2 |
| A3 | Grant Key Vault RBAC on `auricrux-kv` | Secret rotation / Graph credentials | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �4.1 |
| A4 | M365 app registration + SharePoint write consent | Full document bridge | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �4.2 |
| A5 | Map Azure AI Foundry agent IDs | Live Auricrux agent routing | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �4.3 |
| A6 | Azure Entra ID app registration | Enterprise SSO | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �3.1 |
| A7 | API subdomain DNS (`api.futurecontractorsofamerica.com`) | Enterprise polish | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �1.4 |
| A8 | Rotate seeded demo passwords after SSO | Security hygiene | [FOUNDER_PRODUCT_TEST_ACCESS.md](./FOUNDER_PRODUCT_TEST_ACCESS.md) |

---

## Enterprise sales

| # | Action | Why | Reference |
|---|--------|-----|-----------|
| E1 | SOC 2 roadmap / vendor selection | Large-buyer procurement | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �5 |
| E2 | Enterprise demo scheduling | Revenue pipeline | sales@futurecontractorsofamerica.com |
| E3 | Retire hardcoded launch account after SSO | Replace `launch.customer@...` | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �3.3 |

---

## Testing sign-off

| # | Action | Why | Reference |
|---|--------|-----|-----------|
| T1 | Sign in with founder test account; walk portal + Academy | Validates SaaS + LMS | [FOUNDER_PRODUCT_TEST_ACCESS.md](./FOUNDER_PRODUCT_TEST_ACCESS.md) |
| T2 | Verify launch customer LMS after central deploy | Confirms `lms: true` for launch account | [FOUNDER_PRODUCT_TEST_ACCESS.md](./FOUNDER_PRODUCT_TEST_ACCESS.md) |
| T3 | Confirm `/brand/**` specimens live after SWA deploy | Trademark use-in-commerce URLs | [legal/TRADEMARK_FILING_PREP.md](./legal/TRADEMARK_FILING_PREP.md) |
| T4 | End-to-end Intake -> Stripe -> portal journey | Revenue path sign-off | [FOUNDER_COMPLETION_GUIDE.md](./FOUNDER_COMPLETION_GUIDE.md) �7 |

---

## Deploy commands (founder or authenticated CI)

Agents prepared changes locally but **did not commit or push** (per project rules). After review, run from each repo:

### fca-bid-tracker-work (SWA � IP page, brand assets, routes)

```powershell
cd "c:\Users\Auricrux\OneDrive - Future Contractors of America LLC\fca-bid-tracker-work"
git add brand-assets/ public/brand/ docs/ src/ scripts/ package.json
git status
git commit -m "Add IP notice, brand specimens, legal prep docs, and market QC routes."
git push origin main
```

SWA auto-deploys on push to `main` via `.github/workflows/azure-static-web-apps-delightful-mushroom-0de67860f.yml`.

**Pre-push QC (requires Node.js 18+):**

```powershell
npm install
npx vite build
npm run qc:market
```

### auricrux-central-work (launch customer LMS enabled)

```powershell
cd "c:\Users\Auricrux\OneDrive - Future Contractors of America LLC\auricrux-central-work"
git add customer-login/__init__.py
git commit -m "Enable LMS for launch.customer seeded account."
git push origin main
```

Auto-deploys via `.github/workflows/main_auricrux-central.yml`.

**Verify after deploy:**

```powershell
$body = @{ email = "launch.customer@futurecontractorsofamerica.com"; password = "FCA-Launch-2026!" } | ConvertTo-Json
(Invoke-RestMethod -Uri "https://auricrux-central.azurewebsites.net/api/customer-login" -Method POST -Body $body -ContentType "application/json").account.enabledProducts
# Expect lms: True
```

### fca-mobile-maui-work (app icon update)

```powershell
cd "c:\Users\Auricrux\OneDrive - Future Contractors of America LLC\fca-mobile-maui-work"
git add src/FcaMobile/Resources/AppIcon/
git commit -m "Update app icon to FCA hex mark for store specimens."
git push origin main
```

---

## Environment gaps on this machine (2026-06-19)

| Tool | Status | Founder action |
|------|--------|----------------|
| Node.js / npm | Not on PATH | Install from https://nodejs.org for local Vite build + QC |
| GitHub CLI (`gh`) | Not on PATH | Install for PR/issue workflows |
| Android SDK | Not installed | Required for local MAUI Android builds; CI builds without it |

CI on GitHub Actions can run builds after push even when local Node/Android are missing.
