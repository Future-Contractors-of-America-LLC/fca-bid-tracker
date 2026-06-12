# Implementation Packet 047C — Unified Single-Release Validation + Award Handoff

## Issue
Packet 047A and 047B established more of the shared spine, but the single coordinated release is still blocked by two missing truths:
1. proposal / award / handoff continuity is not yet fully unified under one governed release path
2. there is not yet one executable walkthrough validator for the combined SaaS + LMS release gate

## Risk
Without Packet 047C:
- proposal and award can remain partially narrative rather than release-grade product truth
- SaaS and LMS can still appear integrated without a single enforced release walkthrough
- deployment truth can drift from repo truth again
- release claims can get ahead of what a real customer can actually do

## Fix
Packet 047C should complete the release-facing layer in two parts.

### Part A — award / handoff continuity
Unify these states across the canonical spine:
- proposal-ready
- awarded
- converted to project
- project setup active
- academy readiness linked to project mobilization

### Part B — single-release walkthrough validation
Create one validation sequence that proves a real customer can:
1. authenticate
2. enter workspace
3. reach governed project truth
4. reach file / evidence truth
5. reach Academy under the same customer context
6. receive project-linked readiness truth
7. see Auricrux next action across both surfaces

## Required repo artifacts

### 1. Unified walkthrough validation script
Suggested file:
- `scripts/validate-unified-single-release.mjs`

Must verify at minimum:
- required routes exist
- required API endpoints exist
- project workspace route and academy assignment route are both referenced by validation
- unified release gate artifact exists

### 2. Award / handoff contract artifact
Suggested file:
- `docs/fca-contractor-command-award-handoff-contract.md`

Must define:
- proposal → award → project setup object transitions
- required audit events
- required downstream project and Academy readiness effects

### 3. Release signoff checklist
Suggested file:
- `docs/FCA_UNIFIED_RELEASE_SIGNOFF_CHECKLIST.md`

Must contain:
- auth gate
- flagship continuity gate
- file/evidence gate
- academy gate
- auricrux gate
- deployment gate

## Code-facing next changes

### Validation layer
Patch:
- `package.json`
- build validation workflow(s)
- validator inventory if present

### Product truth layer
Patch:
- proposal and project continuity surfaces to expose award/handoff status
- Academy and project workspace to reflect handoff state where relevant

## Completion rule
Packet 047C is complete only when the repo can produce one bounded answer to this question:

**Can one authenticated customer move through the expanded FCA flagship product as one system, from commercial state into project state into Academy readiness, with Auricrux visible across all of it?**

If the answer is not provably yes, the release remains blocked.
