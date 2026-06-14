# FCA Phase A Route Apply Packet

Status: Active
Date: 2026-06-14
Repo: `fca-bid-tracker`

## Issue
Portal project and file routes were still primarily driven by shell/fallback continuity layers even after canonical Phase A backend surfaces were introduced.

## Real route-facing fixes applied
1. `useProjectWorkspace` now attempts canonical Phase A project hydration first.
2. `useProjectWorkspace` now attempts canonical project upserts for stage movement and permit-blocker clearing.
3. `useWorkflowEvidence` now attempts canonical file hydration first.
4. `useWorkflowEvidence` now attempts canonical briefing hydration first.
5. `useWorkflowEvidence` now routes file record creation and briefing creation into canonical Phase A endpoints before falling back.

## Result
The portal shell has moved one layer closer to real project/file/briefing state instead of relying only on seeded continuity structures.

## Remaining gap
The route components still describe shell/fallback truth in places because live deployment and runtime verification have not yet been confirmed in-session.

## Next exact packet
`FCA_PHASE_A_RUNTIME_VALIDATION_PACKET.md`

## Validation requirement
The next packet must inspect PR state, repo diff, and then verify whether additional route text needs tightening to match the new canonical-first behavior.
