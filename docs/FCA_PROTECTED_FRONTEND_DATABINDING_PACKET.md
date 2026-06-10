# FCA Protected Frontend Data-Binding Packet

## Issue
The repo now has token-backed auth and starter server-side entitlement enforcement, but the visible frontend product surfaces were still reading mostly shell/local state.

That left a product-truth gap:
- backend can enforce auth and entitlements,
- but platform, academy, and Auricrux pages still looked mostly like frontend continuity shells.

## Decision
Bind the three flagship protected surfaces to entitlement-checked backend APIs while preserving bounded fallback behavior when true auth is unavailable.

## Delivered in this packet
1. `src/hooks/useProtectedProductData.js`
   - shared token-backed protected fetch hook
   - bounded handling for seeded/no-token mode
   - explicit source/truth status reporting
2. `src/components/ProtectedProductDataPanel.jsx`
   - reusable UI panel for protected backend truth, auth state, entitlement state, and fallback condition visibility
3. `src/pages/portal/PlatformDashboard.jsx`
   - now binds to `/api/customer-workspace-summary`
4. `src/pages/academy/AcademyHome.jsx`
   - now binds to `/api/customer-academy-overview`
5. `src/pages/portal/PortalAuricrux.jsx`
   - now binds to `/api/customer-auricrux-guidance`

## Resulting behavior
- token-backed authenticated sessions can now read protected backend summary data for SaaS, LMS, and Auricrux surfaces
- seeded fallback sessions remain usable, but the UI now says that the surface is running in continuity mode rather than pretending backend-protected product data is live
- unauthenticated or unauthorized states now surface as explicit product-truth conditions instead of silent shell-only behavior

## Truth boundary
This packet materially improves visible product truth, but it still does **not** mean the full product is complete.

Still missing:
- deeper backend persistence for workspace objects
- backend-driven project, learner, enrollment, and bid mutation flows across all pages
- universal replacement of local shell state with protected API data
- full SaaS/LMS object lifecycle enforcement

## Next build step
Highest-value next packet after this one:
- protected workflow mutation packet for real backend-backed bid/project/academy actions rather than summary-only protected reads.
