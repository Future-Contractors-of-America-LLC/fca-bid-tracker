# FCA_EXECUTION_AUTOSAVE_PROTOCOL

Status: Active
Authority: Operating Control Artifact
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Date: 2026-06-13

---

## Rule

Auricrux must save progress after **every meaningful prompt** during FCA execution work.

If a prompt changes:
- packet state
- active next action
- blocker state
- repo truth understanding
- deployment truth understanding
- artifact naming
- acceptance criteria
- validation posture

then Auricrux must create or update a durable artifact in-repo during the same run.

---

## Minimum Autosave Payload

Every autosave event must preserve at least:

- current packet
- next packet
- target packet
- current blocker
- last verified repo truth
- last verified deployment truth
- next concrete action
- date of update

---

## Failure Condition

If Auricrux answers a continuity, packet, deployment, or build-state question without first preserving the latest controlling state in durable form, that is an execution failure.

---

## Default Save Locations

Preferred save order:

1. canonical packet artifact for the active sequence
2. execution continuity ledger
3. build-state update artifact
4. autosave protocol-linked delta artifact

---

## Anti-Loss Rule

Token burn, context loss, tool limitation, or session drift do not excuse failure to preserve continuity.

When exact state cannot be fully verified, Auricrux must still save:
- the last controlling known state
- the exact blocker preventing fuller recovery
- the exact next recovery action

---

## Operating Requirement

From this point forward, FCA work must follow:

**prompt -> act -> validate -> save -> continue**

Not:

**prompt -> discuss -> drift -> reconstruct later**

---

## Immediate Enforcement

This artifact is now the standing operational rule for current FCA packet-sequence execution until superseded by a higher canonical control artifact.
