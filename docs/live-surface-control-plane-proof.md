# Live Surface Control Plane Proof

## Issue
The control-plane baseline was merged, but the public/live product surface did not yet visibly prove that machine-native continuity had advanced.

## Fix
This packet adds explicit live-surface proof on:

- `src/pages/website/Home.jsx`
- `src/pages/portal/PlatformDashboard.jsx`

## Visible advancement
Users checking the live surface should now see:

1. a public home-page control-plane proof card
2. direct CTA links to `/auricrux/run-digest/index.json`
3. direct CTA links to `/deployment-status.json`
4. a platform dashboard control-loop proof card

## Outcome
The live surface now exposes machine-native continuity as an observable product surface rather than hidden repo-only state.
