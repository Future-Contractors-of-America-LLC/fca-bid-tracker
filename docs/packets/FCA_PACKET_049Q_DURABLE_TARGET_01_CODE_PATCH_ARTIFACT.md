# FCA_PACKET_049Q_DURABLE_TARGET_01_CODE_PATCH_ARTIFACT

Status: Active Draft for repo placement  
Classification: Code Patch Artifact  
Priority: Critical  
Sequence: 049Q  
Depends On:
- FCA_PACKET_049N_SAAS_LMS_DURABLE_TARGET_01_APPLY_PACKET.md
- FCA_PACKET_049O_LOGICAL_ARTIFACT_PLACEMENT_AND_PERSISTENCE_STANDARD.md
- FCA_PACKET_049P_DURABLE_TARGET_01_EXECUTION_CHECKLIST.md

Scope: First code-facing persistence patch plan for Durable Target 01 covering Projects, Files, AuditEvents, and AuricruxActionRecords

---

## 1. Issue

Durable Target 01 is defined and checklist-bound, but the repo still needs a code-facing patch artifact that tells the implementer exactly what code families must change first, in what order, and with what non-regression boundary.

---

## 2. Decision

Apply Durable Target 01 as a bounded patch stack in this order:

1. repository interfaces
2. memory adapters
3. repository factory
4. service rewiring
5. route verification
6. validation pass

Do not broaden into Academy persistence, feature-gate persistence, or remediation persistence in this patch.

---

## 3. Patch Scope

### In scope
- `src/repositories/projectRepository.ts`
- `src/repositories/fileRepository.ts`
- `src/repositories/auditRepository.ts`
- `src/repositories/auricruxActionRepository.ts`
- `src/persistence/adapters/memory/*` for those four families
- `src/persistence/factories/repositoryFactory.ts`
- `src/services/projectService.ts`
- `src/services/fileService.ts`
- `src/services/auditService.ts`
- `src/services/auricruxService.ts`

### Out of scope
- Academy durable persistence
- readiness durable persistence
- cross-link durable persistence
- feature-gate durable persistence
- remediation durable persistence
- frontend changes

---

## 4. Required Patch Behavior

### 4.1 Project persistence
Projects must stop being route-local or service-hardcoded demo objects and instead persist through `ProjectRepository`.

### 4.2 File metadata persistence
File metadata must persist through `FileRepository` even if binary storage remains handled elsewhere.

### 4.3 Audit persistence
Audit events must be durably created through `AuditRepository` for execution-style routes in scope.

### 4.4 Auricrux action persistence
`/api/auricrux/execute` must durably create an Auricrux action record and corresponding audit event.

---

## 5. Non-Regression Boundary

The patch must not:
- change route names from Packet 049J
- introduce provider-specific types into routes
- move persistence into route files
- break auth/tenant middleware boundaries
- claim production durability beyond the memory-adapter phase

---

## 6. Exact Patch Order

### Patch A — repository contracts
Create repository interfaces first.

### Patch B — memory adapters
Create memory adapters that satisfy the interfaces.

### Patch C — repository factory
Add `PERSISTENCE_MODE` factory routing.

### Patch D — services
Rewire services to use factory-backed repositories.

### Patch E — route validation
Confirm target routes still return contract-valid JSON.

### Patch F — validation
Run lint, typecheck, build.

---

## 7. Target Route Set

The following route behaviors are the acceptance surface for this patch:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `GET /api/files/:fileId`
- `POST /api/auricrux/execute`
- `GET /api/audit/events`
- `GET /api/audit/events/:eventId`

---

## 8. Validation Output Requirement

A future execution applying this patch must report:
- files created or changed
- branch name
- commit hash
- validation result
- exact durable-target routes verified

No claim of completion without those outputs.

---

## 9. Canonical Path

This artifact is canonically stored at:

```text
docs/packets/FCA_PACKET_049Q_DURABLE_TARGET_01_CODE_PATCH_ARTIFACT.md
```

---

## 10. Next Action

Produce the next concrete artifact as:

**`FCA_PACKET_049R_DURABLE_TARGET_01_REPOSITORY_INTERFACE_FILES.md`**

That packet should provide the exact repo-ready code contents for the first repository interface files.