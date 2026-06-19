# Auricrux Communications & Media Roadmap

**Last updated:** 2026-06-19  
**Status:** Planning — implementation queued after UX/auth sprint

---

## Goals (founder requirements)

1. **Live capabilities:** audio, video, text, and email through Auricrux
2. **Lesson media:** prerecorded audio/video lectures for every lesson; demonstration and guidance videos for all lab and performance-evaluation lessons
3. **Go-to-market:** coordinated launch and sales/marketing campaign

---

## Phase 1 — Communications foundation (Week 1–2)

| Channel | Target integration | Notes |
|---------|-------------------|-------|
| Text / chat | Existing portal messages + Teams webhook | Extend `enabledComms.chat` |
| Email | Microsoft Graph / SendGrid | `enabledComms.email`; template library in central |
| Live audio/video | Azure Communication Services or Teams embed | `enabledComms.conference` |
| Auricrux UI | Window launcher (done) ? `/auricrux` panel | Replace browser-only stubs in legacy dock |

**Deliverables:**
- `api/auricrux-comms` route in auricrux-central
- Session-scoped comms token issuance
- Auricrux panel actions: "Start call", "Send email", "Open chat"

---

## Phase 2 — Academy lesson media (Week 2–4)

### Content schema (per lesson)

```json
{
  "lessonId": "elec-l1-safety-orientation",
  "lecture": { "videoUrl": "", "audioUrl": "", "durationSec": 0 },
  "labDemo": { "videoUrl": "", "captionsUrl": "" },
  "performanceEval": { "videoUrl": "", "rubricUrl": "" }
}
```

**Storage:** Azure Blob (`fcamedia` container) + CDN; URLs referenced from `academy-lms` API.

**Production pipeline:**
1. Script from `docs/revenue-sprint/FOUNDRY_CONTENT_PACK.md`
2. Record / generate via Foundry + human QC
3. Upload ? register in catalog
4. QC gate: every catalog lesson must have `lecture.videoUrl` before "published"

---

## Phase 3 — Sales & marketing launch (Week 1–3, parallel)

| Asset | Owner | Status |
|-------|-------|--------|
| Enterprise landing page | Web (in progress) | UX refresh deployed |
| Product catalog `/products` | Revenue sprint PR #139 | Open |
| Stripe Startup checkout | `npm run stripe:provision-startup` | Scripted |
| Foundry content pack | `docs/revenue-sprint/FOUNDRY_CONTENT_PACK.md` | Draft |
| Email nurture sequence | Marketing | Not started |
| LinkedIn / trade press | Marketing | Not started |
| Pilot offer ($2,500) | Live Stripe link | Configured |

**Campaign tagline (draft):** *One platform from first lead to field-ready crews.*

**CTA paths:** `/intake` · `/pricing` · `/login` (header Sign in)

---

## Dependencies

- Azure Communication Services resource (founder: create in portal or via azd)
- Blob storage + CDN for media
- Graph mail.send permission for transactional email
- Content production capacity (Foundry agents + founder QC)

---

## Next actions for agents

1. Scaffold `lessonMedia` field on academy catalog entries
2. Add Auricrux comms API stub in auricrux-central
3. Wire marketing automation trigger (`scripts/trigger-revenue-sprint-automation.cmd`)
4. Founder: approve media recording budget and ACS provisioning

See also: `docs/FOUNDER_ONLY_CHECKLIST.md`, `docs/revenue-sprint/FOUNDRY_CONTENT_PACK.md`
