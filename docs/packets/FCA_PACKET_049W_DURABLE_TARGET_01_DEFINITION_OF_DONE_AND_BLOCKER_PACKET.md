# FCA_PACKET_049W_DURABLE_TARGET_01_DEFINITION_OF_DONE_AND_BLOCKER_PACKET

Status: Active Draft for repo placement  
Classification: Definition of Done / Blocker Packet  
Priority: Critical  
Sequence: 049W  
Depends On:
- FCA_PACKET_049N_SAAS_LMS_DURABLE_TARGET_01_APPLY_PACKET.md
- FCA_PACKET_049O_LOGICAL_ARTIFACT_PLACEMENT_AND_PERSISTENCE_STANDARD.md
- FCA_PACKET_049P_DURABLE_TARGET_01_EXECUTION_CHECKLIST.md
- FCA_PACKET_049Q_DURABLE_TARGET_01_CODE_PATCH_ARTIFACT.md
- FCA_PACKET_049R_DURABLE_TARGET_01_REPOSITORY_INTERFACE_FILES.md
- FCA_PACKET_049S_DURABLE_TARGET_01_MEMORY_ADAPTER_FILES.md
- FCA_PACKET_049T_DURABLE_TARGET_01_REPOSITORY_FACTORY_FILE.md
- FCA_PACKET_049U_DURABLE_TARGET_01_SERVICE_REWIRE_PACKET.md
- FCA_PACKET_049V_DURABLE_TARGET_01_ROUTE_VERIFICATION_PACKET.md

Scope: Exact blocker classes, release gate, closeout standard, and Definition of Done for Durable Target 01

---

## 1. Issue

Durable Target 01 now has packetized apply, checklist, repository, adapter, factory, service, and route-verification guidance, but completion still needs a hard closeout rule. Without an explicit Definition of Done and blocker model, partial persistence work can be mislabeled as finished.

---

## 2. Decision

Durable Target 01 closes only when repository-backed truth is established for the bounded first slice:

1. Project persistence
2. File metadata persistence
3. Audit event persistence
4. Auricrux action persistence

No broader SaaS + LMS persistence claims are allowed under this closeout packet.

---

## 3. Canonical Placement

This artifact is persistently saved at:

```text
docs/packets/FCA_PACKET_049W_DURABLE_TARGET_01_DEFINITION_OF_DONE_AND_BLOCKER_PACKET.md
```

---

## 4. Blocker Classes

### 4.1 Critical Blockers
Durable Target 01 cannot close if any critical blocker exists:
- repository interface files missing
- memory adapters missing
- repository factory missing
- service rewiring incomplete for in-scope families
- `/api/auricrux/execute` does not persist both action and audit
- target routes fail build/typecheck
- target routes remain route-local or hardcoded where repository-backed behavior is required

### 4.2 Major Blockers
Closeout should not be claimed while any major blocker exists:
- not-found behavior is undefined on repository-backed reads
- tenant-safe filtering is inconsistent
- route response shapes drift from contract
- validation commands not run
- exact changed files not reported

### 4.3 Moderate Blockers
May allow technical continuation, but not clean closeout:
- README packet index not updated
- packet/reporting paths omitted from execution summary
- manual route verification incomplete but structural validation passes

### 4.4 Low Blockers
Do not block closure alone, but should be queued:
- Dataverse adapter shell not yet started
- extended test coverage not yet added
- richer logging not yet added

---

## 5. Definition of Done

Durable Target 01 is done only when all are true:

- [ ] `src/repositories/projectRepository.ts` exists
- [ ] `src/repositories/fileRepository.ts` exists
- [ ] `src/repositories/auditRepository.ts` exists
- [ ] `src/repositories/auricruxActionRepository.ts` exists
- [ ] all four memory adapters exist under `src/persistence/adapters/memory/`
- [ ] `src/persistence/factories/repositoryFactory.ts` exists
- [ ] project service is repository-backed
- [ ] file service is repository-backed
- [ ] audit service is repository-backed
- [ ] Auricrux execute service writes both action and audit records through repositories
- [ ] in-scope routes compile and remain contract-aligned
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] exact changed files are reported
- [ ] exact validation status is reported
- [ ] exact remaining blockers, if any, are reported

---

## 6. Not Allowed to Claim

Until Durable Target 01 closes, do **not** claim:
- full SaaS persistence completion
- full LMS persistence completion
- production provider-backed durability
- Dataverse completion
- end-to-end durable customer workflow completion

This packet is strictly for bounded first-slice closure.

---

## 7. Release Gate

Durable Target 01 may be considered ready to merge or advance only when:
- no critical blockers remain
- no major blockers remain
- structural validation passes
- route surface behavior is repository-backed for the in-scope families
- placement/reporting standard has been followed

---

## 8. Closeout Reporting Standard

Any run claiming Durable Target 01 closeout must report:
- branch name
- PR number if created
- changed files
- validation commands and results
- exact routes verified
- blocker status by class
- whether the target is closed or still open

No vague completion statement is acceptable.

---

## 9. Anti-Fake-Completion Rule

Durable Target 01 remains **open** if any in-scope route still depends on hardcoded response objects instead of repository-backed services, even if packet artifacts are complete.

---

## 10. Next Action

Produce:

**`FCA_PACKET_049X_DURABLE_TARGET_01_EXECUTION_SUMMARY_TEMPLATE.md`**

That packet should define the exact summary template to use when Durable Target 01 code changes are actually applied and validated.