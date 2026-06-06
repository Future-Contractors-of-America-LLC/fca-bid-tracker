# Function App Minimum Execution Spine Baseline

_Last updated: 2026-06-06_

## Purpose

This artifact starts the Function App lane by documenting what is actually present in the repository today and separating minimum runtime truth from assumptions.

It follows the completion of the active Static Web App route-validation work and becomes the starting point for issue `#21`.

## Priority Context

Recovery order remains:

1. Founder hands-off
2. Static Web App deployments
3. Function App deployments
4. Communications minimum viable loop

This document begins priority `#3`.

## Files Inspected

- `api/auricrux.js`
- `api/bids/index.js`
- `api/bids/function.json`
- `api/package.json`
- `api/host.json`

## Verified Current State

### 1. There is a real API surface in the repository
The repository includes an `api/` directory with at least two visible HTTP surfaces:

- `auricrux`
- `bids`

### 2. `auricrux` route exists as a minimal health-style endpoint
`api/auricrux.js` defines an Azure Functions v4-style HTTP handler using `@azure/functions`.

Verified characteristics:
- methods: `GET`, `POST`
- auth level: `anonymous`
- route: `auricrux`
- current response body returns a simple online confirmation payload

### 3. `bids` route exists as a minimal bid endpoint
`api/bids/index.js` defines a function that:
- returns `[]` for `GET`
- returns `{ success: true }` for `POST`
- returns `405` for unsupported methods

`api/bids/function.json` exists, which indicates this endpoint uses the older Azure Functions folder-based model.

### 4. The API layer currently mixes two Azure Function programming models
The repository currently contains both:

- **v4 code-first model** in `api/auricrux.js`
- **older folder/function.json model** in `api/bids/`

This is the most important currently verified backend architecture fact.

### 5. Minimal dependency declaration exists
`api/package.json` currently declares:
- `@azure/functions`

### 6. Minimal host file exists
`api/host.json` currently contains only:
- `version: 2.0`

## Corrected Status Read

### What is real now
- The repo does contain a real backend surface.
- There is already a minimum health-style route.
- There is already a minimum bid endpoint.
- The backend is not absent.

### What is not yet proven
- local or hosted execution success
- deployment compatibility of the mixed programming models
- whether the current API surface cleanly supports the active shell
- whether additional app settings, function configuration, or host/runtime assumptions are missing

## Highest-Priority Verified Backend Defect

**The current Function App surface mixes two Azure Function models inside the same API tree.**

That may or may not run cleanly depending on the exact deployment/runtime setup, but it is the clearest currently verified repo-scoped risk.

## Minimum Execution Spine Present Today

The currently verified minimum execution spine is:

### Health / online signal
- `GET /api/auricrux`
- expected purpose: confirm backend online availability

### Minimal bid surface
- `GET /api/bids`
- expected purpose: return bid list placeholder

- `POST /api/bids`
- expected purpose: accept minimal bid submission placeholder

## Blocker Classification

### Repo-fixable risks already visible
- mixed Azure Function programming models in one API surface
- minimal host configuration only
- placeholder backend responses that may be too thin for real product continuity

### Not yet verifiable from repo inspection alone
- whether deployment environment accepts this mixed model
- whether local Azure Functions build/start passes
- whether additional runtime config or settings are required

## Founder Action Required

**No** — not at this checkpoint.

Founder action is only required later if runtime verification shows:
- missing Azure credentials
- missing Function App deployment permissions
- missing application settings or secrets outside repository control
- environment or billing limitations

## Next Concrete Action

Function App lane should now proceed in this order:

1. document the mixed-model risk explicitly in issue `#21`
2. define a target minimum execution contract for:
   - health
   - bids list
   - bid submission
3. determine whether to normalize onto one Azure Functions model
4. then run command-level/runtime verification in an execution-capable environment

## Operating Rule

Do not describe the Function App as deploy-ready yet.
The honest current state is:

- **minimum backend spine exists**
- **mixed-model runtime risk exists**
- **runtime truth still requires execution verification**
