# FCA_PACKET_061K_BUILD_VALIDATION_DOUBLE_ABSENCE_LOCK

Status: Active
Classification: Build-validation double absence lock
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `061K`
Next Packet: `061L`
Target Packet: `061Z`

---

## Lock
The build-validation lane remains locked in double-absence status until either:
- the directory is directly observed, or
- the persistence commit is directly observed

## Anti-drift
Do not downgrade this lock based on workflow wiring alone.
