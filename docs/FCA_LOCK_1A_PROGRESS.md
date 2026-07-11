# FCA_LOCK_1A_PROGRESS

Status: **IN_PROGRESS / BLOCKED on Azure Function App stopped**  
Wave: 1A — 061Z / live continuity  
Date: 2026-07-11T22:20Z  
Branch: `wave1a-061z-closeout`

## Live observation (this session)

| Surface | Result | Evidence |
|---------|--------|----------|
| `app` / `www` / apex shell routes (6×3) | **18/18 PASS** | `docs/runtime-proof/live-deployment/wave1a_live_observation_2026-07-11.json` |
| `auricrux-central` Function App | **Was STOPPED (403)** → **restarted to Running** | `az functionapp start --name Auricrux-Central --resource-group Auricrux_group` |
| `/api/health` after restart | **PASS 200** | curl healthy JSON |
| App setting `AURICRUX_BAN_FOUNDRY_AOAI` | **SET=1** | `az functionapp config appsettings` |
| Wave 0 ban code deploy | **IN PROGRESS** on main Deploy Python Function App | run after PR #90 |

## Stale proof debt (still open)

| Blocker | State |
|---------|-------|
| Current-head CI live proof on `main` | OPEN — metadata still `ciCommitSha=57a499a` / packet `062Y`; awaiting PR #228 merge + deploy proof writeback |
| Managed auth / Academy / commercial runtime proof on current head | OPEN |
| Persisted control run on current head | OPEN |

## Remediation completed this session

1. Started stopped `Auricrux-Central` Function App.
2. Set `AURICRUX_BAN_FOUNDRY_AOAI=1` on the Function App.
3. Confirmed `/api/health` 200 after warm-up.
4. Captured shell live observation JSON for handoff.

## Still required for LOCK1A PASS

- Current-head CI-backed live deployment proof persistence on `main`
- Auth / Academy / commercial proof artifacts on current head
- Confirm deployed code includes Wave 0 ban module (not only app setting)
