# FCA Packet 062D â€” Cross-Surface Package Alignment

## Issue
062C grounded public package claims in exact route groups, but only the pricing surface consumed that truth source. Home, login, and contact still risked drifting into route-agnostic product language.

## Risk
- public entry surfaces could diverge from pricing truth
- login could undersignal what authenticated access actually opens
- contact could sell a walkthrough path without exposing the exact route groups behind the conversation
- founder re-explanation burden could increase if every entry surface tells a slightly different product story

## Fix
062D extends the exact same route-group truth source into the three remaining highest-leverage public entry surfaces:

1. adds `src/components/PublicPackageRouteGroupsPanel.jsx`
2. wires route-group truth into `src/pages/website/Home.jsx`
3. wires route-group truth into `src/pages/website/Login.jsx`
4. wires route-group truth into `src/pages/website/Contact.jsx`
5. locks 062D in the continuity ledger with explicit preservation of the unresolved 061Z deployment boundary

## Enforced truth
Home, login, contact, and pricing must all use the same package-to-route truth source when describing FCA product depth.

## Result
- home now shows exact route groups behind the FCA offer
- login now shows exact route groups behind authenticated access
- contact now shows exact route groups behind the walkthrough path
- pricing continues using the same route-group truth source from 062C

## Next build step
062E should push the same truth-source discipline into any remaining public conversion surfaces that still describe product packaging without exact route-group backing, then add a cross-surface validator if needed.
