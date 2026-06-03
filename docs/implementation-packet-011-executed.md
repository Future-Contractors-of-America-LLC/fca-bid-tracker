# Implementation Packet 011 — Executed

## Delivered

This pass centralized the remaining bid-product and legacy-compatibility CTA groups on the home route so the public entry surface now relies more fully on shared website-shell exports instead of route-local anchor clusters.

### Changes shipped

1. Added shared `legacyIntake` and `legacyStatus` action entries to `publicActionCatalog` in `src/websiteShell.js`.
2. Added `homeCtaSets` to `src/websiteShell.js` for the home route's bid-product and legacy-compatibility CTA groups.
3. Updated `src/pages/website/Home.jsx` to render those CTA groups with `PublicCtaRow`.
4. Preserved the existing home-route destinations and compatibility posture while reducing another route-local CTA island.

## Why this matters

This keeps the home route aligned with the same centralized CTA governance model used across other public, portal, and academy surfaces. It reduces drift risk and makes future CTA wording or destination changes easier to manage consistently from one place.

## Next recommended packet

Extend route validation to include `homeCtaSets`, then continue normalizing any remaining route-local CTA islands such as shared CTA behavior inside portal shell support elements.
