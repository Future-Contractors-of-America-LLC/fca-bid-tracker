# FCA_PACKET_061H_BUILD_PROOF_DIRECTORY_FIRST_FAILURE_RULE

Status: Active
Classification: Build-proof directory first-failure rule
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `061H`
Next Packet: `061I`
Target Packet: `061Z`

---

## Rule
If `docs/runtime-proof/build-validation/` does not exist on `main`, the directory itself is the first missing artifact.

## Reason
This prevents wasting cycles debating downstream files before the parent proof surface even exists in repo truth.
