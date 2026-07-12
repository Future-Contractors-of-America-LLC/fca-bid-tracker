# FCA_LOCK_4_CANONICAL

Status: **PASS**  
Wave: 4 — Tenant branding / customization (Track A)  
Date: 2026-07-12  
Repos: `Future-Contractors-of-America-LLC/fca-bid-tracker`  
Ban: `AURICRUX_BAN_FOUNDRY_AOAI=1` (no Foundry/AOAI calls this session)

## Verdict

Track A Wave 4 tenant branding is **PASS** via session `brandSkin` preferences, Portal Home/Profile UI, and customer-session API persistence. Track B CustomerCustomization API+console remains the deeper sovereign twin (`fca-ecosystem` → `docs/FCA_LOCK_4_SOVEREIGN.md`).

## `brandSkin` contract

| Field | Values / notes |
|-------|----------------|
| `companyName` | Tenant display name |
| `welcomeMessage` | Portal welcome copy |
| `accent` / `surface` | Legacy color tokens (kept for existing portal surfaces) |
| `primaryColor` | Primary brand color |
| `secondaryColor` | Secondary / surface brand color |
| `dashboardLayout` | `balanced` \| `compact` \| `dense` |

## Surfaces

| Surface | Result | Notes |
|---------|--------|-------|
| `normalizeBrandSkin` (`src/customerSession.js`) | **PASS** | Normalizes full brandSkin including primary/secondary/layout |
| Portal Home | **PASS** | Customer-branded workspace card (name, welcome, accent/surface) |
| Portal Profile | **PASS** | Edit + persist brandSkin via session API |
| `PATCH /api/customer-session` | **PASS** | Preference round-trip when session token present |

## Round-trip

```text
edit brandSkin on Portal Profile
  → persistCustomerPreferences / PATCH customer-session
  → reload / hydrateCustomerSession
  → values match (server when token present; else local session)
```

## Residual

- Full white-label / custom workflows / custom fields remain feature-flag / Track B depth.
- Multi-company admin depth still partial (~72 on parity matrix).
