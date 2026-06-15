# FCA_PACKET_061Z_MANAGED_AUTH_PROOF_SCOPE

Status: Active
Classification: Managed auth proof scope for 061Z
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `061Z`
Target Packet: `061Z`

---

## In scope
- repo-visible auth boundary surface
- repo-visible customer auth state route
- repo-visible customer login route
- repo-visible customer session route
- repo-visible signed cookie session markers
- repo-visible managed-auth-commercial-runtime report persistence

## Not automatically proven
- real deployed managed auth runtime behavior in-session
- end-to-end login on the public deployment

## Rule
Until deployed behavior is directly observed, managed auth remains bounded as repo-proven but deployment-unproven.
