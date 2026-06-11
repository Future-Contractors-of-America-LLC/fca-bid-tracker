# Implementation Packet 034 — File Persistence Authority Alignment

## Purpose
Contain file-spine persistence drift between customer-facing file continuity surfaces in `fca-bid-tracker` and the new bounded `/api/files` persistence lane in `auricrux-bid-api-node`.

## Repo Truth
Current `fca-bid-tracker` already has:
- project-linked file workflow surfaces
- file filtering by project/category/status
- file continuity cues and Auricrux briefing entry points
- workflow-store-backed file state for shell continuity

Current system risk:
- file continuity can drift if shell workflow state is treated as canonical persisted file state without an explicit authority rule

## Authority Rule
Until a full adapter is implemented, file state has two layers:

1. **Shell continuity layer**
   - owned by `fca-bid-tracker`
   - keeps file screens responsive and customer-facing
   - supports workflow continuity and fallback behavior

2. **Bounded persistence layer**
   - owned by `auricrux-bid-api-node`
   - stores governed file metadata records
   - becomes the canonical persisted Phase 2B file/evidence spine surface

The shell must not imply that workflow-store-only file records are authoritative persisted file records.

## Immediate UI / Repo Implications
- preserve current project-linked file route behavior
- add explicit migration path for file adapterization instead of silent replacement
- disclose backing source truth where possible
- keep briefing, evidence, and audit cues attached to the same active project root
- prefer additive migration over breaking rebinding

## Required Follow-on Build Steps
1. add a file persistence adapter in `fca-bid-tracker`
2. distinguish `workflow-store` vs `bounded-api` backing source in file surfaces
3. route project-linked file registration toward bounded persistence when available
4. preserve evidence-target linkage and briefing posture fields in shell models
5. add validation artifacts proving which file persistence mode is active

## Non-Claim Boundary
This packet does not claim that `fca-bid-tracker` is already using the new bounded file API for all file state.
It locks the truth boundary so the shell can migrate without false file-persistence claims.
