# FCA_PACKET_057B_RUNTIME_SMOKE_UI_VERIFICATION_CARD

Status: Active
Classification: Runtime smoke UI verification card
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `057B`
Next Packet: `057C`
Target Packet: `060A`

---

## Purpose
This card is the shortest acceptable human-visible verification path for the current blocker.

## Exact UI path
1. Open GitHub repository `Future-Contractors-of-America-LLC/fca-bid-tracker`
2. Open **Actions**
3. Open workflow **FCA Runtime Smoke Validation**
4. Find the run triggered from commit `3a82b978f5a1be6ad66209ac365415ad469674b2`
5. Record the following values exactly:
   - run status
   - conclusion
   - executed timestamp
   - artifact names
   - whether both steps ran:
     - `Capture build evidence`
     - `Execute bounded runtime smoke checks`

## Pass criteria
The workflow may be considered externally verified only if:

- run status is `completed`
- conclusion is `success`
- both required steps ran
- uploaded artifacts include:
  - `runtime-smoke-check-report.json`
  - `runtime-smoke-check-report.md`
  - `build-evidence-report.json`
  - `build-evidence-report.md`

## Fail criteria
Any missing step, mismatched commit SHA, failed conclusion, or missing artifact is a fail or insufficient result.

## Progress Lock
- Current packet: `057B`
- Next packet: `057C`
- Target packet: `060A`
