# Founder Week-Complete Checklist

**Product:** FCA Contractor Command — one unified ecosystem  
**Target:** Michael sells; Auricrux operates delivery  
**Last updated:** 2026-06-27

---

## Automated green (loops verify)

| Lane | Validation | Status |
|------|------------|--------|
| Unified ecosystem | `node scripts/validate-fca-ecosystem-golden-path.mjs` | Run in CI / ecosystem-operate loop |
| Commerce fast lane | `python scripts/loops/commerce_operate_loop.py` | */30 schedule |
| Ecosystem operate | `python scripts/loops/ecosystem_operate_loop.py` | */30 schedule |
| Master orchestrator | `python scripts/auricrux_loop_runner.py` | */15 schedule |
| Perfection full tier | `node scripts/perfection/run_ecosystem_perfection.mjs --tier full` | Day 7 gate |

---

## One-system definition of done

- [ ] Single tenant spine: purchases activate workspace + academy capabilities on one customer record
- [ ] Checkout success shows unified FCA activation (workspace + academy links)
- [ ] Product access panel reads as one ecosystem, not split products
- [ ] Auricrux embedded on portal, academy, and website journey layer
- [ ] Academy modules link back to workspace execute paths
- [ ] Parallel loops run without commerce blocking other lanes (anti-stall rule)

---

## Founder actions only (rare)

| Item | Required for week 1? | Notes |
|------|---------------------|-------|
| GitHub secrets `FCA_SIM_LOGIN_*` | Recommended | Enables full login sim in CI |
| `FCA_SESSION_SECRET` in Azure | Recommended | Fail-closed production auth |
| Real bank ACH memo for live transfers | When first real payment | FCA native rail default |
| Stripe `FCA_STRIPE_FALLBACK=1` | Optional | Cards only if desired |
| Entra SSO | Optional | Enterprise buyers |
| App store publish | Defer | `founder-blocked` in coverage matrix |

---

## Michael's revenue role (ongoing)

1. **Sell Academy** to trade schools and students — `/academy/store`
2. **Sell workspace** pilots and plans to contractors — `/pricing`
3. **Read founder revenue cockpit** on `/portal/platform`
4. **Use comms queue drafts** from sales templates (Academy + SaaS pitches)
5. **Do not** operate as an active GC or run fake demo bids in production

---

## SLA velocity targets

| Tier | Target | Example |
|------|--------|---------|
| Micro | ≤15 min | One probe fix, one CTA wire |
| Small | ≤2 hours | One capability lane green |
| Medium | ≤1 day | Unified checkout E2E on production |
| Large | ≤3 days | Full lifecycle + Auricrux execute live |
| Complete | Day 7 | This checklist green except founder-blocked items |

---

## Anti-stall rule

If commerce fast lane is green for **2 consecutive cycles**, no loop may defer execution, comms, frontend, or backend work citing commerce. Commerce re-opens only on regression.

---

## Quick verify commands

```powershell
cd auricrux-central
python scripts/loops/ecosystem_operate_loop.py
python scripts/loops/commerce_operate_loop.py

cd ..\fca-bid-tracker
$env:FCA_CENTRAL_ROOT = "..\auricrux-central"
node scripts/validate-fca-ecosystem-golden-path.mjs
```

When all pass: **revenue-ready** — Michael sells, system delivers.
