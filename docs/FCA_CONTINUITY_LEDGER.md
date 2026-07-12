# FCA_CONTINUITY_LEDGER

Status: Active  
Purpose: Durable handoff so any agent/IDE can resume the FCA Ecosystem 100% dual-track program without chat context.

## Current

| Field | Value |
|-------|--------|
| Program | FCA Ecosystem 100% dual-track |
| Current wave | **1A deep lanes CLOSED** (`FCA_LOCK_1A_CANONICAL.md`); Track A Wave 6 m365 active; **M/7** external gates |
| Target | Dual Ecosystem100 + DNS cutover (Wave 7); Wave M finetuned load |
| Track A repos | `Future-Contractors-of-America-LLC/fca-bid-tracker`, `auricrux-central`, `fca-mobile-maui` |
| Track B repo | `Auricrux/fca-ecosystem` |
| Plan file (local Cursor) | `~/.cursor/plans/fca_100_percent_b41632e8.plan.md` |

## Hard rules

1. No Microsoft Foundry / Azure OpenAI / OpenAI.com **runtime** agent/model calls (`AURICRUX_BAN_FOUNDRY_AOAI=1`).
2. CTE Auricrux = full preloaded corpus (every scenario + text + audio + video); never live inference.
3. Primary SaaS/Academy get live custom Auricrux at Wave M (finetuned via Copilot A / Ollama B).
4. Fail → fix → commit/push → confirm → next. Never leave PASS inferred.
5. After each wave, update this ledger + LOCK docs in **both** tracks.

## Wave status

| Wave | Status | LOCK artifact |
|------|--------|---------------|
| 0 Dual freeze | **PASS** | `docs/FCA_LOCK_0_CANONICAL_SHELL.md` |
| 1A current-head + deep lanes | **PASS** | `docs/FCA_LOCK_1A_CANONICAL.md` + live auth/commerce probes |
| 1B Sovereign staging | **PASS** (Track B) | `fca-ecosystem/docs/FCA_LOCK_1B_SOVEREIGN.md` |
| M Auricrux load | **PROGRESS** | Track B `FCA_LOCK_M_PROGRESS.md` |
| 2 Spine | **PASS** (central warranty-recurring) | central LOCK2 |
| 3–5 | See Track B locks | ecosystem PRs |
| 6 Mobile/M365 | **PASS** (Track A m365 zero-LLM bridge) | central `FCA_LOCK_6_PROGRESS.md` |
| 7 Dual 100 + cutover | **PROGRESS** (DNS founder-gated) | Track B LOCK7 |

## Last verified repo truth

- Academy SWA `/academy*` + commerce API live PASS (lms-repair CLOSED 2026-07-12)
- Managed auth + commercial live on `api.futurecontractorsofamerica.com` (intake HTTP 201)
- Residual: SWA same-origin `/api/customer-*` 404 — frontend uses `api.*`
- SWA resource: `fca-frontend` in `fca-frontend_group` (linked to `Auricrux-Central`)

## Next concrete action

1. Wave M when finetuned weights ready
2. Founder DNS cutover when Track B grades accepted
3. Optional: fix SWA same-origin customer-* proxy fall-through (non-blocking)
