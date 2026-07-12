# FCA_COMPETITOR_PARITY_MATRIX

Status: Active  
Program: FCA Ecosystem 100% dual-track  
Updated: 2026-07-12  
Canonical twin: `Future-Contractors-of-America-LLC/auricrux-central/docs/FCA_COMPETITOR_PARITY_MATRIX.md`  
Also mirrored in: `fca-bid-tracker/docs/FCA_COMPETITOR_PARITY_MATRIX.md`

## Purpose

Shared competitor capability matrix. Sync grades after every wave LOCK.

Grade: `0` missing · `50` stub · `80` usable · `97+` lock-ready · `N/A` accepted gap

## Accepted residual gaps

| Gap | Status |
|-----|--------|
| UHD 3840×2160 AI generative render pipeline | **Sole open accepted gap** — deferred; not a cutover gate |
| Custom Auricrux live model (finetuned weights) | Wave M — **PASS** (`auricrux-fca` Q4_K_M on Ollama; see LOCK_M) |

## Capability rows (post Waves 2–5 Track B)

| Capability | Competitors | Track A | Track B | Proof | Notes |
|------------|-------------|---------|---------|-------|-------|
| Auth / session | Procore, ACC | 80 | 80 | LOCK0 / Keycloak path | Seeded login banned on live hosts |
| Project / job spine | Procore, Buildertrend | 90 | 90 | blitz D4 / Projects API | |
| Files / evidence | Procore, ACC | 80 | 80 | Files portal | |
| Bid / estimate / proposal | BidNet, BuildingConnected | 85 | 90 | Bids/Estimates/Proposals pages | |
| Takeoff | Bluebeam, PlanSwift | 85 | 80 | Quantity path on A; B usable | |
| RFI / CO / schedule / punch | Procore | 85 | 95 | blitz D5 / portal pages | |
| Billing / pay apps / SOV | Procore Financials | 55 | 88 | Wave2 B recurring + payments | A Wave2 DoTeach in flight |
| Job cost / accounting | QuickBooks, Foundation | 55 | 92 | JobCost API+portal on B | A planned Wave2 |
| Warranty / recurring | ServiceTitan | 60 | 88 | Wave2 B CRUD+advance+run; A warranty DoTeach PR | Closeout portal lists open warranty |
| CRM / network / leads | JobNimbus, CoConstruct | 70 | 72 | Leads page | |
| Customer portal | CoConstruct | 85 | 88 | Portal shell + closeout | |
| Comms / notifications | Procore | 80 | 80 | | |
| Admin / roles / multi-company | Procore | 70 | 72 | Wave4 partial | Role headers on customization |
| Tenant customization / brand | Buildertrend | 85 | 85 | Wave4 **PASS** A brandSkin+Portal Profile+session API; B API+console UI + tests | `FCA_LOCK_4_CANONICAL.md` |
| Academy LMS | industry LMS | 85 | 95 | Compliance matrix 100% items | |
| CTE mirror + insulation | VDOE CTE | 70 | 92 | VA CTE catalog + originality policy | |
| CTE Auricrux preloaded text+audio+video every scenario | — | 45 | 90 | Wave5 corpus scaffold 831/831 (100% IDs) | Media files may be placeholders; **no live LLM** |
| Mobile / PWA field | Procore mobile | 70 | 82 | Wave6 PWA shell + field-tasks→WorkOrders | |
| Auricrux embedded SaaS/Academy | — | 90 | 90 | Wave M **PASS** `auricrux-fca` | No Foundry/AOAI; CTE remains preloaded-only |
| M365 connectors | ACC | 70 | N/A | Wave6 **Track A active** (zero-LLM bridge) | B stays Graph-free; live Graph probe unauthorized |
| Horizontal scale | enterprise SaaS | 70 | 82 | Wave6 `infra/k8s` replicas=2 | Compose/k8s smoke docs |
| Field execution / work orders | ServiceTitan, Procore | 65 | 85 | Wave3 build-to-beat: `portal/field-tasks` → WorkOrders API | |

## Sole open product gap (non-UHD)

None beyond accepted UHD. Wave M (`auricrux-fca`) and Wave 4 branding are **PASS**. Everything else is shipped at stub/usable depth.

## Sync rule

After every wave LOCK, copy this file to Track A twins (`auricrux-central`, `fca-bid-tracker`) in a separate PR when practical.
