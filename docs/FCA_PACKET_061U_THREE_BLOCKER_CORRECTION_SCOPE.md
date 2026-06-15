# FCA_PACKET_061U_THREE_BLOCKER_CORRECTION_SCOPE

Status: Active
Classification: Three blocker correction scope
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `061U`
Next Packet: `061V`
Target Packet: `061Z`

---

## Blockers corrected at the current layer
1. stale live-proof workflow validation logic expected npm-wrapper calls even though the workflow already runs direct node scripts
2. stale live-proof commit-signal validation depended on an old packet document instead of actual repo-visible git history
3. missing repo-visible observation suite for witness-commit, CI-proof-commit, and aggregate live-proof-state inspection

## Correction rule
`061U` does not claim the commits already landed.

`061U` claims only that the observation, validation, and persistence surfaces now exist in repo truth so the next CI-backed run can produce honest repo-visible evidence.
