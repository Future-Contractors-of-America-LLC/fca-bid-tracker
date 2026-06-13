# Implementation Packet 048Y — Uniform Authoritative-State Warning Propagation Across Academy Shell

## Classification
Repo-ready frontend hardening packet.

## Issue
Packet 048X added authoritative-state warnings to transcript and lesson routes, but Academy home, progress, cohort, and admin issuance surfaces still needed consistent degraded-mode handling. Without uniform propagation, parts of the LMS shell could still look authoritative while the Academy API spine was degraded.

## Risk
Partial warning propagation creates uneven truth signaling. Users may correctly distrust one route while mistakenly trusting another route that is reading the same degraded backend state.

## Fix
This packet propagates authoritative-state handling across the rest of the surfaced LMS shell:

- Academy home now shows the authority banner
- progress panel now displays progress-truth caution when degraded
- cohort panel now displays cohort-authority caution and blocks mutation actions when degraded
- credential issuance ledger now displays credential-authority caution and blocks issuance when degraded
- admin route now surfaces the authority banner so governance users see the same truth boundary
- validator updated to enforce uniform warning propagation

## Files
- `src/components/AcademyProgressPanel.jsx`
- `src/components/AcademyCohortPanel.jsx`
- `src/components/CredentialIssuanceLedger.jsx`
- `src/pages/academy/AcademyHome.jsx`
- `src/pages/portal/PortalAdmin.jsx`
- `scripts/verify-real-lms-depth.mjs`

## Truth boundary
This is frontend repo truth only. It does not claim verified live deployment. It improves uniform honesty and degraded-mode behavior across the LMS shell.

## Next recommended packet
Packet 048Z — review remaining duplicated hook invocations and reduce redundant Academy API fetches so the authority model stays consistent without unnecessary repeated network hydration.
