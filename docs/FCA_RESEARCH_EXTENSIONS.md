# FCA Research Extensions (Cycle 9)

Web research informing FCA/Auricrux slices beyond the current coverage matrix. These are **roadmap accelerators**, not external dependencies — implementation stays on the FCA sovereign spine per `FCA_SOVEREIGNTY_LAW.md`.

## Lead / Opportunity (Slice 01)

**Industry pattern:** Construction CRMs fail when they mirror generic SaaS stages ("Discovery", "Negotiation") instead of bid-native flows: Lead Received ? Qualification ? Estimating ? Submitted ? Awarded ? Lost.

**Sources:**
- [OpsRev — Construction CRM 2026](https://www.opsrev.ai/blog/construction-crm-guide/) — bid tracking, estimating visibility, win/loss discipline
- [Vise Systems — Contractor CRM setup](https://visebuilt.com/blog/contractor-crm-setup/) — map your actual pipeline before picking software
- [iRecruit — CRM implementation guide](https://www.irecruit.co/insights/implementing-construction-company-crm-step-by-step-guide/) — Pursuit ? Bid ? Award alignment; automated follow-up within minutes

**FCA mapping (implemented Cycle 9):**
- `/intake` governed lead capture ? Central `bids`
- `/portal/pipeline` qualify ? award ? invoice wizard
- Mobile `SubmitLeadIntakeAsync` + `QualifyLeadAsync` on Central PATCH `bids`

## Estimate / Proposal / Award (Slices 03–05)

**Industry pattern:** Eliminate re-entry between estimate, proposal, and job setup; automate bid-deadline and post-submission follow-ups.

**Sources:**
- [ConstructionBids.ai — CRM guide 2026](https://constructionbids.ai/blog/construction-crm-software-guide/) — customizable bid stages, 24h follow-up discipline, pipeline stagnation automation
- [Ringy — CRM construction services](https://www.ringy.com/articles/crm-construction-services/) — bid ? build ? close in one platform

**FCA mapping (implemented Cycle 9):**
- `PortalEstimates` — `advanceEstimate`, `generateProposal`
- `PortalProposals` — `advanceProposal` (send / approve)
- `PortalPipeline` — `markWonAndCreateProject` award conversion
- Precon tether APIs (`precon-continuity`, `sync-estimate`, `price-estimate`)

## Plan / Spec Briefing (Slice 08)

**Industry pattern:** Cross-document intelligence (drawings + specs + RFIs) with cited gaps and recommended next actions — not isolated file viewers.

**Sources:**
- [Helonic — AI document review](https://helonic.com/features/ai-document-review/) — parallel read of drawings, specs, RFIs, submittals
- [Cadient SmartPlans](https://cadient.ai/smart-plans) — governed Q&A with sheet citations and conflict detection
- [Zacua Ventures — AI for Construction 2026](https://zacuaventures.com/ai-for-construction-%C2%B7-industry-report-2026/) — shared data layer across RFIs, submittals, change orders

**FCA mapping (implemented Cycle 9):**
- `PortalFiles` — `create-briefing` with `AuricruxBriefingCard` (key facts, gaps, next actions)
- `design/intelligence` API on Central
- Auricrux insight panels on file and design surfaces

## FCA Native Formats (FCAM / FCAS / FCAP)

**Industry pattern:** Sovereign viewing and export without mandatory Autodesk/ACC runtime on customer paths; optional interop for migration only.

**FCA mapping (implemented Cycle 9):**
- `GET /api/files/{id}/fcam-stream` — governed FCAM element cache
- `GET /api/files/{id}/fcas-stream` — sheet manifest stream
- `POST /api/projects/{id}/fca-export` — FCAP package (FCAM + FCAS + markups)
- Design Workspace `FcaNativeViewerPanel` loads streams; `ApsInteropPanel` remains optional/off by default

## Mobile contractor shell

**Industry pattern:** Field reps need instant lead response and deep portal handoff without duplicating every web slice natively.

**FCA mapping (implemented Cycle 9):**
- Native tabs: Command Center, Leads, Jobs, Training, Account
- `BuildPortalHandoffUrl` for immersive, punch, job-cost, pipeline surfaces on `futurecontractorsofamerica.com`
- Central-backed mutations: intake POST, qualify PATCH, session Bearer auth

## Future extensions (research-backed)

| Extension | Status | Target slice |
|---|---|---|
| Go/No-Go weighted scoring | `product-complete` (Cycle 10) | 01 Lead |
| Stage stagnation automations | `product-complete` (Cycle 10) | 01, 03 |
| Cross-doc conflict matrix | `product-complete` (Cycle 10) | 08 Briefing |
| Agentic submittal routing | planned | 07 Documents |
| SMS nurture on intake | planned | 01, Comms |
| Warranty SLA + closeout continuity | `product-complete` (Cycle 12) | 12 Warranty |
