# FCA_CONTINUITY_LEDGER

Status: Active  
Purpose: Durable handoff so any agent/IDE can resume the FCA Ecosystem 100% dual-track program without chat context.

## Current

| Field | Value |
|-------|--------|
| Program | FCA Ecosystem 100% dual-track |
| Current wave | **0 LOCK PASS** â†’ next **1A + 1B** |
| Target | Dual Ecosystem100 + DNS cutover (Wave 7); Wave M model load ~T+8h |
| Track A repos | `Future-Contractors-of-America-LLC/fca-bid-tracker`, `auricrux-central`, `fca-mobile-maui` |
| Track B repo | `Auricrux/fca-ecosystem` |
| Plan file (local Cursor) | `~/.cursor/plans/fca_100_percent_b41632e8.plan.md` |

## Hard rules

1. No Microsoft Foundry / Azure OpenAI / OpenAI.com **runtime** agent/model calls (`AURICRUX_BAN_FOUNDRY_AOAI=1`).
2. CTE Auricrux = full preloaded corpus (every scenario + text + audio + video); never live inference.
3. Primary SaaS/Academy get live custom Auricrux at Wave M (Llama-3.2-3B-Instruct 4-bit via Copilot A / Ollama B).
4. Fail â†’ fix â†’ commit/push â†’ confirm â†’ next. Never leave PASS inferred.
5. After each wave, update this ledger + LOCK docs in **both** tracks.

## Wave status

| Wave | Status | LOCK artifact |
|------|--------|---------------|
| 0 Dual freeze | **PASS** | `docs/FCA_LOCK_0_CANONICAL.md` / Track B twin |
| 1A 061Z | PENDING | |
| 1B Sovereign staging | PENDING | |
| M Auricrux load | PENDING (~8h) | |
| 2 Spine | PENDING | |
| 3 Competitor parity | PENDING | |
| 4 Customization | PENDING | |
| 5 CTE corpus | PENDING | |
| 6 Mobile/scale | PENDING | |
| 7 Dual 100 + cutover | PENDING | |

## Last verified repo truth

- Ban module + chat gates landed on `auricrux-central` branch `wave0-dual-freeze`
- Matrix scaffold published
- `fca-ecosystem` sovereignty check already green on `main`

## Next concrete action

1. Merge/push Wave 0 PRs if not on `main`
2. Start Wave 1A against `docs/FCA_PACKET_061Z_*` in `fca-bid-tracker`
3. Start Wave 1B staging per `fca-ecosystem/docs/CUTOVER_RUNBOOK.md`

