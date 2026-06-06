# Function App Target Execution Contract

_Last updated: 2026-06-06_

## Purpose

This contract defines the minimum backend behavior the FCA shell should be able to rely on before the Function App lane can be treated as execution-ready.

It follows the verified baseline in `docs/function-app-minimum-execution-spine-baseline.md` and turns the current minimal API presence into a concrete normalization target.

## Current Verified Backend Surfaces

### Present today
- `GET /api/auricrux`
- `POST /api/auricrux`
- `GET /api/bids`
- `POST /api/bids`

### Current observed behavior
- `/api/auricrux` returns a simple online confirmation payload
- `/api/bids` returns `[]` for `GET`
- `/api/bids` returns `{ success: true }` for `POST`

## Minimum Execution Target

### 1. Health / online route
#### Route
- `GET /api/auricrux`

#### Minimum contract
Must return a stable JSON payload containing at least:
- `ok`
- `service`
- `route`
- `timestamp`
- `mode`

#### Purpose
This becomes the canonical backend-online signal for the FCA shell and future diagnostics.

### 2. Bid list route
#### Route
- `GET /api/bids`

#### Minimum contract
Must return JSON with at least:
- `ok`
- `items`
- `count`

Where:
- `items` is an array
- `count` is the number of returned items

#### Purpose
This gives the shell a stable read contract instead of a raw array-only placeholder.

### 3. Bid submission route
#### Route
- `POST /api/bids`

#### Minimum contract
Must return JSON with at least:
- `ok`
- `accepted`
- `id` or `submissionId`
- `message`

#### Purpose
This gives the shell a stable write/acknowledgment contract instead of a generic success boolean only.

## Architecture Constraint

### Verified current risk
The API surface currently mixes:
- Azure Functions v4 code-first style in `api/auricrux.js`
- older folder/function.json style in `api/bids/`

### Target rule
Normalize the minimum execution spine onto **one Azure Functions model** before calling the Function App deploy-hardened.

## Preferred Normalization Direction

### Preferred target
Move the backend to a single consistent v4-style `@azure/functions` code-first pattern if it is compatible with the intended deployment/runtime target.

### Why
- consistent route declaration style
- lower cognitive overhead
- simpler verification posture
- reduced runtime ambiguity

## Success Conditions

The Function App minimum execution spine is considered ready only when all of the following are true:

1. `/api/auricrux` returns the stable health contract
2. `/api/bids` `GET` returns the stable list contract
3. `/api/bids` `POST` returns the stable submission contract
4. both surfaces are implemented under one coherent Azure Functions model
5. runtime verification confirms the API can actually start or deploy in a real execution environment

## Repo-Fixable Work Remaining

- define and normalize the response contracts
- choose and apply one Azure Functions model
- reduce placeholder thinness in the current responses
- align backend shape with shell expectations

## Not Yet Verifiable From Repo Inspection Alone

- local Azure Functions startup success
- hosted deployment success
- missing environment variables or app settings
- platform compatibility of the current mixed-model state

## Founder Action Required

**No** — not at this checkpoint.

Founder action is only required later if runtime execution reveals external Azure permissions, secrets, billing, or environment limitations.

## Next Concrete Action

1. choose normalization direction for the API model
2. upgrade `/api/auricrux` to the target health contract
3. upgrade `/api/bids` GET/POST to the target read/write contracts
4. then run runtime verification in a command-capable environment

## Operating Rule

Do not describe the Function App as deployment-ready until both are true:

- the response contracts are normalized
- the mixed-model runtime risk is resolved or explicitly proven safe in execution
