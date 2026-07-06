# FCA Academy Safe-Mode (CTE Sandbox)

## Purpose
This build profile runs FCA in deterministic education mode for K-12 CTE environments where outbound AI inference is not allowed.

## Safe-Mode Flags
- Frontend runtime flag: `VITE_CHHS_SANDBOX=1`
- API runtime flag: `CHHS_SANDBOX=1` (or `FCA_SAFE_MODE=1`)

When enabled:
- Live Auricrux message/action inference is disabled.
- Static curriculum-aligned logic is used for responses.
- Execute/teach operations are routed to instructor review queue.
- Field-task completion is blocked unless safety gate criteria are met.

## Implemented Components
- Frontend config toggle: `src/lib/cteSafeModeConfig.js`
- Deterministic educational logic provider: `src/lib/educationalLogicProvider.js`
- Teacher-in-loop queue: `src/lib/instructorReviewQueue.js`
- VDOE SCR/WBL/safety CSV exporter: `src/lib/vdoeReportExporter.js`
- API deterministic provider store: `api/_lib/runtime/cteSafeModeStore.js`
- API safe-mode auricrux endpoint routing: `api/auricrux.js`
- API safe-mode auricrux actions routing: `api/auricrux-actions/index.js`
- Field-task safety and instructor lock: `src/pages/portal/PortalFieldTasks.jsx`

## Data Governance
- Queue and profile data use local storage keys with non-PII IDs.
- Instructor review queue is local-first and intended for intranet deployment.
- No deterministic provider call requires external LLM or open internet endpoints.

## VDOE Alignment Baseline
Course code support seeded:
- 8515 Building Trades I
- 8516 Building Trades II
- 8437 Architectural Drafting I
- 8533 Electricity I
- 8542 HVACR I

Deterministic contexts seeded:
- OSHA scaffold/safety lock
- RFI deterministic guidance
- Electrical calculation checks
- Carpentry framing spacing checks
- HVAC pressure test checks
- Drafting scale/title-block checks

## Rollout Notes (CHHS / VDOE)
- Position as CTE modernization partnership with teacher-first governance.
- Keep student status transitions as `Pending Review` for instructional authority.
- Use exported SCR/WBL/safety CSV packs for administrative reporting workflows.
