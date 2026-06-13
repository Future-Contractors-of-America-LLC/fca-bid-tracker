# FCA_PACKET_049U_DURABLE_TARGET_01_SERVICE_REWIRE_PACKET

Status: Active Draft for repo placement  
Classification: Service Rewire Packet  
Priority: Critical  
Sequence: 049U  
Depends On:
- FCA_PACKET_049N_SAAS_LMS_DURABLE_TARGET_01_APPLY_PACKET.md
- FCA_PACKET_049O_LOGICAL_ARTIFACT_PLACEMENT_AND_PERSISTENCE_STANDARD.md
- FCA_PACKET_049P_DURABLE_TARGET_01_EXECUTION_CHECKLIST.md
- FCA_PACKET_049Q_DURABLE_TARGET_01_CODE_PATCH_ARTIFACT.md
- FCA_PACKET_049R_DURABLE_TARGET_01_REPOSITORY_INTERFACE_FILES.md
- FCA_PACKET_049S_DURABLE_TARGET_01_MEMORY_ADAPTER_FILES.md
- FCA_PACKET_049T_DURABLE_TARGET_01_REPOSITORY_FACTORY_FILE.md

Scope: Exact service-level rewiring for Project, File, Audit, and Auricrux execution services so Durable Target 01 moves from scaffold-only behavior to repository-backed behavior

---

## 1. Issue

The first repository interfaces, memory adapters, and repository factory are now defined, but the service layer still represents the main drift boundary. If services keep returning hardcoded demo objects or direct local behavior, the system remains shell-level even though persistence infrastructure exists.

---

## 2. Decision

Rewire only these service families now:

1. `projectService.ts`
2. `fileService.ts`
3. `auditService.ts`
4. `auricruxService.ts`

Do not broaden this packet into Academy, readiness, cross-link, feature-gate, or remediation service rewiring.

---

## 3. Canonical Placement

This artifact is persistently saved at:

```text
docs/packets/FCA_PACKET_049U_DURABLE_TARGET_01_SERVICE_REWIRE_PACKET.md
```

Target code files should remain under canonical service paths:

```text
src/services/projectService.ts
src/services/fileService.ts
src/services/auditService.ts
src/services/auricruxService.ts
```

---

## 4. Rewire Rule

All four services must import repositories from:

```ts
src/persistence/factories/repositoryFactory.ts
```

Services must not:
- instantiate adapters directly
- import memory adapter classes directly
- return hardcoded demo records once repository-backed equivalents exist
- move persistence into route files

---

## 5. Project Service Rewire

### Required behavior
- `listProjects(tenantId)` must call `getProjectRepository().listByTenant(tenantId)`
- `getProject(tenantId, projectId)` must call `getProjectRepository().getById(...)`
- add `createProject(input)` calling repository create
- add `updateProject(input)` calling repository update

### Required fallback rule
If a project is not found, service must throw a typed not-found error rather than return a fake object.

---

## 6. File Service Rewire

### Required behavior
- `getFile(tenantId, fileId)` must call `getFileRepository().getById(...)`
- `listProjectFiles(tenantId, projectId)` must call `getFileRepository().listByProject(...)`
- `createFile(input)` must call `getFileRepository().create(...)`

### Scope note
This packet covers file metadata persistence only. Binary upload provider behavior remains out of scope.

---

## 7. Audit Service Rewire

### Required behavior
- `createAuditEvent(input)` must call `getAuditRepository().createEvent(...)`
- `listAuditEvents(tenantId)` must call `getAuditRepository().listEvents(...)`
- `getAuditEvent(tenantId, eventId)` must call `getAuditRepository().getEvent(...)`

### Required discipline
Audit service must remain append-oriented and must not mutate prior events.

---

## 8. Auricrux Service Rewire

### Required behavior
`execute` flow must:
1. create an Auricrux action through `getAuricruxActionRepository().create(...)`
2. create an audit event through `getAuditRepository().createEvent(...)`
3. return both resulting identifiers in the response contract

### Required non-regression boundary
The service may still return scaffold-level business output, but it must no longer fake persistence for these two records.

---

## 9. Exact Rewire Outcome Expectations

After this packet is applied:

- project routes must become repository-backed
- file detail and list flows must become repository-backed
- audit routes must become repository-backed
- `/api/auricrux/execute` must become repository-backed for action + audit writes

This is the first meaningful durable behavior slice for FCA Contractor Command.

---

## 10. Route-to-Service Alignment Checks

### Project routes
- `GET /api/projects` → `projectService.listProjects`
- `POST /api/projects` → `projectService.createProject`
- `GET /api/projects/:projectId` → `projectService.getProject`
- `PATCH /api/projects/:projectId` → `projectService.updateProject`

### File routes
- `GET /api/files/:fileId` → `fileService.getFile`
- `GET /api/projects/:projectId/files` → `fileService.listProjectFiles`

### Audit routes
- `GET /api/audit/events` → `auditService.listAuditEvents`
- `GET /api/audit/events/:eventId` → `auditService.getAuditEvent`

### Auricrux route
- `POST /api/auricrux/execute` → `auricruxService.execute`

---

## 11. Acceptance Criteria

Packet 049U is complete only when:

- [ ] all four service files import repository getters from the factory
- [ ] no service directly imports memory adapters
- [ ] project service no longer returns fake fallback project objects
- [ ] file service no longer invents standalone file detail objects
- [ ] audit service is repository-backed
- [ ] Auricrux execute creates both action and audit records through repositories
- [ ] route alignment remains consistent with Packet 049J

---

## 12. Failure Conditions

049U fails if:

- services still return demo-state objects where repository-backed state should exist
- routes are changed instead of services being rewired
- repository factory is bypassed
- Auricrux execute writes one record but not the other
- broader persistence families are pulled into this packet unnecessarily

---

## 13. Validation Commands

Run after rewiring:

```bash
npm run lint
npm run typecheck
npm run build
```

Recommended manual checks:

```bash
GET  /api/projects
POST /api/projects
GET  /api/projects/:projectId
PATCH /api/projects/:projectId
GET  /api/files/:fileId
POST /api/auricrux/execute
GET  /api/audit/events
GET  /api/audit/events/:eventId
```

---

## 14. Next Action

Produce:

**`FCA_PACKET_049V_DURABLE_TARGET_01_ROUTE_VERIFICATION_PACKET.md`**

That packet should define the exact route verification matrix and Definition of Done for the first repository-backed route surface.