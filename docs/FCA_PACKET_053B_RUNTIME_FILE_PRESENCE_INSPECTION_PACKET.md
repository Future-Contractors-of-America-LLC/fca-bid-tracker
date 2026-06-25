# FCA_PACKET_053B_RUNTIME_FILE_PRESENCE_INSPECTION_PACKET

Status: Active
Classification: Binding runtime file presence inspection packet
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `053B`
Next Packet: `053C`
Target Packet: `060A`

---

## Issue

`053A` classified the current runtime blocker as a repo-truth gap.
`053B` now formalizes the exact inspection surface required to convert that blocker from generic uncertainty into per-file present / absent / collision truth.

---

## Repo-Proven Docs State

The following are repo-proven in current repository history:
- `docs/FCA_PACKET_053A_RUNTIME_HARD_BLOCKER_CLASSIFICATION.md`
- `docs/FCA_PACKET_053B_RUNTIME_FILE_PRESENCE_INSPECTION_PACKET.md`
- `docs/FCA_EXECUTION_CONTINUITY_LEDGER.md`

Therefore the **docs chain is repo-proven through `053B`**.

---

## Inspection Objective

Determine exact repo truth for the first-wave runtime targets:
- present
- absent
- path collision / incompatible existing content

This packet does **not** claim the inspection has already been performed on every target path.
It defines the exact inspection matrix required for the next narrowing step.

---

## Inspection Matrix

### Group A â€” Shared contract layer
| Path | Required inspection state |
|---|---|
| `src/lib/contracts/fcaEnums.ts` | present / absent / collision |
| `src/types/fca-contracts.ts` | present / absent / collision |
| `src/lib/api/fcaApiTypes.ts` | present / absent / collision |
| `api/_lib/contracts/fcaEnums.js` | present / absent / collision |
| `api/_lib/contracts/fcaContracts.js` | present / absent / collision |

### Group B â€” Validation layer
| Path | Required inspection state |
|---|---|
| `src/lib/contracts/fcaSchemas.ts` | present / absent / collision |
| `api/_lib/validation/fcaSchemas.js` | present / absent / collision |
| `api/_lib/validation/assertValid.js` | present / absent / collision |

### Group C â€” First route layer
| Path | Required inspection state |
|---|---|
| `api/projects/index.js` | present / absent / collision |
| `api/projects/[projectId].js` | present / absent / collision |
| `api/projects/[projectId]/takeoffs/index.js` | present / absent / collision |
| `api/projects/[projectId]/rfis/index.js` | present / absent / collision |
| `api/auricrux/actions/index.js` | present / absent / collision |

---

## Inspection Rules

### Present
A file counts as `present` only if:
- the path exists in repo
- the file is materially aligned with the approved first-wave target purpose
- it is not a placeholder unrelated to the packeted contract

### Absent
A file counts as `absent` if:
- the path does not exist in repo at all

### Collision
A file counts as `collision` if:
- the path exists but content is materially different from first-wave target intent
- blind overwrite could break repo standards, module format, or existing behavior
- merge analysis is required before safe application

---

## Why This Packet Matters

Without exact path-level inspection, the blocker remains too broad.
With exact inspection, the next packet can lawfully do one of:
- create absent files directly
- preserve present files
- remediate collision files separately

That is the shortest truthful path to runtime repo proof.

---

## Current Truth Boundary

### Repo-proven
- docs continuity through `053B`
- blocked runtime target set
- blocker classification
- inspection matrix

### Not yet repo-proven
- actual present / absent / collision result for each runtime target path
- runtime first-wave file creation
- build/lint results for first-wave runtime insertion

---

## Required Next Move

The next packet must record the actual inspection result for each file in the matrix.
No generalized blocker language is sufficient after this packet.

---

## 053B Success Definition

`053B` is successful if:
- the docs chain remains repo-proven
- the exact inspection matrix is fixed
- present / absent / collision rules are fixed
- the next packet is forced to report file-by-file inspection truth

---

## Next Packet

`053C = Runtime File Presence Inspection Result Packet`

Must deliver:
- exact result for each file in the inspection matrix
- grouped counts of present / absent / collision
- creation recommendation for absent files
- remediation recommendation for collision files

---

## Progress Lock

- Current packet: `053B`
- Next packet: `053C`
- Target packet: `060A`
- Docs chain: **repo-proven**
- Runtime file chain: **not yet repo-proven**
- Save-after-every-prompt rule remains active
