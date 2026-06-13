# FCA_PACKET_049N_SAAS_LMS_DURABLE_TARGET_01_APPLY_PACKET

Status: Draft for repo placement  
Classification: Durable Target Apply Packet  
Priority: Critical  
Sequence: 049N  
Depends On:
- FCA_PACKET_049F_ACADEMY_LIVE_TRUTH_VALIDATION.md
- FCA_PACKET_049G_SAAS_LMS_CROSS_LINK_ENFORCEMENT.md
- FCA_PACKET_049H_FEATURE_GATES_MICRO_REMEDIATION.md
- FCA_PACKET_049I_SAAS_LMS_RUNTIME_OBJECT_MODEL.md
- FCA_PACKET_049J_SAAS_LMS_API_SURFACE_PACKET.md
- FCA_PACKET_049K_SAAS_LMS_BACKEND_REPO_SCAFFOLD_PACKET.md
- FCA_PACKET_049L_SAAS_LMS_BACKEND_STARTER_FILES_PACKET.md
- FCA_PACKET_049M_SAAS_LMS_PERSISTENCE_INTERFACE_PACKET.md

Scope: Exact repository interfaces, memory adapters, repository factory wiring, service rewiring targets, environment additions, validation commands, and Definition of Done for Durable Target 01

---

## 1. Issue

The unified SaaS + LMS backend now has packetized runtime, API, scaffolding, starter-file, and persistence-interface definitions, but it still lacks the first durable implementation slice. FCA requires real output, real persistence, and real auditability. The highest-value bounded durable slice remains the project spine, file spine, audit events, and Auricrux action records before broader Academy persistence expansion.

---

## 2. Risk

### 2.1 Shell-Only Risk
If project, file, audit, and Auricrux execution data remain in memory, the product still behaves like a demo shell.

### 2.2 Drift Risk
If durable persistence begins in Academy-first or gate-first pathways, the flagship SaaS product spine weakens and FCA drifts away from the required project/file/audit backbone.

### 2.3 Validation Risk
Without a bounded first durable target, persistence work will sprawl across too many services and become hard to validate.

### 2.4 Continuity Risk
If repository interfaces and adapters are not applied in a clean order, future storage migration or Dataverse introduction will require service rewrites instead of adapter swaps.

---

## 3. Decision

Apply **Durable Target 01** now and only for these object families:

1. Project
2. FileRecord
3. AuditEvent
4. AuricruxActionRecord

All other persistence remains behind existing service shells until this slice validates.

---

## 4. Truth Boundary

This packet is implementation-ready and intended for repo application.

It is **not** a claim that:
- Dataverse tables already exist
- production adapters are already wired
- migrations are complete
- live routes have been redeployed
- durable behavior is already verified in Azure

This packet defines the exact apply slice for the first durable persistence target.

---

## 5. Durable Target 01 Apply Objective

Deliver the smallest durable slice that makes the product materially more real:

- projects persist
- files persist as metadata records
- Auricrux execution actions persist
- audit events persist
- services stop inventing local-only state for these object families

This directly strengthens the flagship Contractor Command spine.

---

## 6. Required New Files

Create these repository interface files:

```text
src/repositories/projectRepository.ts
src/repositories/fileRepository.ts
src/repositories/auditRepository.ts
src/repositories/auricruxActionRepository.ts
```

Create these memory adapter files:

```text
src/persistence/adapters/memory/memoryProjectAdapter.ts
src/persistence/adapters/memory/memoryFileAdapter.ts
src/persistence/adapters/memory/memoryAuditAdapter.ts
src/persistence/adapters/memory/memoryAuricruxActionAdapter.ts
```

Create this factory file:

```text
src/persistence/factories/repositoryFactory.ts
```

Optional next-stage shells, but **not required for Durable Target 01 completion**:

```text
src/persistence/adapters/dataverse/dataverseProjectAdapter.ts
src/persistence/adapters/dataverse/dataverseFileAdapter.ts
src/persistence/adapters/dataverse/dataverseAuditAdapter.ts
src/persistence/adapters/dataverse/dataverseAuricruxActionAdapter.ts
```

---

## 7. Exact Repository Interface Contracts

### 7.1 `src/repositories/projectRepository.ts`

