# Implementation Packet 041 Executed

## Packet
Create the first explicit governed backend-read alignment artifact for:
- opportunity detail
- project detail
- file summary
- audit summary

## Delivered
- added `docs/fca-contractor-command-backend-read-alignment-contract.md`

## What Changed
- defined canonical backend read targets for flagship detail surfaces
- defined minimum response shapes for opportunity workspace, project workspace, file summary, and audit summary
- defined which fields must not be faked route-locally
- defined fallback disclosure requirements when backend truth is unavailable
- defined the first code alignment targets for `src/api/workflowClient.js` and route-level consumers

## Truth Improvement
This packet reduces the next major source of drift after route restoration: detail routes existing in router truth but still depending primarily on shell-composed or fallback data instead of explicit governed read models.

## Remaining Gaps
- route pages still need code-level read alignment
- `src/api/workflowClient.js` does not yet expose the new canonical read adapters
- opportunity and project detail routes still depend partly on current shell stores

## Next Highest-Priority Build Step
Implement the first code alignment packet:
1. extend `src/api/workflowClient.js`
2. add canonical read adapters/hooks
3. patch opportunity detail route
4. patch project detail route
