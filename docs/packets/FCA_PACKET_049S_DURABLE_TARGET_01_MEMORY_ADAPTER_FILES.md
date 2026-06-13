# FCA_PACKET_049S_DURABLE_TARGET_01_MEMORY_ADAPTER_FILES

Status: Active Draft for repo placement  
Classification: Memory Adapter Files Packet  
Priority: Critical  
Sequence: 049S  
Depends On:
- FCA_PACKET_049N_SAAS_LMS_DURABLE_TARGET_01_APPLY_PACKET.md
- FCA_PACKET_049O_LOGICAL_ARTIFACT_PLACEMENT_AND_PERSISTENCE_STANDARD.md
- FCA_PACKET_049P_DURABLE_TARGET_01_EXECUTION_CHECKLIST.md
- FCA_PACKET_049Q_DURABLE_TARGET_01_CODE_PATCH_ARTIFACT.md
- FCA_PACKET_049R_DURABLE_TARGET_01_REPOSITORY_INTERFACE_FILES.md

Scope: Exact repo-ready code contents for the first Durable Target 01 memory adapter files

---

## 1. Issue

The first repository interface files are now defined, but Durable Target 01 still needs concrete adapter implementations so the backend can move from interface-only persistence planning to repository-backed behavior without jumping prematurely into provider-specific storage.

---

## 2. Decision

Implement memory adapters first for the bounded Durable Target 01 object families:

1. Project
2. FileRecord
3. AuditEvent
4. AuricruxActionRecord

These adapters are temporary but real execution adapters. They must satisfy interface contracts, preserve tenant scoping, and allow service rewiring before Dataverse or another durable provider is introduced.

---

## 3. Canonical Placement

This artifact is persistently saved at:

```text
docs/packets/FCA_PACKET_049S_DURABLE_TARGET_01_MEMORY_ADAPTER_FILES.md
```

The code files defined below are intended for canonical placement under:

```text
src/persistence/adapters/memory/
```

---

## 4. File — `src/persistence/adapters/memory/memoryProjectAdapter.ts`

```ts
import {
  CreateProjectInput,
  ProjectRecord,
  ProjectRepository,
  UpdateProjectInput
} from "../../../repositories/projectRepository";

const projects: ProjectRecord[] = [];

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `prj_${Math.random().toString(36).slice(2, 10)}`;
}

export class MemoryProjectAdapter implements ProjectRepository {
  async listByTenant(tenantId: string): Promise<ProjectRecord[]> {
    return projects.filter((p) => p.tenantId === tenantId);
  }

  async getById(tenantId: string, projectId: string): Promise<ProjectRecord | null> {
    return projects.find((p) => p.tenantId === tenantId && p.id === projectId) ?? null;
  }

  async create(input: CreateProjectInput): Promise<ProjectRecord> {
    const createdAt = nowIso();

    const record: ProjectRecord = {
      id: makeId(),
      tenantId: input.tenantId,
      name: input.name,
      projectCode: input.projectCode,
      lifecycleState: input.lifecycleState ?? "lead",
      status: input.status ?? "active",
      createdAt,
      updatedAt: createdAt
    };

    projects.push(record);
    return record;
  }

  async update(input: UpdateProjectInput): Promise<ProjectRecord> {
    const record = projects.find(
      (p) => p.tenantId === input.tenantId && p.id === input.projectId
    );

    if (!record) {
      throw new Error("Project not found.");
    }

    if (input.name !== undefined) record.name = input.name;
    if (input.projectCode !== undefined) record.projectCode = input.projectCode;
    if (input.lifecycleState !== undefined) record.lifecycleState = input.lifecycleState;
    if (input.status !== undefined) record.status = input.status;
    record.updatedAt = nowIso();

    return record;
  }
}
```

---

## 5. File — `src/persistence/adapters/memory/memoryFileAdapter.ts`

