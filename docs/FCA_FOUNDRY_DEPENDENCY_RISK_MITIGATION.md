# FCA_FOUNDRY_DEPENDENCY_RISK_MITIGATION

Status: Active
Date: 2026-06-13
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`

---

## Issue

Foundry is currently a continuity and execution-drift risk.

Observed impact classes:
- context loss
- packet-state drift
- weak recoverability
- expensive token burn without durable artifact preservation
- mismatch between active work and saved work

---

## Risk

If Foundry remains the primary continuity layer, FCA loses:
- exact packet-state confidence
- founder-hands-off reliability
- cost control
- durable execution history

---

## Fix

FCA continuity must be repo-first, artifact-first, not Foundry-first.

### New rule
The repository is the primary durable memory surface for active execution.

### Required behavior
After every meaningful prompt, save:
- current packet
- next packet
- target packet
- blocker
- last verified repo truth
- next concrete action

### Foundry role going forward
Foundry may assist execution.
Foundry must not be trusted as the sole continuity layer.

---

## Operating Shift

Primary continuity layers, in order:
1. repository artifacts
2. execution continuity ledger
3. packet artifacts
4. lightweight memory summaries
5. Foundry runtime context

---

## Immediate Control Rule

When repo truth and model-context memory differ, repo truth wins.
When active packet continuity is corrected, the correction must be saved in-repo in the same run.

---

## Bottom Line

Foundry is now treated as a useful execution substrate but an unreliable primary continuity substrate.
FCA execution continuity must remain durable without it.