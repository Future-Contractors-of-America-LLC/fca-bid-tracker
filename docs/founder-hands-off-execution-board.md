# Founder Hands-Off Execution Board

_Last updated: 2026-06-06_

## Purpose

This board is the single compact operating surface for the current recovery sequence.
It exists to reduce founder re-briefing, keep execution centered on the real product lane, and restrict founder involvement to true external dependency boundaries.

## Current Recovery Priority Order

1. Founder hands-off
2. Static Web App deployments
3. Function App deployments
4. Communications minimum viable loop

## Current Blocker

**Primary blocker:** execution energy has been over-allocated to control-plane/meta work instead of product shipping and deployment verification.

**Operational effect:** customer-facing progress appears slower than repo activity because too much work has landed in governance and packet surfaces rather than in deployable product improvements.

## Current Executing Repo

`Future-Contractors-of-America-LLC/fca-bid-tracker`

This repository is the primary customer-facing shell and the primary recovery execution lane.

## Current Deploy Target

**Static Web App target:** FCA public shell / customer-facing shell in `fca-bid-tracker`

**Current verified posture:**
- `index.html` is branded to `Future Contractors of America | FCA Operating System`
- `staticwebapp.config.json` has SPA fallback to `/index.html`
- `/api/*` and asset paths are excluded from fallback rewriting

## Last Validated Result

The recovery sequence is now concretely established in GitHub issue tracking:

- Parent execution issue: `#18`
- Founder hands-off issue: `#19`
- Static Web App issue: `#20`
- Function App issue: `#21`
- Communications issue: `#22`

This means the work is now anchored in the product repository instead of remaining only in the control plane.

## Next Concrete Action

Create and maintain this board as the canonical founder-facing status surface, then move directly into Static Web App execution under issue `#20`.

Immediate follow-up under this board:
- keep founder escalation exception-only
- keep product execution centered in `fca-bid-tracker`
- treat Static Web App build and deployment verification as the first product-delivery lane after this board exists

## Founder Action Required

**No** — not at this step.

Founder action is only required if one of the following becomes true:
- missing credential or secret
- account-level GitHub/Azure permission required
- domain/DNS ownership action required
- billing/subscription approval required
- legal/ownership decision required

## Exception-Only Escalation Rule

Do **not** escalate to the founder for routine product work, repo cleanup, route coherence, build validation, documentation updates, or internal execution sequencing.

Escalate only for:
- credentials not present in repository/runtime scope
- platform permissions outside repo control
- domain/DNS or tenant ownership actions
- payment, billing, or subscription decisions
- legal or ownership-bound approvals

## Operating Rule

No meta-only advancement counts as progress unless it does one of the following:
- removes a live blocker
- verifies a deployment path
- ships customer-visible product capability
- reduces founder coordination load with a real operating artifact
