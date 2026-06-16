# FCA Packet 062C — Public Package Route Validation

## Issue
062B correctly stated that the next move was to wire public package claims to exact route groups and validate that public pricing, Academy tracks, and command-center tools point to real reachable repo slices.

## Risk
If pricing and rollout packaging stay descriptive-only, FCA can drift into overclaiming product depth even when the repo already contains real routes. That creates customer-trust risk and founder re-explanation risk.

## Fix
062C introduces one route-truth source and uses it in both product UI and validation surfaces:

1. `src/publicPackageRouteGroups.js` becomes the single route-group truth source for public package claims.
2. `src/pages/website/Pricing.jsx` now renders exact linked route groups under each package instead of generic package-only copy.
3. `scripts/validate-public-package-route-groups.mjs` verifies that each declared package route is real in `src/routes.js`, that all five required Academy tracks exist, and that the two 062B command tools are still exported.
4. `scripts/generate-public-package-route-groups-report.mjs` creates a report surface for package-to-route mapping.
5. `scripts/generate-academy-catalog-report.mjs` is corrected to current repo truth so it no longer assumes missing `credentials`, `classrooms`, or `stack` structures.
6. `package.json` exposes the new validation and report scripts.

## Enforced truth
Public package claims must resolve to exact reachable route groups in repo truth.

## Validation target
- SaaS package claims map to real portal execution routes.
- Customer portal claims map to real customer-facing portal routes.
- Academy claims map to real Academy and portal-academy routes.
- Auricrux/comms claims map to real Auricrux, messages, support, and admin routes.
- Revenue continuity claims map to real billing, warranty, referral, and support routes.
- The five required Academy course tracks remain present.
- `stageMobilizationInvoiceTool` and `createPermitEscalationTool` remain exported.

## Next build step
062D should extend this same truth-source pattern into home, login, and contact surfaces so route-group claims stay synchronized across every public entry surface, not just pricing.
