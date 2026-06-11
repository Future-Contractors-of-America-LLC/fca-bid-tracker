# Implementation Packet 035 — Audit Persistence Authority Alignment

## Purpose
Contain audit-spine persistence drift between customer-facing audit continuity surfaces in `fca-bid-tracker` and the new bounded `/api/audit-events` persistence lane in `auricrux-bid-api-node`.

## Repo Truth
Current `fca-bid-tracker` already has:
- project-linked audit timeline surfaces
- filtered workflow audit views
- continuity posture cues derived from recent activity
- workflow-store-backed audit history for shell continuity

Current system risk:
- audit continuity can drift if shell workflow history is treated as canonical persisted audit state without an explicit authority rule

## Authority Rule
Until a full adapter is implemented, audit state has two layers:

1. **Shell continuity layer**
   - owned by `fca-bid-tracker`
   - keeps audit screens responsive and customer-facing
   - supports workflow continuity and fallback behavior

2. **Bounded persistence layer**
   - owned by `auricrux-bid-api-node`
   - stores governed audit/event records
   - becomes the canonical persisted Phase 2C audit/event spine surface

The shell must not imply that workflow-store-only audit history is authoritative persisted audit history.

## Immediate UI / Repo Implications
- preserve current project-linked audit route behavior
- add explicit migration path for audit adapterization instead of silent replacement
- disclose backing source truth where possible
- keep audit surfaces attached to the same active project root as project and file surfaces
- prefer additive migration over breaking rebinding

## Required Follow-on Build Steps
1. add an audit persistence adapter in `fca-bid-tracker`
2. distinguish `workflow-store` vs `bounded-api` backing source in audit surfaces
3. route governed project/file mutations toward bounded audit persistence when available
4. preserve actor/action/reason visibility in shell models
5. add validation artifacts proving which audit persistence mode is active

## Non-Claim Boundary
This packet does not claim that `fca-bid-tracker` is already using the new bounded audit API for all audit state.
It locks the truth boundary so the shell can migrate without false audit-persistence claims.
