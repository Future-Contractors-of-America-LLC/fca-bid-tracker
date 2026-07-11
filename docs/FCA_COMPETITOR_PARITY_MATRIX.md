# FCA_COMPETITOR_PARITY_MATRIX

Status: Active  
Program: FCA Ecosystem 100% dual-track  
Updated: 2026-07-11  
Owners: Track A `auricrux-central` + `fca-bid-tracker`; Track B `Auricrux/fca-ecosystem`

## Purpose

Single shared capability matrix for competitor parity. Keep this file and the copy in `Auricrux/fca-ecosystem/docs/FCA_COMPETITOR_PARITY_MATRIX.md` in sync after every wave LOCK.

Columns: capability | competitor examples | Track A grade | Track B grade | proof | notes

Grade: `0` missing · `50` stub · `80` usable · `97+` lock-ready · `N/A` accepted gap

## Accepted residual gaps

| Gap | Status |
|-----|--------|
| UHD 3840×2160 AI generative render pipeline | Deferred (accepted) |
| Custom Auricrux live model | Wave M timed (~8h from 2026-07-11 17:36 ET) — Llama-3.2-3B-Instruct 4-bit |

## Capability rows (Wave 0 scaffold)

| Capability | Competitors | Track A | Track B | Proof | Notes |
|------------|-------------|---------|---------|-------|-------|
| Auth / session | Procore, ACC | 80 | 80 | LOCK0 | Seeded login banned on live hosts |
| Project / job spine | Procore, Buildertrend | 90 | 90 | #224+#227 / blitz D4 | |
| Files / evidence | Procore, ACC | 80 | 80 | | |
| Bid / estimate / proposal | BidNet, BuildingConnected | 85 | 90 | | |
| Takeoff | Bluebeam, PlanSwift | 85 | 80 | takeoff-quantity active | |
| RFI / CO / schedule / punch | Procore | 85 | 95 | blitz D5 | |
| Billing / pay apps / SOV | Procore Financials | 50 | 85 | A planned→Wave2 | |
| Job cost / accounting | QuickBooks, Foundation | 50 | 90 | A planned→Wave2 | |
| Warranty / recurring | ServiceTitan | 50 | 50 | Wave2 | |
| CRM / network / leads | JobNimbus, CoConstruct | 70 | 70 | | |
| Customer portal | CoConstruct | 85 | 85 | | |
| Comms / notifications | Procore | 80 | 80 | | |
| Admin / roles / multi-company | Procore | 70 | 70 | Wave4 | |
| Tenant customization / brand | Buildertrend | 75 | 60 | Wave4 | |
| Academy LMS | industry LMS | 85 | 95 | 1212 + compliance | |
| CTE mirror + insulation | VDOE CTE peers | 70 | 90 | Wave5 corpus | |
| CTE Auricrux preloaded text+audio+video every scenario | — | 40 | 50 | Wave5 LOCK | Full corpus required |
| Mobile / PWA field | Procore mobile | 70 | 80 | Wave6 | |
| Auricrux embedded SaaS/Academy | — | 80 | 80 | Wave0 ban + Wave M | Cloud Foundry/AOAI banned |
| M365 connectors | ACC | 40 | N/A | Wave6 A only if zero AI cost | B stays Graph-free |
| Horizontal scale | enterprise SaaS | 70 | 80 | Wave6 | B k8s/compose |

## Sync rule

After each wave LOCK, update grades + proof links in **both** repos in the same work session.
