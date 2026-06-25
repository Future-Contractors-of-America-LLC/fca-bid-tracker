# Static Web App Route Audit

_Last updated: 2026-06-06_

## Purpose

This audit converts the route continuity checklist into an explicit route-status board.
It is intentionally conservative: a route is only marked as fully verified when continuity, CTA clarity, and shell cohesion are evidenced from repository state or a dedicated verification pass.

## Status Key

- **Verified baseline** â€” repo state confirms the route exists in the intended shell narrative and no immediate contradiction is known
- **Needs continuity verification** â€” route is expected or referenced in the shell, but continuity still needs explicit pass/fail review
- **Transitional / compatibility review** â€” route may remain for compatibility but should be reviewed for shell consistency
- **Blocked externally** â€” route behavior depends on infrastructure or configuration outside repository control

## Audit Board

| Route / Surface | Current Status | Why | Class | Next Action |
|---|---|---|---|---|
| `/` | Verified baseline | Root shell exists and branded entrypoint is confirmed in `index.html` | repo-verifiable | keep in continuity pass |
| `/platform` | Needs continuity verification | identified as core public shell route in recovery lane, but route-level pass/fail not yet recorded | repo-fixable pending review | verify entry clarity, CTA, and navigation continuity |
| `/auricrux` | Needs continuity verification | identified as core public shell route and embedded operating-layer surface, but route-level review not yet recorded | repo-fixable pending review | verify shell framing and next-action continuity |
| `/pricing` | Needs continuity verification | identified as conversion route, but continuity findings not yet recorded | repo-fixable pending review | verify conversion CTA alignment |
| `/contact` | Needs continuity verification | identified as contact continuity route, but route-level findings not yet recorded | repo-fixable pending review | verify contact path clarity and non-dead-end behavior |
| `/login` | Needs continuity verification | explicitly part of usable-product continuity, but route-level findings not yet recorded | repo-fixable pending review | verify movement into portal/workspace continuity |
| `/portal` | Needs continuity verification | expected customer continuity surface, but explicit audit findings not yet recorded | repo-fixable pending review | verify customer-state and next-step continuity |
| Academy continuity surface(s) | Needs continuity verification | academy continuity is part of shell strategy, but specific route audit not yet recorded | repo-fixable pending review | identify exact route(s) and verify CTA continuity |
| Support/help continuity surface(s) | Needs continuity verification | support continuity is required, but explicit route inventory and audit are not yet recorded | repo-fixable pending review | identify exact route(s) and verify support path clarity |
| `/bid-entry/` | Needs continuity verification | bid workflow continuity route is part of the recovery checklist, but explicit findings not yet recorded | repo-fixable pending review | verify workspace entry clarity and progression |
| `/bid-status/` | Needs continuity verification | bid status continuity route is part of the recovery checklist, but explicit findings not yet recorded | repo-fixable pending review | verify customer-status clarity and next action |
| `/tyler-entry/` | Transitional / compatibility review | legacy continuity route may still exist for compatibility or transition | repo-fixable pending review | confirm whether to preserve, redirect, or normalize |
| `/tyler-status/` | Transitional / compatibility review | legacy continuity route may still exist for compatibility or transition | repo-fixable pending review | confirm whether to preserve, redirect, or normalize |

## Current Read of the Audit

### Verified now from repo truth
- The branded root shell exists.
- The SPA fallback posture exists.
- The route continuity checklist now exists as the governing verification standard.

### Not yet verified at route-local level
- CTA quality per route
- shell-to-shell progression quality
- route-local narrative continuity
- whether any route currently behaves as an isolated page rather than part of one FCA operating shell

## Failure Classification Rule

Use **repo-fixable** if the gap can be resolved in repository code, content, route linking, shell framing, or navigation.

Use **blocked externally** only if the route depends on:
- Azure deployment configuration outside repo scope
- DNS/custom-domain behavior outside repo scope
- secrets or environment config outside repo scope
- account-level permissions

## Founder Action Required

**No** â€” not for this audit baseline.

## Next Concrete Action

Advance from this baseline to a route-by-route implementation pass in issue `#20`:

1. inspect actual route files and navigation surfaces
2. mark each route as pass/fail/needs fix
3. identify repo-fixable continuity defects
4. reserve escalation only for true external blockers

## Operating Rule

Until route-local review is complete, deployment-readiness language must stay conservative.
Do not treat expected routes as verified customer continuity just because they are named in the shell strategy.