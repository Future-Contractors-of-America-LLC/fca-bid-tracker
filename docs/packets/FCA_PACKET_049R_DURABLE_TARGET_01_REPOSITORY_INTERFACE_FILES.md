# FCA_PACKET_049R_DURABLE_TARGET_01_REPOSITORY_INTERFACE_FILES

Status: Active Draft for repo placement  
Classification: Repository Interface Files Packet  
Priority: Critical  
Sequence: 049R  
Depends On:
- FCA_PACKET_049N_SAAS_LMS_DURABLE_TARGET_01_APPLY_PACKET.md
- FCA_PACKET_049O_LOGICAL_ARTIFACT_PLACEMENT_AND_PERSISTENCE_STANDARD.md
- FCA_PACKET_049P_DURABLE_TARGET_01_EXECUTION_CHECKLIST.md
- FCA_PACKET_049Q_DURABLE_TARGET_01_CODE_PATCH_ARTIFACT.md

Scope: Exact repo-ready code contents for the first Durable Target 01 repository interface files

---

## 1. Issue

Durable Target 01 now has placement, checklist, and patch-order artifacts, but the first code-facing persistence layer still needs exact repository interface file contents so implementation can begin without ad hoc contract drift.

---

## 2. Decision

Define the first repository interface files now and keep the scope bounded to:

1. ProjectRepository
2. FileRepository
3. AuditRepository
4. AuricruxActionRepository

No Academy, readiness, cross-link, feature-gate, or remediation repository interfaces are included in this packet.

---

## 3. Canonical Placement

This artifact is persistently saved at:

```text
docs/packets/FCA_PACKET_049R_DURABLE_TARGET_01_REPOSITORY_INTERFACE_FILES.md
```

The code files defined below are intended for canonical placement under:

```text
src/repositories/
```

---

## 4. File — `src/repositories/projectRepository.ts`

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

---

## 5. File — `src/repositories/fileRepository.ts`

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

---

## 6. File — `src/repositories/auditRepository.ts`

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

---

## 7. File — `src/repositories/auricruxActionRepository.ts`

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

## 8. Apply Order

Apply these files in this order:

1. `src/repositories/projectRepository.ts`
2. `src/repositories/fileRepository.ts`
3. `src/repositories/auditRepository.ts`
4. `src/repositories/auricruxActionRepository.ts`

Then proceed to memory adapters.

---

## 9. Acceptance Criteria

Packet 049R is complete only when:

- [ ] all four repository interface files exist
- [ ] all exported record types are tenant-safe
- [ ] all interfaces are storage-provider-agnostic
- [ ] no route file imports storage-provider logic directly
- [ ] the files are placed under `src/repositories/`

---

## 10. Failure Conditions

049R fails if:

- provider SDK types leak into repository contracts
- tenant-safe scoping is omitted
- unrelated object families are added
- interfaces are placed outside canonical repo structure
- this packet is treated as live persistence completion

---

## 11. Next Action

Produce:

**`FCA_PACKET_049S_DURABLE_TARGET_01_MEMORY_ADAPTER_FILES.md`**

That packet should provide the exact repo-ready code contents for the first memory adapter files.