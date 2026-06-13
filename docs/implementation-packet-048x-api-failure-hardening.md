# Implementation Packet 048X — Academy API Failure Hardening and Authoritative-State Warnings

## Classification
Repo-ready frontend hardening packet.

## Issue
After Packet 048W, Academy surfaces were increasingly API-backed, but the frontend still needed explicit failure hardening and visible authority-state warnings so users would not mistake degraded API conditions for trustworthy LMS truth.

## Risk
If the Academy API fails silently, the product can appear operational while showing stale or partial state. That is unacceptable under the single coordinated deployment gate because it creates false completeness and weakens trust.

## Fix
This packet adds:

- authoritative-state and warning metadata in `useAcademyLms`
- mutation-state tracking for Academy actions
- visible state-authority banner for transcript and lesson surfaces
- action blocking during degraded or non-authoritative Academy API conditions
- explicit lesson mutation failure visibility

## Files
- `src/hooks/useAcademyLms.js`
- `src/components/AcademyStateAuthorityBanner.jsx`
- `src/pages/academy/AcademyTranscript.jsx`
- `src/pages/academy/AcademyLessonView.jsx`
- `scripts/verify-real-lms-depth.mjs`

## Truth boundary
This packet upgrades frontend repo truth only. It does not claim verified live deployment. It hardens the UI against overstating Academy authority when the backend path is unavailable or degraded.

## Next recommended packet
Packet 048Y — extend authoritative-state warnings and degraded-mode handling into Academy home, progress, cohort, and admin issuance surfaces so failure signaling is uniform across the entire LMS product shell.
