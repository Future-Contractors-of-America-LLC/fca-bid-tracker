# FCA_PACKET_059R_WORKFLOW_STORE_PROJECT_SPINE_EXPANSION

Status: Active
Classification: Workflow-store project spine expansion
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `059R`
Next Packet: `059S`
Target Packet: `060A`

---

## Issue
The canonical routes could not become real without backing workflow-store support for project retrieval, creation, takeoff persistence, and RFI persistence.

## Fix executed
Expanded `api/workflow-store.js` with:

- `getProjectById`
- `createProject`
- `listTakeoffs`
- `createTakeoff`
- `updateTakeoff`
- `listRfis`
- `createRfi`
- `updateRfi`
- seeded takeoff/RFI state in tenant workflow
- summary count expansion for takeoffs and RFIs

## Result
The Contractor Command project spine is stronger and no longer depends on canonical route stubs for these lanes.

## Progress Lock
- Current packet: `059R`
- Next packet: `059S`
- Target packet: `060A`
