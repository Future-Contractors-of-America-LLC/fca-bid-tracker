# FCA_LOCK_1A_CANONICAL

Status: **PASS (deep lanes closed with residual SWA same-origin auth note)**  
Wave: 1A — Canonical live deployment + deep runtime lanes  
Date: 2026-07-12T10:30Z  
Repos: `Future-Contractors-of-America-LLC/fca-bid-tracker`, `auricrux-central`  
Ban: `AURICRUX_BAN_FOUNDRY_AOAI=1` (no Foundry/AOAI calls this session)

## Deep lanes

| Lane | Result | Evidence |
|------|--------|----------|
| Academy SWA `/academy*` shells | **PASS** | `runLmsSwaProbes` → 200 SPA shell + `academy-commerce` API on `api.*` |
| Academy API (`academy-lms`, `academy-commerce`) | **PASS** | HTTP 200 on Function App + `api.futurecontractorsofamerica.com` + SWA linked paths |
| Managed auth (live) | **PASS** | `customer-auth-state` / `customer-session` HTTP 200 on `api.*` + Central; `productionAuthReady=true` |
| Commercial (live) | **PASS** | `commercial-pipeline` 200; `fca-payments/status` rail=`fca-native`; `POST fca-payments/intake` **201** with intake id |
| Marker validators | **PASS** | `validate:managed-auth-commercial-runtime` (repo markers) + new live probe script |

## Residual (non-blocking)

- SWA same-origin `www`/`app`/`delightful-mushroom…` `/api/customer-*` and `/api/fca-payments/status` return **404** (empty body). Canonical auth/commercial plane is **`https://api.futurecontractorsofamerica.com`** via `FCA_API_ORIGIN` / `centralFetch`. Frontend does not depend on SWA same-origin for those routes.
- Stale hostname `fca-frontend.azurestaticapps.net` is **not** the live SWA default (`delightful-mushroom-0de67860f.7.azurestaticapps.net` in `fca-frontend_group`).

## Artifacts

- `docs/FCA_LOCK_1A_PROGRESS.md` (prior current-head proof)
- `docs/qc/managed-auth-commercial-live-latest.md` (this session)
- `docs/qc/lms-repair-latest.md` (refreshed closed)
- `scripts/validate-managed-auth-commercial-live.mjs`

## Closed vs prior OPEN

Prior `lms-repair-latest.md` (2026-07-04) reported SWA shell OK + API probe 404. Re-probe 2026-07-12: Academy SWA probes **PASS**; commerce/LMS APIs **200**.
