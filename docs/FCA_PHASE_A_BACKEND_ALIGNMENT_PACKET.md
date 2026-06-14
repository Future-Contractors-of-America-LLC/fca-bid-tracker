# FCA Phase A Backend Alignment Packet

Status: Active execution artifact
Date: 2026-06-14
Repo: `fca-bid-tracker`
Related API PR: `Future-Contractors-of-America-LLC/auricrux-bid-api-node#9`

## Purpose
This packet aligns the frontend/workflow shell with the new canonical Phase A backend surfaces:

- `/api/projects`
- `/api/files`
- `/api/document-briefings`
- `projectId` on bid records

## What was added in this repo
1. `src/api/phaseAClient.js`
2. canonical helper extensions inside `src/api/workflowClient.js`

## Immediate execution value
- frontend now has explicit client helpers for canonical project spine reads/writes
- frontend now has explicit client helpers for canonical file spine reads/writes
- frontend now has explicit client helpers for canonical document briefing reads/writes
- companion packet exists so repo truth stays aligned to the API repo truth

## Current truth
This repo still contains shell/fallback continuity behavior on portal routes.
That is acceptable for this packet because the bounded objective here is client-surface alignment, not a false claim of fully live canonical route usage.

## Next required step
Apply the canonical client helpers into the actual portal hooks and routes in this order:

1. `useProjectWorkspace`
2. `useWorkflowEvidence`
3. `PortalProjects`
4. `PortalFiles`
5. project detail and file briefing surfaces

## Acceptance gate
This packet is complete when:
- canonical client helpers exist in repo
- API repo has matching backend PR
- frontend repo has companion PR
- next route-apply packet is ready
