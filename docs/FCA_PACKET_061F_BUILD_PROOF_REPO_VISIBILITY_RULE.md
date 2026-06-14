# FCA_PACKET_061F_BUILD_PROOF_REPO_VISIBILITY_RULE

Status: Active
Classification: Build proof repo visibility rule
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `061F`
Next Packet: `061G`
Target Packet: `061Z`

---

## Rule
Build-validation proof is only considered repo-visible when both are true:

1. `docs/runtime-proof/build-validation/` exists on `main`
2. required proof files inside that directory are present

## Required files
- `build-evidence-report.json`
- `build-proof-lane-validation.json`
- `build-proof-lane-report.json`
- `packet-letter-lock-validation.json`
- `packet-letter-lock-report.json`

## Anti-drift clause
Workflow wiring alone is insufficient.
Path existence alone is insufficient.
Required file presence is mandatory.
