# FCA_PACKET_056C_GITHUB_ACTIONS_RESULT_CAPTURE_RUNBOOK

Status: Active
Classification: GitHub Actions result capture runbook
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `056C`
Next Packet: `056D`
Target Packet: `060A`

---

## Purpose
This runbook defines the exact fields that must be captured from the first visible execution result for the runtime-smoke harness.

## Required workflow identity
- Workflow file: `.github/workflows/runtime-smoke-validation.yml`
- Trigger commit: `3a82b978f5a1be6ad66209ac365415ad469674b2`
- Target branch: `main`

## Minimum capture fields
The first visible execution result must capture:

- workflow name
- run status
- conclusion
- branch
- triggering commit SHA
- execution timestamp
- evidence that `capture:build-evidence` ran
- evidence that `validate:runtime-smoke` ran
- artifact names produced

## Acceptance rule
Packet advancement beyond this runbook requires at least one explicit execution result whose triggering SHA matches `3a82b978f5a1be6ad66209ac365415ad469674b2` or a later superseding proof commit in the same continuity family.

## Rejection rule
Any execution result without a matching SHA or without proof of both harness steps is insufficient.

## Progress Lock
- Current packet: `056C`
- Next packet: `056D`
- Target packet: `060A`
