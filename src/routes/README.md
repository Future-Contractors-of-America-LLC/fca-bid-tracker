# `src/routes` status

This directory is **not the currently verified primary runtime route system** for the FCA customer-facing shell.

## Verified active runtime path

The active browser runtime is currently driven by:

- `src/main.jsx`
- `src/router.jsx`
- `src/routes.js`
- `src/pages/**`

## Why this note exists

The repository contains two route architectures:

1. `src/routes/**` (legacy/alternate/incomplete route tree)
2. `src/routes.js` + `src/pages/**` (verified active runtime shell)

Recent Static Web App continuity inspection confirmed that customer-facing remediation must target the active runtime shell under `src/pages/**` unless the runtime wiring is intentionally changed.

## Operating rule

Do **not** treat files under `src/routes/**` as proof of active customer-facing route quality without first confirming that runtime has been repointed to this tree.

## Recommended handling

- Use `src/pages/**` for active shell remediation.
- Treat `src/routes/**` as a duplicate route surface pending later classification.
- Future cleanup should decide whether this tree is:
  - removable
  - deprecable but retained temporarily
  - or intentionally preserved for an alternate runtime path
