# FCA_CONTINUITY_LEDGER

Status: Active  
Purpose: Durable handoff so any agent/IDE can resume the FCA Ecosystem 100% dual-track program without chat context.

## Current

| Field | Value |
|-------|--------|
| Program | FCA Ecosystem 100% dual-track |
| Current wave | **1A PASS** (current-head proof #230); Track B through Wave 6 executable; **M/7** external gates |
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
| 1A current-head proof | **PASS** | `docs/FCA_LOCK_1A_PROGRESS.md` + live-deployment proof bundle |
| 1B Sovereign staging | **PASS** (Track B) | `fca-ecosystem/docs/FCA_LOCK_1B_SOVEREIGN.md` |
| M Auricrux load | **PROGRESS** | Track B `FCA_LOCK_M_PROGRESS.md` |
| 2 Spine | **PASS** (central warranty-recurring) | central LOCK2 |
| 3–6 | See Track B locks | ecosystem PRs #14/#15 |
| 7 Dual 100 + cutover | **PROGRESS** (DNS founder-gated) | Track B LOCK7 |

## Last verified repo truth

- PR **#230** merged — current-head live proof + Windows ESM stamp fix
- PR **#231** merged — parity matrix sync
- Stale PRs #222/#223 closed
- No open PRs on this repo

## Next concrete action

1. Keep live SWA fingerprint aligned after deploys
2. Wave M when finetuned weights ready
3. Founder DNS cutover when Track B grades accepted
