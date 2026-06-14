# FCA_PACKET_061N_PROVENANCE_TRANSITION_RULE

Status: Active
Classification: Provenance transition rule
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `061N`
Next Packet: `061O`
Target Packet: `061Z`

---

## Rule
The build-validation lane transitions from unconfirmed to CI-confirmed only when the repo-visible artifacts switch from:
- `provenance: manual_repo_backfill`
- `ciPersisted: false`

to:
- `provenance: github_actions_ci`
- `ciPersisted: true`

across the required proof artifact set.
