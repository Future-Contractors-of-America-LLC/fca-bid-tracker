# FCA Product Vision & Scope

Canonical summary aligned with `auricrux-central/FCA_COVERAGE_MATRIX.md` and live product surfaces.

**Last updated:** 2026-06-18

---

## One-line vision

**Future Contractors of America (FCA) is a unified commercial contractor operating system** — leads, bids, projects, plan room, billing, customer portal, and workforce training in one platform, with Auricrux as the embedded intelligence layer that explains, recommends, and executes next actions.

---

## Who it is for

Commercial contractors who need to compete with tools like **PlanHub** (leads), **Procore** (project management), **Bluebeam/ACC** (plans), **QuickBooks** (billing), and **NCCER-style LMS** (workforce training) — without running five disconnected systems.

---

## Product pillars

| Pillar | Customer name | What it delivers |
|--------|---------------|------------------|
| **Contractor Command** | SaaS workspace | Leads, estimates, projects, files, RFIs, billing, portal, support |
| **Academy** | LMS | Electrical apprenticeship L1–L10, safety, supervisor credentials |
| **Auricrux** | Guided operations | Next-action clarity across sales, delivery, comms, billing, training |
| **Mobile** | FCA Contractor Command app | Native iOS/Android (C# MAUI), same platform APIs |
| **Website** | futurecontractorsofamerica.com | Marketing, intake, checkout, sign-in |

---

## Lifecycle coverage (target state)

Lead ? Bid ? Estimate ? Proposal ? Award ? Project Setup ? Document Control ? Takeoff ? RFIs ? Change Orders ? Field/QC ? Billing ? Closeout/Warranty ? Academy ? Comms ? Admin

**Coverage law:** Every module must attach to tenant, project (where relevant), files/evidence, auditable outputs, and Auricrux read/act/review.

See full matrix: `auricrux-central-work/FCA_COVERAGE_MATRIX.md`

---

## Repo roles

| Repo | Role |
|------|------|
| `auricrux-central` | Canonical Python API + data store |
| `fca-bid-tracker` | React SPA — website, portal, academy UI |
| `fca-mobile-maui` | Native mobile (canonical; Expo deprecated) |

---

## Live today vs planned

| Capability | Status |
|------------|--------|
| Website SPA + intake + login | Live |
| Portal: messages, billing, support | Live (API-backed) |
| Projects, bids, files, academy-lms API | Live |
| RFIs / takeoffs | Shipping (table-backed) |
| Stripe revenue path | Test/live keys — founder action |
| SharePoint write bridge | Preflight only |
| Entra SSO | Planned — founder action |
| Full finance spine | Demo + routes; depth planned |
| SOC 2 / DPA | Founder/legal action |

---

## Brand rules

1. **FCA** is the primary customer-facing brand.
2. **Auricrux** is the embedded operating layer — not a separate product name on public pages.
3. No Tyler branding on customer routes.
4. Sales language only on public surfaces — no engineering/founder/dev jargon.

---

## Key documents

| Doc | Path |
|-----|------|
| Coverage matrix | `auricrux-central-work/FCA_COVERAGE_MATRIX.md` |
| System inventory | `auricrux-central-work/FCA_SYSTEM_INVENTORY.md` |
| Founder test access | `fca-bid-tracker-work/docs/FOUNDER_PRODUCT_TEST_ACCESS.md` |
| Founder completion | `fca-bid-tracker-work/docs/FOUNDER_COMPLETION_GUIDE.md` |
| Backend consolidation | `auricrux-central-work/BACKEND_CONSOLIDATION_STATUS.md` |

---

## SharePoint note

FCA M365/SharePoint intent is documented in `auricrux-central-work/docs/microsoft-365-tenant-connection.md`. SharePoint URLs in other products (e.g. Calyndra) are **not** FCA scope. Auricrux cannot pull arbitrary SharePoint files until founder grants Key Vault + Graph permissions.
