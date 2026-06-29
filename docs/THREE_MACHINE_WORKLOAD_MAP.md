# THREE_MACHINE_WORKLOAD_MAP

Status: Active  
Date: 2026-06-29  
Organization: `Future-Contractors-of-America-LLC`  
Canonical copy: also in `auricrux-central/docs/THREE_MACHINE_WORKLOAD_MAP.md`

---

## Purpose

Map all FCA org repos and live infrastructure across **three machines** (Primary, Secondary, Laptop) so Cursor agents and humans apply the same boundaries before making changes.

**Core principle:** match machine to **permission profile**, not repo count. GitHub + Azure CI is the execution spine; Foundry is assistive only.

---

## Full org inventory (18 repos → 14 active)

| Repo | Product family | Status | Machine | Notes |
|------|----------------|--------|---------|-------|
| **fca-bid-tracker** | FCA / Auricrux | **Active** | **Primary** (+ CI) | Customer web shell; SWA + Functions; 15+ GitHub Actions |
| **auricrux-central** | FCA / Auricrux | **Active** | **Primary** | Governance + API spine; `auricrux-central.azurewebsites.net` |
| **fca-mobile-maui** | FCA / Auricrux | **Active** | **Primary** | Canonical mobile; .NET 8 + MAUI |
| **.github-private** | Org infra | **Active** | **Primary** | Org workflows/templates — Primary only |
| **calyndra-app** | Calyndra | **Active** | **Secondary** | Main Calyndra application |
| **calyndra-central** | Calyndra | **Active** | **Secondary** | Calyndra backend / central services |
| **calyndra-mobile-flutter** | Calyndra | **Active** | **Secondary** | Canonical Calyndra mobile |
| **calyndra-content** | Calyndra | **Active** | **Secondary** | AAC vocabulary, symbols, videos (Python pipelines) |
| **calyndra-agent** | Calyndra | **Active** | **Secondary** | Calyndra AI / agent runtime |
| **calyndra-system-law** | Calyndra | **Active** | **Secondary** | Governance docs |
| **calyndra-ip** | Calyndra | **Active** | **Secondary** | IP / originality docs |
| **roots-garden-central** | Root's Garden | **Active** | **Secondary** | Backend / central services |
| **roots-garden-app** | Root's Garden | **Active** | **Secondary** | Main application |
| **roots-garden-content** | Root's Garden | **Active** | **Secondary** | Content / assets |
| ~~auricrux-bid-api-node~~ | FCA / Auricrux | **Archive** | None | Inactive; API in fca-bid-tracker / auricrux-central |
| ~~fca-mobile~~ | FCA / Auricrux | **Archive** | None | Legacy; Firebase always used `fca-mobile-maui` |
| ~~calyndra-mobile~~ | Calyndra | **Archive** | None | Legacy; Firebase always used `calyndra-mobile-flutter` |
| ~~demo-repository~~ | Org infra | **Archive** | None | GitHub default demo |

**Canonical FCA API path:** `fca-bid-tracker` (Functions/SWA) + `auricrux-central` — not `auricrux-bid-api-node`.

---

## Live infrastructure (confirmed)

All three product families have **Azure Static Web Apps**. FCA and Calyndra have **Firebase demo mobile apps** shipped from the canonical mobile repos.

| Product | Web (SWA) | Backend central | Mobile demo (live) | Mobile source repo |
|---------|-----------|-----------------|-------------------|-------------------|
| **FCA** | `fca-bid-tracker` → SWA | `auricrux-central` | Firebase demo | `fca-mobile-maui` |
| **Calyndra** | `calyndra-app` → SWA | `calyndra-central` | Firebase demo | `calyndra-mobile-flutter` |
| **Root's Garden** | `roots-garden-app` → SWA | `roots-garden-central` | — | web-first |

**Firebase deploy source:** always `fca-mobile-maui` and `calyndra-mobile-flutter` — never legacy mobile repos.

**Deploy ownership:**

- **Primary** — FCA SWA (GitHub Actions in `fca-bid-tracker`), `auricrux-central`, FCA Firebase, `fca-mobile-maui`
- **Secondary** — Calyndra SWA, Calyndra Firebase, Root's Garden SWA, Flutter/Python content pipelines
- **Laptop** — FCA SWA + Firebase verification (read-only); no deploy keys

---

## Capability matrix

