# Live Surface Static Proof v2

## Issue
The prior live-surface change targeted source routes, but the actual deployed Static Web App build path is still heavily driven by `public/` artifacts and static output continuity.

## Fix
This packet adds direct static proof routes that should survive the current SWA deployment path:

- `public/portal/platform/index.html`
- `public/auricrux/live-proof/index.html`
- `public/deployment-status.json`
- `public/live-shell-verification.html`

## Validation target
After deployment, check:

- `/portal/platform/`
- `/auricrux/live-proof/`
- `/auricrux/run-digest/index.json`
- `/deployment-status.json`

## Boundary
This is a live-surface proof packet, not completion of the full project/file/audit product spine.
