# Backend & Admin Access  FCA SaaS + LMS

**Last updated:** 2026-06-19

Use these accounts to reach the **full SaaS workspace**, **Academy LMS**, **tenant admin controls**, and **Auricrux** on the live platform.

---

## Sign in & navigation

| Link | URL | Purpose |
|------|-----|---------|
| Sign in (header) | https://futurecontractorsofamerica.com/login | Standard customer login  no autofill |
| Admin workspace (header) | https://futurecontractorsofamerica.com/login?next=/portal/admin | Login then land on admin controls |
| Admin controls (after auth) | https://futurecontractorsofamerica.com/portal/admin | Direct route  auth guard redirects to login with `next=` |
| Platform dashboard | https://futurecontractorsofamerica.com/portal/platform | SaaS command center |
| Academy | https://futurecontractorsofamerica.com/academy | LMS catalog |

---

## Account matrix

### 1. Michael  founder (production account)

| Field | Value |
|-------|-------|
| Email | `michael@futurecontractorsofamerica.com` |
| Password | `MyGodiswithme01!` |
| Role | Founder / Owner |
| Customer ID | `CUST-FCA-FOUNDER-MICHAEL-001` |
| SaaS | Yes |
| LMS | Yes |
| Auricrux | Yes |
| Admin route | `/portal/admin` |

**Fast autologin:** https://futurecontractorsofamerica.com/login?seeded=1&autologin=1&account=founder&next=/portal/platform  
**Admin autologin:** https://futurecontractorsofamerica.com/login?seeded=1&autologin=1&account=founder&next=/portal/admin

### 2. Founder test (QA sandbox)

| Field | Value |
|-------|-------|
| Email | `founder.test@futurecontractorsofamerica.com` |
| Password | `FCA-HandsOff-2026!` |
| Role | Owner / Admin |
| SaaS | Yes |
| LMS | Yes |
| Auricrux | Yes |
| Admin route | `/portal/admin` |

**Fast autologin:** https://futurecontractorsofamerica.com/login?seeded=1&autologin=1&next=/portal/platform

### 3. Launch customer (full customer simulation)

| Field | Value |
|-------|-------|
| Email | `launch.customer@futurecontractorsofamerica.com` |
| Password | `FCA-Launch-2026!` |
| Role | Owner / Admin |
| SaaS | Yes |
| LMS | Yes |
| Auricrux | Yes |

### 4. System admin (backend administration)

| Field | Value |
|-------|-------|
| Email | `admin@futurecontractorsofamerica.com` |
| Password | `FCA-Admin-2026!` |
| Role | FCA System Admin |
| SaaS | Yes |
| LMS | Yes |
| Auricrux | Yes |
| Admin route | `/portal/admin` |

**Fast autologin:** https://futurecontractorsofamerica.com/login?seeded=1&autologin=1&account=admin&next=/portal/admin

---

## Azure backend (infrastructure)

These are the **hosted API and control plane** surfaces behind the web app:

| Resource | URL / location |
|----------|----------------|
| Auricrux Central API | https://auricrux-central.azurewebsites.net/api/health |
| Customer login API | `POST /api/customer-login` |
| Academy LMS API | `/api/academy-lms` |
| Azure Portal | https://portal.azure.com  search **auricrux-central** |
| Function App logs | Azure Portal ? auricrux-central ? Monitoring ? Log stream |
| App settings (managed auth) | `FCA_CUSTOMER_ACCOUNTS_JSON`, `FCA_SESSION_SECRET`, `FCA_ALLOW_SEEDED_LOGIN_FALLBACK` |

### Login troubleshooting

1. **Use exact passwords** above (case-sensitive).
2. If the central API is unreachable, the web app **falls back to seeded local accounts** with the same credentials.
3. If production has `FCA_CUSTOMER_ACCOUNTS_JSON` set without seeded fallback, ensure `FCA_ALLOW_SEEDED_LOGIN_FALLBACK=true` until Entra SSO is live.
4. Verify API:  
   ```powershell
   $body = @{ email = "admin@futurecontractorsofamerica.com"; password = "FCA-Admin-2026!" } | ConvertTo-Json
   Invoke-RestMethod -Uri "https://auricrux-central.azurewebsites.net/api/customer-login" -Method POST -Body $body -ContentType "application/json"
   ```

---

## Routes to verify after sign-in

| Area | Route |
|------|-------|
| SaaS dashboard | `/portal/platform` |
| Bids | `/portal/bids` |
| Projects | `/portal/projects` |
| Files / plan room | `/portal/files` |
| Billing | `/portal/billing` |
| Messages | `/portal/messages` |
| Support | `/portal/support` |
| Academy | `/portal/academy` or `/academy` |
| Auricrux | `/portal/auricrux` |
| **Admin / rollout** | `/portal/admin` |

---

## Security

Seeded accounts are for **founder and QA only**. Rotate passwords before customer GA and disable seeded fallback when Azure Entra SSO is promoted (`FOUNDER_COMPLETION_GUIDE.md`).

Do not publish passwords in marketing materials.