| Capability | Primary | Secondary | Laptop (no admin) |
|------------|---------|-----------|-------------------|
| FCA / Auricrux implementation | **Owner** | Never | Review / triage only |
| Calyndra + Root's Garden implementation | Never | **Owner** | Review only |
| Azure SWA deploy (FCA) | Yes (founder-gated) | No | Verify only |
| Azure SWA deploy (Calyndra / RG) | No | Yes | No |
| Firebase demo (FCA) | **Owner** | No | Read-only console |
| Firebase demo (Calyndra) | No | **Owner** | No |
| GitHub Actions monitoring (FCA) | Yes | — | **Best fit** |
| Live FCA site verification | Yes | Yes | **Best fit** |
| Continuity docs / packets (FCA) | Yes | — | **Best fit** |
| `.github-private` changes | **Primary only** | No | No |

---

## Machine 1 — Primary: FCA / Auricrux Build Factory

**Active repos:** `fca-bid-tracker`, `auricrux-central`, `fca-mobile-maui`, `.github-private`

**Live infra:** FCA SWA + Functions + Entra + DNS, `auricrux-central` App Service, FCA Firebase (from MAUI), Foundry/`auricrux-agent` when needed

**Toolchain:** Node 24, Azure CLI, GitHub CLI, .NET 8 + MAUI, Firebase CLI

**Rules:**

1. Default build path: push to `main` → GitHub Actions → deploy → smoke verify
2. Only Primary touches FCA deploy secrets and `.github-private`
3. Do not clone Calyndra/RG on Primary unless debugging cross-product issues

---

## Machine 2 — Secondary: Calyndra + Root's Garden Studio

**Active repos (10):** all `calyndra-*` (except archived `calyndra-mobile`) and all `roots-garden-*`

**Toolchain:** Python 3, Pillow/ffmpeg, Flutter, Dart, Git, Firebase CLI, Azure CLI (Calyndra/RG SWA only)

**Rules:**

1. Pattern per product: `*-central` + `*-app` + `*-content`
2. Content pipelines are bursty — never on FCA CI path
3. Never use FCA SWA deploy tokens on Secondary repos
4. `calyndra-agent` isolated from FCA Foundry unless explicitly integrated
5. Calyndra Firebase stays on Secondary only

---

## Machine 3 — Laptop: FCA Operations + Continuity Console

**Scope:** read/review/triage on `fca-bid-tracker`, `auricrux-central`, `fca-mobile-maui`, `.github-private` (review only)

**Do not primary-dev:** all `calyndra-*`, all `roots-garden-*`

**Daily loop:**

1. Check GitHub Actions on `fca-bid-tracker`
2. Verify `futurecontractorsofamerica.com`, `/deployment-status.json`, `/live-shell-verification.html`
3. Spot-check FCA Firebase demo (read-only)
4. Triage `fca-bid-tracker` issues
5. Update continuity packet / ledger docs
6. Escalate to Primary: DNS, Entra, SWA token refresh, Firebase blockers

---

## Cross-machine workflow

1. **Laptop** — triage, verify, document (FCA only)
2. **Primary** — implement FCA; push; CI proves it
3. **Laptop** — confirm live; close continuity loop
4. **Secondary** — Calyndra/RG on independent schedule; never blocks FCA deploy

---

## Isolation rules

1. Separate working directories — no monorepo-merge across product families
2. Separate SWA deploy secrets per product
3. Separate CI `concurrency:` groups for Calyndra/RG vs FCA SWA workflows
4. Shared Azure subscription is OK — isolate by resource, secret, and machine
5. Separate Firebase projects — FCA on Primary, Calyndra on Secondary
6. Laptop Cursor workspace = `fca-bid-tracker` only for primary dev

---

## Resolved decisions

| Decision | Outcome |
|----------|---------|
| `auricrux-bid-api-node` | Inactive → archive |
| `fca-mobile` / `calyndra-mobile` | Archive; Firebase always used MAUI/Flutter |
| `demo-repository` | Archive |
| Production hosting | All 3 products have live SWAs |
| Firebase source | `fca-mobile-maui` / `calyndra-mobile-flutter` |

**GitHub archive pass (unblocked):** `fca-mobile`, `calyndra-mobile`, `demo-repository`, `auricrux-bid-api-node` — disable Actions/secrets first.

---

## Pending execution items

1. Laptop-only FCA playbook (bookmarks, daily checklist, escalation matrix)
2. Primary toolchain checklist
3. Secondary toolchain checklist
4. GitHub archive pass on Primary

---

## Agent instruction

Before making cross-repo or deploy changes, read this document. If the current machine role is unclear, ask the user: Primary, Secondary, or Laptop?
