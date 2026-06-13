# Implementation Packet 048U Frontend — Replace Remaining Local Academy Transcript/Cohort/Credential Surfaces

## Classification
Repo-ready frontend convergence packet.

## Issue
Even after tenant identity wiring, the transcript panel, cohort panel, and admin credential ledger were still reading or mutating browser-local Academy record state instead of the Academy API-backed LMS spine.

## Risk
That left a split-brain Academy truth model in the repo: some surfaces were API-backed while transcript, cohort, and credential views could still drift locally. That is incompatible with the one coordinated release gate.

## Fix
This packet replaces the remaining local-only transcript/cohort/credential read/mutate surfaces with API-backed state and view-model helpers.

## Files
- `src/academyApiViewModels.js`
- `src/hooks/useAcademyLms.js`
- `src/components/AcademyTranscriptPanel.jsx`
- `src/components/AcademyCohortPanel.jsx`
- `src/components/CredentialIssuanceLedger.jsx`
- `src/pages/academy/AcademyTranscript.jsx`
- `scripts/verify-real-lms-depth.mjs`

## Product effect
Academy transcript, cohort, and credential issuance surfaces now converge on one API-backed LMS state path instead of relying on browser-local records.

## Truth boundary
This is frontend repo truth only. Live end-to-end behavior still depends on the backend Academy LMS packet being merged and deployed. Browser-local Academy progress artifacts still exist in repo history, but these surfaced views now converge on the API path.

## Next recommended packet
Packet 048V — retire or quarantine superseded local Academy record helpers and replace local lesson-progress truth with shared API-backed progression objects where appropriate.