```ts
export type ProjectRecord = {
  id: string;
  tenantId: string;
  name: string;
  projectCode?: string;
  lifecycleState:
    | "lead"
    | "qualified"
    | "pre_design"
    | "design"
    | "cd"
    | "bid"
    | "permit"
    | "build"
    | "qa"
    | "closeout"
    | "warranty"
    | "growth"
    | "feedback";
  status: "active" | "on_hold" | "closed" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectInput = {
  tenantId: string;
  name: string;
  projectCode?: string;
  lifecycleState?: ProjectRecord["lifecycleState"];
  status?: ProjectRecord["status"];
};

export type UpdateProjectInput = {
  tenantId: string;
  projectId: string;
  name?: string;
  projectCode?: string;
  lifecycleState?: ProjectRecord["lifecycleState"];
  status?: ProjectRecord["status"];
};

export interface ProjectRepository {
  listByTenant(tenantId: string): Promise<ProjectRecord[]>;
  getById(tenantId: string, projectId: string): Promise<ProjectRecord | null>;
  create(input: CreateProjectInput): Promise<ProjectRecord>;
  update(input: UpdateProjectInput): Promise<ProjectRecord>;
}
```

### 7.2 `src/repositories/fileRepository.ts`

```ts
export type FileRecord = {
  id: string;
  tenantId: string;
  projectId?: string;
  fileName: string;
  mimeType?: string;
  fileCategory:
    | "drawing_set"
    | "spec"
    | "photo"
    | "contract"
    | "estimate_backup"
    | "training_asset"
    | "other";
  storageProvider: "blob" | "sharepoint" | "other";
  storageKey: string;
  status: "active" | "superseded" | "deleted";
  createdAt: string;
  updatedAt: string;
};

export type CreateFileInput = {
  tenantId: string;
  projectId?: string;
  fileName: string;
  mimeType?: string;
  fileCategory: FileRecord["fileCategory"];
  storageProvider: FileRecord["storageProvider"];
  storageKey: string;
};

export interface FileRepository {
  listByProject(tenantId: string, projectId: string): Promise<FileRecord[]>;
  getById(tenantId: string, fileId: string): Promise<FileRecord | null>;
  create(input: CreateFileInput): Promise<FileRecord>;
}
```

### 7.3 `src/repositories/auditRepository.ts`

```ts
export type AuditEventRecord = {
  id: string;
  tenantId: string;
  userId?: string;
  projectId?: string;
  eventType: string;
  objectType?: string;
  objectId?: string;
  eventPayloadJson: string;
  createdAt: string;
};

export type CreateAuditEventInput = Omit<AuditEventRecord, "id" | "createdAt">;

export interface AuditRepository {
  createEvent(input: CreateAuditEventInput): Promise<AuditEventRecord>;
  listEvents(tenantId: string): Promise<AuditEventRecord[]>;
  getEvent(tenantId: string, eventId: string): Promise<AuditEventRecord | null>;
}
```

### 7.4 `src/repositories/auricruxActionRepository.ts`

```ts
export type AuricruxActionRecord = {
  id: string;
  tenantId: string;
  userId?: string;
  projectId?: string;
  mode: "explain" | "recommend" | "execute";
  actionType: string;
  sourceObjectType?: string;
  sourceObjectId?: string;
  targetObjectType?: string;
  targetObjectId?: string;
  reasonCode: string;
  decisionSummary: string;
  beforeState?: string;
  afterState?: string;
  createdAt: string;
};

export type CreateAuricruxActionInput = Omit<AuricruxActionRecord, "id" | "createdAt">;

export interface AuricruxActionRepository {
  create(input: CreateAuricruxActionInput): Promise<AuricruxActionRecord>;
  listByTenant(tenantId: string): Promise<AuricruxActionRecord[]>;
}
```

---

## 8. Exact Memory Adapter Rules

### 8.1 Memory adapter purpose
Memory adapters are **temporary implementation adapters** used to:
- prove repository/service wiring
- validate route behavior
- preserve interface stability
- prevent route-level storage leakage

### 8.2 Memory adapter constraints
- tenant-safe filtering required
- deterministic timestamp creation required
- plain object returns only
- no provider-specific response shapes

### 8.3 Memory storage module pattern
Each adapter may hold a module-local array store.
Example pattern:

```ts
const projects: ProjectRecord[] = [];
```

This is acceptable only as a first adapter and must still obey repository interfaces.

---

## 9. Exact Memory Adapter Starter Structure

### 9.1 `memoryProjectAdapter.ts`
Must implement:
- `listByTenant`
- `getById`
- `create`
- `update`

### 9.2 `memoryFileAdapter.ts`
Must implement:
- `listByProject`
- `getById`
- `create`

