# FCA_PACKET_059A_REMEDIATION_TARGETS

Status: Active
Classification: 059A remediation targets
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `059A`
Next Packet: `059B`
Target Packet: `060A`

---

## Minimum remediation targets before 060A can be reconsidered

1. replace seeded validation login with production-grade customer auth readiness
2. convert canonical `api/projects` packet routes from stub behavior to real project/job continuity behavior
3. convert canonical takeoff packet route from stub to real persistence-backed behavior
4. convert canonical RFI packet route from stub to real persistence-backed behavior
5. add repo-proven change-order continuity surface
6. add repo-proven billing / pay-app / job-cost continuity surface
7. capture passing build-validation and runtime-smoke execution proof on current head

## Priority rule
Remediation must follow the product spine, not cosmetic shell expansion:

- auth boundary
- project/job spine
- file/evidence linkage
- takeoff/RFI/change-order continuity
- finance continuity
- deployment proof capture

## Progress Lock
- Current packet: `059A`
- Next packet: `059B`
- Target packet: `060A`