```ts
import {
  CreateFileInput,
  FileRecord,
  FileRepository
} from "../../../repositories/fileRepository";

const files: FileRecord[] = [];

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `fil_${Math.random().toString(36).slice(2, 10)}`;
}

export class MemoryFileAdapter implements FileRepository {
  async listByProject(tenantId: string, projectId: string): Promise<FileRecord[]> {
    return files.filter((f) => f.tenantId === tenantId && f.projectId === projectId);
  }

  async getById(tenantId: string, fileId: string): Promise<FileRecord | null> {
    return files.find((f) => f.tenantId === tenantId && f.id === fileId) ?? null;
  }

  async create(input: CreateFileInput): Promise<FileRecord> {
    const createdAt = nowIso();

    const record: FileRecord = {
      id: makeId(),
      tenantId: input.tenantId,
      projectId: input.projectId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileCategory: input.fileCategory,
      storageProvider: input.storageProvider,
      storageKey: input.storageKey,
      status: "active",
      createdAt,
      updatedAt: createdAt
    };

    files.push(record);
    return record;
  }
}
```

---

## 6. File — `src/persistence/adapters/memory/memoryAuditAdapter.ts`

```ts
import {
  AuditEventRecord,
  AuditRepository,
  CreateAuditEventInput
} from "../../../repositories/auditRepository";

const auditEvents: AuditEventRecord[] = [];

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `aud_${Math.random().toString(36).slice(2, 10)}`;
}

export class MemoryAuditAdapter implements AuditRepository {
  async createEvent(input: CreateAuditEventInput): Promise<AuditEventRecord> {
    const record: AuditEventRecord = {
      id: makeId(),
      ...input,
      createdAt: nowIso()
    };

    auditEvents.push(record);
    return record;
  }

  async listEvents(tenantId: string): Promise<AuditEventRecord[]> {
    return auditEvents.filter((e) => e.tenantId === tenantId);
  }

  async getEvent(tenantId: string, eventId: string): Promise<AuditEventRecord | null> {
    return auditEvents.find((e) => e.tenantId === tenantId && e.id === eventId) ?? null;
  }
}
```

---

## 7. File — `src/persistence/adapters/memory/memoryAuricruxActionAdapter.ts`

```ts
import {
  AuricruxActionRecord,
  AuricruxActionRepository,
  CreateAuricruxActionInput
} from "../../../repositories/auricruxActionRepository";

const actions: AuricruxActionRecord[] = [];

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `act_${Math.random().toString(36).slice(2, 10)}`;
}

export class MemoryAuricruxActionAdapter implements AuricruxActionRepository {
  async create(input: CreateAuricruxActionInput): Promise<AuricruxActionRecord> {
    const record: AuricruxActionRecord = {
      id: makeId(),
      ...input,
      createdAt: nowIso()
    };

    actions.push(record);
    return record;
  }

  async listByTenant(tenantId: string): Promise<AuricruxActionRecord[]> {
    return actions.filter((a) => a.tenantId === tenantId);
  }
}
```

---

## 8. Apply Order

Apply these files in this order:

1. `src/persistence/adapters/memory/memoryProjectAdapter.ts`
2. `src/persistence/adapters/memory/memoryFileAdapter.ts`
3. `src/persistence/adapters/memory/memoryAuditAdapter.ts`
4. `src/persistence/adapters/memory/memoryAuricruxActionAdapter.ts`

Then proceed to the repository factory packet.

---

## 9. Acceptance Criteria

Packet 049S is complete only when:

- [ ] all four memory adapter files exist
- [ ] each adapter satisfies its repository interface
- [ ] tenant scoping is enforced in reads
- [ ] no route file requires storage-provider knowledge
- [ ] all files are placed under `src/persistence/adapters/memory/`

---

## 10. Failure Conditions

049S fails if:

- adapters write outside interface contracts
- tenant-safe filtering is omitted
- provider-specific code leaks upward
- unrelated object families are introduced
- this packet is treated as provider-backed durable completion

---

## 11. Next Action

Produce:

**`FCA_PACKET_049T_DURABLE_TARGET_01_REPOSITORY_FACTORY_FILE.md`**

That packet should provide the exact repo-ready code contents for the repository factory file.