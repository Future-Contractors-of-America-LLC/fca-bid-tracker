# Contractor Command Auth/Tenant Hardening Checklist

## Classification
Validation artifact

## Scope
This checklist applies to PR #55 auth and tenant-context hardening work on `auricrux/cc-execution-baseline`.

## Expected Rule
- Read routes may use seeded fallback only where explicitly allowed.
- Protected mutation routes must require authenticated tenant session context.
- Hardened routes must surface `authContext` in responses.

## Hardened Mutation Routes
- `api/projects.js`
- `api/opportunity-convert.js`
- `api/files.js`
- `api/leads.js`
- `api/lead-qualify.js`
- `api/lead-detail.js`
- `api/bids.js`
- `api/estimates.js`
- `api/proposals.js`
- `api/academy-lms.js`

## Normalized Read / Summary Routes
- `api/workflow-audit.js`
- `api/projects-workspace.js`
- `api/opportunities-workspace.js`
- `api/files-summary.js`
- `api/audit-events-summary.js`

## Validation Steps
1. Call each hardened GET route without authenticated session.
   - Confirm route still responds where fallback is intentionally allowed.
   - Confirm `authContext.usedFallback` truthfully reflects fallback use.
2. Call each hardened mutation route without authenticated session.
   - Confirm `401` response.
   - Confirm mutation is not silently accepted under `TEN-FCA-001` fallback.
3. Call each hardened mutation route with authenticated session cookie.
   - Confirm successful mutation response.
   - Confirm `authContext.authenticated === true`.
4. Confirm no response claims production auth completion.
5. Confirm PR #55 remains draft until runtime validation is performed.

## Truth Boundary
This checklist validates repo behavior changes only.
It does not prove:
- live deployment status
- end-to-end production auth
- durable persistence verification
- full tenant isolation proof

## Recommended Next Runtime Check
Run targeted API verification against the deployed function surfaces after merge/deploy, beginning with:
- `projects`
- `opportunity-convert`
- `files`
- `lead-qualify`
