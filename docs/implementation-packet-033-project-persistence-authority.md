# Implementation Packet 033 — Project Persistence Authority Alignment

## Purpose
Contain project persistence drift between the customer-facing shell and the bounded API lane now that a dedicated `/api/projects` endpoint exists in `auricrux-bid-api-node`.

## Repo Truth
Current `fca-bid-tracker` already has:
- customer-facing project workspace routes
- workflow-store-backed `/api/projects` support for local continuity behavior
- hooks and API clients that already expect `/api/projects`

Current system risk:
- project continuity can drift if the shell treats local workflow state and bounded persisted project state as interchangeable without an explicit authority rule

## Authority Rule
Until a full adapter is implemented, treat project state as having two layers:

1. **Shell continuity layer**
   - owned by `fca-bid-tracker`
   - keeps portal routes responsive
   - supports local workflow continuity and demo-safe fallback behavior

2. **Bounded persistence layer**
   - owned by `auricrux-bid-api-node`
   - stores governed project/job root records
   - becomes the canonical persisted Phase 2 project spine surface

The shell must not claim that workflow-store-only project state is authoritative persisted state.

## Immediate UI/Repo Implications
- Preserve existing customer-facing project route behavior
- Add explicit implementation path for adapterization rather than silent replacement
- Prefer additive migration steps over breaking rebinding
- Keep project/file/audit continuity visible even when persistence mode is mixed

## Required Follow-on Build Steps
1. Add a project persistence adapter in `fca-bid-tracker`
2. Distinguish `workflow-store` vs `bounded-api` backing source in project surfaces
3. Route project creation-from-award toward the bounded API when available
4. Keep file and audit surfaces bound to the same active project identity
5. Add validation artifacts proving which persistence mode is active

## Non-Claim Boundary
This packet does not claim that `fca-bid-tracker` is already using the new bounded project API for all project state.
It locks the migration rule so the shell can evolve without making false persistence claims.
