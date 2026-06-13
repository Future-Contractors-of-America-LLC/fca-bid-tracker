# Implementation Packet 048Z — Academy LMS Provider Dedup and Shared Hydration Control

## Classification
Repo-ready frontend hardening and efficiency packet.

## Issue
Academy shell routes and panels were repeatedly invoking the Academy hook independently, creating duplicated hydrations and redundant Academy API fetches. That weakens authority consistency, increases UI jitter risk, and makes degraded-state behavior harder to reason about.

## Risk
If each major Academy surface hydrates independently, then:
- the same route can fetch Academy state multiple times
- mutation state and warning state can diverge visually across panels
- degraded/authoritative signaling can become inconsistent
- future deployment confidence is overstated

## Fix
This packet introduces a shared Academy provider/context model and routes major Academy surfaces through one shared LMS state instance per page.

## Files
- `src/context/AcademyLmsContext.jsx`
- `src/components/AcademyProgressPanel.jsx`
- `src/components/AcademyCohortPanel.jsx`
- `src/components/AcademyTranscriptPanel.jsx`
- `src/components/CredentialIssuanceLedger.jsx`
- `src/pages/academy/AcademyHome.jsx`
- `src/pages/academy/AcademyProgramDetail.jsx`
- `src/pages/academy/AcademyTranscript.jsx`
- `src/pages/academy/AcademyLessonView.jsx`
- `src/pages/portal/PortalAdmin.jsx`
- `scripts/verify-real-lms-depth.mjs`

## Product effect
Academy surfaces now have a cleaner per-route source of truth with reduced duplicate hydration and more consistent authority signaling.

## Truth boundary
This is frontend repo truth only. It does not claim verified live deployment or measured runtime performance improvement. It reduces architectural redundancy and improves truth consistency in repo design.

## Next recommended packet
Packet 049A — unify Academy LMS control panel under the shared provider and add lightweight fetch telemetry counters so redundant hydration reduction can be measured instead of only inferred.