### 9.3 `memoryAuditAdapter.ts`
Must implement:
- `createEvent`
- `listEvents`
- `getEvent`

### 9.4 `memoryAuricruxActionAdapter.ts`
Must implement:
- `create`
- `listByTenant`

---

## 10. Repository Factory Contract

### Required file
`src/persistence/factories/repositoryFactory.ts`

### Required environment variable
```bash
PERSISTENCE_MODE=memory
```

### Allowed values now
- `memory`
- `dataverse`

### Required exports
- `getProjectRepository()`
- `getFileRepository()`
- `getAuditRepository()`
- `getAuricruxActionRepository()`

### Factory rule
Service layer must import repositories from the factory boundary rather than directly from a specific adapter.

---

## 11. Exact Service Rewiring Scope

Rewire only these services now:

### `projectService.ts`
Replace hardcoded demo list/detail behavior with repository-backed list/detail/create/update behavior.

### `fileService.ts`
Replace any direct fake object creation with repository-backed file metadata creation and lookup.

### `auditService.ts`
Use `AuditRepository` for event writes and reads.

### `auricruxService.ts`
On `/execute`, persist `AuricruxActionRecord` and an `AuditEvent` through repositories.

Do **not** rewire Academy/readiness/remediation persistence yet unless required for compilation.

---

## 12. Exact Route Impact

After Durable Target 01, these route families must be durably backed:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `GET /api/files/:fileId`
- `POST /api/auricrux/execute`
- `GET /api/audit/events`
- `GET /api/audit/events/:eventId`

Optional but recommended in same slice:
- `GET /api/projects/:projectId/files`

---

## 13. Exact Environment Additions

Add or document:

```bash
PERSISTENCE_MODE=memory
```

Later, not required for 049N completion:

```bash
PERSISTENCE_MODE=dataverse
DATAVERSE_URL=
DATAVERSE_TENANT_ID=
DATAVERSE_CLIENT_ID=
DATAVERSE_CLIENT_SECRET=
```

No secrets may be stored in repo docs or governance libraries. Credential handling must remain in secure secret storage. fileciteturn4file3turn4file4

---

## 14. Validation Commands

Run after applying Durable Target 01:

```bash
npm run lint
npm run typecheck
npm run build
```

If a test runner exists, also run:

```bash
npm run test
```

Recommended manual API checks:

```bash
GET  /api/projects
POST /api/projects
GET  /api/projects/:projectId
PATCH /api/projects/:projectId
POST /api/auricrux/execute
GET  /api/audit/events
```

---

## 15. Definition of Done — Durable Target 01

Durable Target 01 is complete only when all are true:

- [ ] project repository interface exists
- [ ] file repository interface exists
- [ ] audit repository interface exists
- [ ] Auricrux action repository interface exists
- [ ] memory adapters exist for all four
- [ ] repository factory exists
- [ ] services use factory-backed repositories
- [ ] route families above compile against repository-backed services
- [ ] `/api/auricrux/execute` writes both Auricrux action and audit event
- [ ] no direct route-level in-memory persistence remains for these object families
- [ ] build/typecheck pass

---

## 16. Failure Conditions

049N fails if:

- persistence logic is placed directly in route files
- factory pattern is skipped
- project/file persistence is deferred in favor of later Academy complexity
- `/api/auricrux/execute` does not durably record action + audit
- the packet is treated as full persistent completion for all SaaS/LMS object families
- secrets are introduced into repo documentation or starter files

---

## 17. Logical Placement Standard for This Packet

This packet must be persistently saved at:

```text
docs/packets/FCA_PACKET_049N_SAAS_LMS_DURABLE_TARGET_01_APPLY_PACKET.md
```

This path is canonical for sequenced implementation packets going forward.

---

## 18. Executive Summary

This packet applies the first real persistence slice for the unified SaaS + LMS system: Projects, Files, AuditEvents, and AuricruxActionRecords. It defines exact repository interfaces, memory adapters, factory boundaries, service rewiring scope, environment additions, validation commands, and Definition of Done so FCA can move from backend shell to bounded durable product spine without uncontrolled persistence sprawl.

---

## 19. Next Action

Produce:

**`FCA_PACKET_049O_LOGICAL_ARTIFACT_PLACEMENT_AND_PERSISTENCE_STANDARD.md`**

That packet should define:
- canonical folder placement rules
- packet storage rules
- naming rules
- update vs supersede rules
- persistence-save requirements on every run
- repo artifact index expectations
- anti-drift placement enforcement
