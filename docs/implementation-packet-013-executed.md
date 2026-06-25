# Implementation Packet 013 â€” Executed

## Delivered

This pass centralized remaining route-local CTA behavior inside the shared portal shell support layer so reusable portal header, signal, and banner actions now resolve through shared website-shell exports instead of living directly inside `PortalShell.jsx`.

### Changes shipped

1. Added `portalShellCtas` to `src/websiteShell.js` for:
   - shared portal-header secondary CTA,
   - shared portal executive-signal CTA,
   - shared unified-customer-journey banner CTA.
2. Updated `src/components/PortalShell.jsx` to consume `portalShellCtas` instead of local inline href/label definitions.
3. Extended `scripts/validate-critical-routes.mjs` to include `portalShellCtas` in shared route smoke validation.

## Why this matters

This removes another reusable CTA island from the component layer and keeps more of the shell's route-jump behavior governed from one centralized configuration surface. It improves consistency, lowers drift risk, and makes future shell-wide CTA updates faster and safer.

## Next recommended packet

Normalize any remaining route-local CTA behavior in portal home or dashboard journey lists, or begin consolidating repeated ShellHeader CTA patterns across public, portal, and academy surfaces.
