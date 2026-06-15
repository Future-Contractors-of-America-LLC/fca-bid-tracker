# FCA_PACKET_061Z_WORKFLOW_PERSISTENCE_SCOPE

Status: Active
Classification: 061Z workflow persistence scope
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `061Z`
Target Packet: `061Z`

---

## Required persistence surfaces
The following proof classes must now persist through CI on `main`:

- live deployment current-head verifier validation/report
- live deployment metadata transition validation/report
- live deployment proof bundle readiness validation/report
- build-validation live-proof coverage validation/report
- live-proof stamp coverage validation/report
- build-validation live-proof persistence-wiring validation/report
- live-proof stamp persistence-wiring validation/report
- live-proof persisted-artifact-surface validation/report
- live-proof persisted-control-bundle validation/report
- first-persisted-control-run-gate validation/report
- managed-auth-commercial-runtime report
- Academy catalog report

## Reason
Without repo-visible persisted outputs for these proof classes, `061Z` cannot close truthfully.
