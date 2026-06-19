# FCA Product Test Access ù Founder & QA

Use these credentials to sign in and test **SaaS** (portal, projects, bids, billing) and **Academy LMS** on the live platform.

**Last updated:** 2026-06-19

---

## Live URLs

| Surface | URL |
|---------|-----|
| Website (React SPA) | https://futurecontractorsofamerica.com |
| Sign in | https://futurecontractorsofamerica.com/login |
| Admin workspace (login with redirect) | https://futurecontractorsofamerica.com/login?next=/portal/admin |
| Platform dashboard | https://futurecontractorsofamerica.com/portal/platform |
| Academy | https://futurecontractorsofamerica.com/academy |
| API (direct) | https://auricrux-central.azurewebsites.net/api/health |

---

## Michael ù founder account (primary)

| Field | Value |
|-------|-------|
| **Email** | `michael@futurecontractorsofamerica.com` |
| **Password** | `MyGodiswithme01!` |
| **Company** | Future Contractors of America |
| **Role** | Founder / Owner |
| **Customer ID** | `CUST-FCA-FOUNDER-MICHAEL-001` |
| **Plan** | Enterprise |
| **SaaS** | Enabled |
| **LMS (Academy)** | Enabled |
| **Auricrux** | Enabled |

### Fast sign-in links

- **Login page:** https://futurecontractorsofamerica.com/login  
- **Founder autologin (platform):** https://futurecontractorsofamerica.com/login?seeded=1&autologin=1&account=founder&next=/portal/platform  
- **Founder autologin (admin):** https://futurecontractorsofamerica.com/login?seeded=1&autologin=1&account=founder&next=/portal/admin  
- **Academy after login:** https://futurecontractorsofamerica.com/academy  

---

## QA test account (sandbox)

| Field | Value |
|-------|-------|
| **Email** | `founder.test@futurecontractorsofamerica.com` |
| **Password** | `FCA-HandsOff-2026!` |
| **Company** | Future Contractors of America Test Workspace |
| **Plan** | Enterprise |
| **SaaS** | Enabled |
| **LMS (Academy)** | Enabled |
| **Auricrux** | Enabled |

### Fast sign-in links

- **Instant workspace (demo autologin):** https://futurecontractorsofamerica.com/login?seeded=1&autologin=1&next=/portal/platform  

---

## Alternate launch account

| Field | Value |
|-------|-------|
| **Email** | `launch.customer@futurecontractorsofamerica.com` |
| **Password** | `FCA-Launch-2026!` |
| **SaaS + LMS** | Both enabled |

---

## System admin account (backend + admin route)

| Field | Value |
|-------|-------|
| **Email** | `admin@futurecontractorsofamerica.com` |
| **Password** | `FCA-Admin-2026!` |
| **Role** | FCA System Admin |
| **Admin route** | `/portal/admin` |

Full matrix: `docs/BACKEND_ADMIN_ACCESS.md`

---

## What to test after sign-in

### SaaS (Contractor Command)

| Route | What you should see |
|-------|---------------------|
| `/portal/platform` | Command dashboard, project snapshot |
| `/portal/bids` or bids area | Lead/bid list from API |
| `/portal/projects` | Active jobs, stages, next steps |
| `/portal/files` | Plan room documents |
| `/portal/messages` | Customer communications |
| `/portal/billing` | Invoices and payment status |
| `/portal/support` | Support cases |

### Academy LMS

| Route | What you should see |
|-------|---------------------|
| `/academy` | Training catalog, programs |
| `/academy/catalog` | Electrical apprenticeship L1ùL10 pathways |

**API check (no login required for catalog read):**
```powershell
curl https://auricrux-central.azurewebsites.net/api/academy-lms
```

### Mobile (optional)

Same platform APIs via **FCA Contractor Command** (.NET MAUI):  
https://github.com/Future-Contractors-of-America-LLC/fca-mobile-maui

---

## API smoke test (PowerShell)

```powershell
$base = "https://auricrux-central.azurewebsites.net/api"
@("health","bids","projects","files","academy-lms","portal-messages","portal-invoices","support-tickets") | ForEach-Object {
  $r = Invoke-WebRequest -Uri "$base/$_" -UseBasicParsing
  Write-Host "$_ -> $($r.StatusCode)"
}
```

**Login test:**
```powershell
$body = @{ email = "michael@futurecontractorsofamerica.com"; password = "MyGodiswithme01!" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://auricrux-central.azurewebsites.net/api/customer-login" -Method POST -Body $body -ContentType "application/json"
```

Expect `"ok": true` in the response.

---

## SharePoint / M365 (not yet writable)

SharePoint bridge is **read/preflight only** today. Founder actions for full M365 write access are in `FOUNDER_COMPLETION_GUIDE.md` Section 4.

Auricrux can surface SharePoint-linked content once Key Vault + Graph permissions are granted ù not available for self-serve testing yet.

---

## Security note

These are **seeded demo accounts** for product testing. Rotate passwords and disable seeded fallback after Azure Entra SSO is live (`FOUNDER_COMPLETION_GUIDE.md` Section 3).

Do not share passwords in customer-facing materials or store listings.
