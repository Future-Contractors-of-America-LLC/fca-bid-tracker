# FCA Public Shell — Locked June 11 Recovery Checkpoint

_Last updated: 2026-06-11_

## Issue

The FCA public shell required a controlled recovery on June 11, 2026 because repository truth had moved ahead of likely live deployment truth.

The critical recovery sequence on `main` is:

1. `79ba76fac7b1eb251952dbeeefeef7b5e30f6af4` — `feat: tighten public marketing shell add brand marks and expand pricing and activation path`
2. `efeb0d8fcecebb69e82149da0f21aa97488185c8` — `fix: clean public shell copy restore branded nav and unify customer intake credentials flow`
3. `f493ab6039a4470802c5b591c62c998a6a4f7d40` — `fix: force swa redeploy to align live site with current public shell commits`

This sequence is the locked checkpoint for resuming public-shell work.

## Risk

If execution resumes from older planning notes instead of this checkpoint, FCA risks:

- repo truth / deployment truth drift
- reintroduction of broken or noisy public navigation
- loss of the marketing-only pre-login posture
- fragmentation away from the flagship FCA Contractor Command spine
- renewed founder routing burden

## Locked Acceptance Criteria

The June 11 public shell should be treated as correct only if all of the following are true:

- `Home` is visibly present in the public navigation
- public navigation is clean and branded
- pre-login routes stay marketing-first rather than internal or founder-facing
- FCA remains the primary public brand
- Auricrux surfaces retain gold-coded identity
- customer intake remains unified rather than split into separate founder-style flows
- pricing retains the low / mid / growth / enterprise spread
- public contact aliases remain limited to:
  - `sales@futurecontractorsofamerica.com`
  - `info@futurecontractorsofamerica.com`
  - `support@futurecontractorsofamerica.com`

## Verified Repository Truth

As of this checkpoint:

- `main` head is `f493ab6039a4470802c5b591c62c998a6a4f7d40`
- the repo contains the Azure Static Web Apps workflow file:
  - `.github/workflows/azure-static-web-apps-delightful-mushroom-0de67860f.yml`
- the repo still contains the forced redeploy artifact:
  - `force-rebuild.txt`
- the active shell route family is still centered in:
  - `src/pages/website/**`
  - `src/pages/portal/**`
  - `src/routes.js`

## Recovery Decision

When choosing between additional shell edits and deployment-truth recovery, the higher-percentage path to the desired state is:

**deployment truth first, new shell changes second**

That means:

1. hold this checkpoint as the public-shell lock
2. validate live deployment against this repo state before broadening work
3. only then continue into the next flagship packet

## Next Build Step

The next bounded product step after public-shell deployment validation is:

**FCA Contractor Command Vertical Slice 01**

Scope order:

1. Project / Job spine
2. File ingestion and versioning spine
3. Auricrux document briefing / parse layer
4. audit event continuity

No adjacent expansion lane should outrank that sequence unless deployment truth breaks again.

## Operator Rule

Do not treat public-shell recovery as a standalone marketing lane.
The shell exists to support the flagship FCA Contractor Command spine and customer conversion into the real product system.
