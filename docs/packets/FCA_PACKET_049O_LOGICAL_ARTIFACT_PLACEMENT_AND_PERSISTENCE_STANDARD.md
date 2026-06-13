# FCA_PACKET_049O_LOGICAL_ARTIFACT_PLACEMENT_AND_PERSISTENCE_STANDARD

Status: Active Draft for repo placement  
Classification: Artifact Placement and Persistence Standard  
Priority: Critical  
Sequence: 049O  
Applies To: All future FCA and Auricrux repo-native artifacts created during execution runs in this repository

---

## 1. Issue

Artifacts have been generated in-sequence, but if they are not logically placed and persistently saved in canonical repo paths, continuity breaks, retrieval degrades, drift increases, and execution history becomes harder to trust.

---

## 2. Decision

From this run forward, every meaningful artifact must be:

1. logically placed
2. persistently saved in-repo when repo access exists
3. named canonically
4. written into the correct class folder
5. referenced by its exact path in the execution report

This is now the default standard on every run.

---

## 3. Canonical Folder Rules

### 3.1 Sequenced packets
All sequenced implementation / validation / remediation / governance packets must live in:

```text
docs/packets/
```

### 3.2 Standards
Cross-cutting durable standards must live in:

```text
docs/standards/
```

### 3.3 Contracts / schemas / maps
Contracts, schemas, storage maps, and route maps should live in:

```text
docs/contracts/
docs/schemas/
docs/maps/
```

if and when those folders are introduced.

### 3.4 Legacy docs root
`docs/` root may contain legacy artifacts, but new sequenced packets should not be dropped there by default if a more specific canonical folder exists.

---

## 4. Naming Rules

### 4.1 Packet naming
Use:

```text
FCA_PACKET_<sequence>_<UPPER_SNAKE_OR_TITLE_STYLE>.md
```

Example:

```text
FCA_PACKET_049N_SAAS_LMS_DURABLE_TARGET_01_APPLY_PACKET.md
```

### 4.2 Standards naming
Use:

```text
FCA_<TOPIC>_STANDARD.md
```

or

```text
FCA_<TOPIC>_POLICY.md
```

### 4.3 No vague names
Do not save new artifacts as:
- `notes.md`
- `newfile.md`
- `draft.md`
- `temp.md`

---

## 5. Persistence-Save Requirement on Every Run

If repository tools are available and the artifact is meaningful, the artifact must be:

- created or updated in the repository
- placed in its canonical folder
- referenced by exact path in the response

If repository tools are not available, the artifact must still be delivered inline as repo-ready content and marked as **not yet persisted**.

No future run should silently leave meaningful new packet artifacts unplaced when placement is possible.

---

## 6. Update vs Supersede Rules

### 6.1 Update existing file when:
- the artifact is the same canonical artifact
- the path and title remain the same
- the newer content replaces or corrects the prior content

### 6.2 Supersede with new file when:
- the artifact is a new packet in sequence
- the artifact changes class (packet vs standard vs contract)
- changing the old file would destroy historical continuity

### 6.3 Do not duplicate semantically identical artifacts under new filenames unless a supersession reason exists.

---

## 7. Repo Artifact Index Expectation

At minimum, the execution response must state:

- artifact filename
- canonical repo path
- whether it was persisted this run
- next artifact if sequence continues

Recommended future enhancement:
- a packet index file under `docs/packets/README.md`

---

## 8. Anti-Drift Enforcement

Before ending a run that produced a meaningful artifact, check:

- Was it saved?
- Was it saved in the right folder?
- Is the filename canonical?
- Does it duplicate an existing artifact needlessly?
- Is the exact repo path stated in the report?

If any answer is no, the run is incomplete unless externally blocked.

---

## 9. Standard Operating Rule

From this run forward, **logical placement and persistent save are standard execution requirements on every run** whenever tools permit.

---

## 10. Recommended Companion Files

Create and maintain:

```text
docs/packets/README.md
docs/standards/README.md
```

to explain folder purpose and packet conventions.

---

## 11. Executive Summary

This standard makes artifact placement part of completion, not an optional cleanup step. Future packets, standards, and implementation artifacts must be logically placed, persistently saved, canonically named, and explicitly referenced in the response whenever repository access is available.

---

## 12. Next Action

Apply this standard immediately to all subsequent artifact runs in this repository.
