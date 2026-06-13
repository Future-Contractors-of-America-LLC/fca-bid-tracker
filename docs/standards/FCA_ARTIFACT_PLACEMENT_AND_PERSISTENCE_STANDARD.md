# FCA_ARTIFACT_PLACEMENT_AND_PERSISTENCE_STANDARD

Status: Active  
Classification: Repo Standard  
Applies To: All future FCA and Auricrux repo-native artifacts created during execution runs in this repository

---

## Standard

Every meaningful artifact produced during a run must be:

1. logically placed in its canonical folder
2. persistently saved in-repo when repository tools are available
3. canonically named
4. referenced by exact repo path in the execution response

---

## Canonical folders

- Sequenced packets: `docs/packets/`
- Cross-cutting standards: `docs/standards/`
- Contracts: `docs/contracts/`
- Schemas: `docs/schemas/`
- Maps: `docs/maps/`

---

## Execution rule

If repository access exists, artifact placement is part of completion and not an optional cleanup step.

If repository access does not exist, the artifact must still be delivered inline as repo-ready content and explicitly marked as not yet persisted.

---

## Anti-drift check before ending a run

- Was the artifact saved?
- Was it saved in the right folder?
- Is the filename canonical?
- Was the exact repo path reported?

If any answer is no, the run is incomplete unless externally blocked.
