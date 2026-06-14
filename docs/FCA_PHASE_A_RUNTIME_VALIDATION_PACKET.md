# FCA Phase A Runtime Validation Packet

Status: Ready for execution
Date: 2026-06-14
Repo: `fca-bid-tracker`

## Validation targets
1. Canonical project hydration attempts before workflow fallback.
2. Canonical file hydration attempts before workflow fallback.
3. Canonical document briefing hydration attempts before fallback.
4. Canonical file create and briefing create mutations are wired in hooks.
5. Existing workflow-backed fallback remains preserved if canonical endpoints are unavailable.

## Truth boundary
This packet validates repo truth and route/hook alignment truth.
It does **not** claim verified live deployment truth yet.

## Repo proof points
- `src/api/workflowClient.js`
- `src/hooks/useProjectWorkspace.js`
- `src/hooks/useWorkflowEvidence.js`
- `docs/FCA_PHASE_A_BACKEND_ALIGNMENT_PACKET.md`
- `docs/FCA_PHASE_A_ROUTE_APPLY_PACKET.md`

## Next exact action
Open the companion PR in `fca-bid-tracker`, request review, and then perform PR-state inspection and deployment-readiness classification.
