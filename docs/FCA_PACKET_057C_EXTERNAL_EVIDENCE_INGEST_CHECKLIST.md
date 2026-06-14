# FCA_PACKET_057C_EXTERNAL_EVIDENCE_INGEST_CHECKLIST

Status: Active
Classification: External evidence ingest checklist
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `057C`
Next Packet: `057D`
Target Packet: `060A`

---

## Required evidence fields
The first accepted external verification return must include all of the following:

- workflow name: `FCA Runtime Smoke Validation`
- branch: `main`
- triggering commit SHA: `3a82b978f5a1be6ad66209ac365415ad469674b2`
- run status
- conclusion
- execution timestamp
- artifact list
- proof that `Capture build evidence` ran
- proof that `Execute bounded runtime smoke checks` ran

## Artifact evidence requirements
Accepted artifact list must include:

- `runtime-smoke-check-report.json`
- `runtime-smoke-check-report.md`
- `build-evidence-report.json`
- `build-evidence-report.md`

## Result classes
- **pass**: all fields present, matching SHA, success conclusion, all artifacts present
- **fail**: matching SHA present but run failed or required artifacts missing
- **insufficient**: SHA missing, workflow mismatch, or incomplete capture

## Ingest rule
No execution result may advance the packet chain unless it is normalized through the ingest template defined in `056D` and checked against this checklist.

## Progress Lock
- Current packet: `057C`
- Next packet: `057D`
- Target packet: `060A`
