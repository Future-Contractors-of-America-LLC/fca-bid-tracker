# FCA_CONTINUITY_LEDGER

Status: Active  
Purpose: Durable handoff so any agent/IDE can resume the FCA Ecosystem 100% dual-track program without chat context.

## Current

| Field | Value |
|-------|--------|
| Program | FCA Ecosystem 100% dual-track |
| Current wave | **Ecosystem100 PASS** (Waves 0–7 + M); UHD residual; registrar DNS CNAME founder-gated |
| Target | Keep live; registrar CNAME when ready; UHD generative later |
| Track A repos | `Future-Contractors-of-America-LLC/fca-bid-tracker`, `auricrux-central`, `fca-mobile-maui` |
| Track B repo | `Auricrux/fca-ecosystem` |
| Plan file (local Cursor) | `~/.cursor/plans/fca_100_percent_b41632e8.plan.md` |

## Hard rules

1. No Microsoft Foundry / Azure OpenAI / OpenAI.com **runtime** agent/model calls (`AURICRUX_BAN_FOUNDRY_AOAI=1`).
2. CTE Auricrux = full preloaded corpus (every scenario + text + audio + video); never live inference.
3. Primary SaaS/Academy use live custom Auricrux via Ollama (`auricrux-fca` finetuned Q4_K_M). Never Foundry/AOAI.
4. Fail → fix → commit/push → confirm → next. Never leave PASS inferred.
5. After each wave, update this ledger + LOCK docs in **both** tracks.

## Wave status

| Wave | Status | LOCK artifact |
|------|--------|---------------|
| 0 Dual freeze | **PASS** | `docs/FCA_LOCK_0_CANONICAL_SHELL.md` |
| 1A current-head + deep lanes | **PASS** | `docs/FCA_LOCK_1A_CANONICAL.md` + live auth/commerce probes |
| 1B Sovereign staging | **PASS** (Track B) | `fca-ecosystem/docs/FCA_LOCK_1B_SOVEREIGN.md` |
| M Auricrux load | **PASS** | central/ecosystem `FCA_LOCK_M_PROGRESS.md` + proof JSON (`auricrux-fca`) |
| 2 Spine | **PASS** (central warranty-recurring) | central LOCK2 |
| 3 Field / CTE spine | **PASS** | ecosystem LOCK3 |
| 4 Customization / branding | **PASS** (Track A brandSkin + session API) | `docs/FCA_LOCK_4_CANONICAL.md` |
| 5 CTE corpus | **PASS** (CTE 831/831 IDs; preloaded only — no live LLM) | ecosystem LOCK5 |
| 6 Mobile/M365 | **PASS** (Track A m365 zero-LLM bridge) | central `FCA_LOCK_6_PROGRESS.md` |
| 7 Dual 100 + cutover | **PASS** (engineering); registrar DNS founder-gated | Track B LOCK7 / ECOSYSTEM_100 |

## Last verified repo truth

- Academy SWA `/academy*` + commerce API live PASS (lms-repair CLOSED 2026-07-12)
- Managed auth + commercial live on `api.futurecontractorsofamerica.com` (intake HTTP 201)
- Wave M: Function App `OLLAMA_HOST=http://20.230.87.21:11434`, model `auricrux-fca`, GGUF SHA256 `46296daa…012d`
- Wave 4: Track A `brandSkin` (companyName, welcomeMessage, accent/surface, primaryColor, secondaryColor, dashboardLayout) + Portal Profile persistence
- Residual: SWA same-origin `/api/customer-*` 404 — frontend uses `api.*`
- SWA resource: `fca-frontend` in `fca-frontend_group` (linked to `Auricrux-Central`)

## Next concrete action

1. Founder registrar DNS CNAME for production apex / ecosystem hostname when ready
2. Keep Ollama serve host healthy or migrate GGUF to durable sovereign host
3. Optional: fix SWA same-origin customer-* proxy fall-through (non-blocking)
