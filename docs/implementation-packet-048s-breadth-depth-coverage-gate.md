# Implementation Packet 048S — Breadth/Depth Offering Matrix and Single-Release Deployment Gate

## Classification
Repo-ready implementation packet.

## Issue
Academy was becoming deeper, but the repo still lacked an explicit product artifact proving that offerings are being developed for both **breadth** and **depth** before the one coordinated SaaS + LMS deployment. Without that artifact, breadth can drift into shallow catalog inflation, or depth can remain too narrow to support the user's stated all-inclusive contractor scope.

## Risk
If breadth and depth are not both made explicit inside repo truth, the product can falsely appear richer than it is. That creates release drift, weakens trust, and increases the chance of deploying a visually expanded but commercially incomplete Academy/SaaS surface.

## Fix
This packet adds a governed coverage artifact and visible product surface for the rule:

- offerings must be both broad and deep
- Academy breadth must map to real operating surfaces
- deployment remains intentionally deferred until SaaS and LMS are jointly solid, rich, and complete

## Files
- `src/academyCoverageMatrix.js`
- `src/components/AcademyCoverageMatrixPanel.jsx`
- `src/pages/academy/AcademyHome.jsx`
- `scripts/verify-real-lms-depth.mjs`

## Product meaning
This packet does **not** deploy anything. It strengthens repo truth by making the following visible and enforceable:

- learning levels from foundation to credentialed depth
- domain breadth across tradecraft, preconstruction, project controls, management/finance, design/compliance, and FCA platform mastery
- credential families spanning apprenticeship, licensure, professional certifications, and degree-aligned pathways
- explicit single-release hold language so deployment is gated by product completeness rather than impatience

## Truth boundary
This packet upgrades repo truth only. It does **not** claim the platform is already broad/deep enough to release, and it does **not** claim a live deployment. It formalizes the deployment hold condition inside product-facing repo artifacts.

## Validation target
- Academy home visibly communicates breadth/depth governance.
- Validator checks confirm the coverage matrix artifact exists.
- Single-release hold language is present in repo truth.

## Decision
Continue building breadth and depth on the shared SaaS + LMS spine. Do **not** execute final deployment until the shared product is credibly complete.

## Next recommended packet
Packet 048T — tenant-backed shared Academy state transition so transcript, cohort, credential, and coverage readiness move from browser-local state toward durable, tenant-grade product truth.
