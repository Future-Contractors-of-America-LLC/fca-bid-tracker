# FCA_PACKET_049T_DURABLE_TARGET_01_REPOSITORY_FACTORY_FILE

Status: Active Draft for repo placement  
Classification: Repository Factory Packet  
Priority: Critical  
Sequence: 049T  
Depends On:
- FCA_PACKET_049N_SAAS_LMS_DURABLE_TARGET_01_APPLY_PACKET.md
- FCA_PACKET_049O_LOGICAL_ARTIFACT_PLACEMENT_AND_PERSISTENCE_STANDARD.md
- FCA_PACKET_049P_DURABLE_TARGET_01_EXECUTION_CHECKLIST.md
- FCA_PACKET_049Q_DURABLE_TARGET_01_CODE_PATCH_ARTIFACT.md
- FCA_PACKET_049R_DURABLE_TARGET_01_REPOSITORY_INTERFACE_FILES.md
- FCA_PACKET_049S_DURABLE_TARGET_01_MEMORY_ADAPTER_FILES.md

Scope: Exact repo-ready code contents for the Durable Target 01 repository factory file

---

## 1. Issue

The first repository interfaces and memory adapters are now defined, but the service layer still needs a single canonical selection boundary so routes and services do not bind directly to specific adapters. Without a factory, persistence mode will drift across files.

---

## 2. Decision

Add one canonical repository factory for Durable Target 01.

This factory must:
- expose project, file, audit, and Auricrux action repositories
- select adapter by environment
- default safely to `memory`
- keep service-layer imports provider-agnostic

---

## 3. Canonical Placement

This artifact is persistently saved at:

```text
docs/packets/FCA_PACKET_049T_DURABLE_TARGET_01_REPOSITORY_FACTORY_FILE.md
```

The code file defined below is intended for canonical placement at:

```text
src/persistence/factories/repositoryFactory.ts
```

---

## 4. File — `src/persistence/factories/repositoryFactory.ts`

```ts
import {
  ProjectRepository
} from "../../repositories/projectRepository";
import {
  FileRepository
} from "../../repositories/fileRepository";
import {
  AuditRepository
} from "../../repositories/auditRepository";
import {
  AuricruxActionRepository
} from "../../repositories/auricruxActionRepository";

import { MemoryProjectAdapter } from "../adapters/memory/memoryProjectAdapter";
import { MemoryFileAdapter } from "../adapters/memory/memoryFileAdapter";
import { MemoryAuditAdapter } from "../adapters/memory/memoryAuditAdapter";
import { MemoryAuricruxActionAdapter } from "../adapters/memory/memoryAuricruxActionAdapter";

export type PersistenceMode = "memory" | "dataverse";

function getPersistenceMode(): PersistenceMode {
  const raw = (process.env.PERSISTENCE_MODE || "memory").toLowerCase();
  if (raw === "dataverse") return "dataverse";
  return "memory";
}

const mode = getPersistenceMode();

let projectRepository: ProjectRepository | null = null;
let fileRepository: FileRepository | null = null;
let auditRepository: AuditRepository | null = null;
let auricruxActionRepository: AuricruxActionRepository | null = null;

export function getProjectRepository(): ProjectRepository {
  if (projectRepository) return projectRepository;

  switch (mode) {
    case "dataverse":
      throw new Error("Dataverse project adapter not implemented yet.");
    case "memory":
    default:
      projectRepository = new MemoryProjectAdapter();
      return projectRepository;
  }
}

export function getFileRepository(): FileRepository {
  if (fileRepository) return fileRepository;

  switch (mode) {
    case "dataverse":
      throw new Error("Dataverse file adapter not implemented yet.");
    case "memory":
    default:
      fileRepository = new MemoryFileAdapter();
      return fileRepository;
  }
}

export function getAuditRepository(): AuditRepository {
  if (auditRepository) return auditRepository;

  switch (mode) {
    case "dataverse":
      throw new Error("Dataverse audit adapter not implemented yet.");
    case "memory":
    default:
      auditRepository = new MemoryAuditAdapter();
      return auditRepository;
  }
}

export function getAuricruxActionRepository(): AuricruxActionRepository {
  if (auricruxActionRepository) return auricruxActionRepository;

  switch (mode) {
    case "dataverse":
      throw new Error("Dataverse Auricrux action adapter not implemented yet.");
    case "memory":
    default:
      auricruxActionRepository = new MemoryAuricruxActionAdapter();
      return auricruxActionRepository;
  }
}

export function getActivePersistenceMode(): PersistenceMode {
  return mode;
}
```

---

## 5. Environment Requirement

Add or document:

```bash
PERSISTENCE_MODE=memory
```

Allowed now:
- `memory`
- `dataverse`

`dataverse` is intentionally not yet implemented in this packet.

---

## 6. Service Rewiring Rule

After adding this factory:
- `projectService.ts` must import `getProjectRepository()`
- `fileService.ts` must import `getFileRepository()`
- `auditService.ts` must import `getAuditRepository()`
- `auricruxService.ts` must import `getAuricruxActionRepository()` and `getAuditRepository()`

Services must not instantiate adapters directly.

---

## 7. Acceptance Criteria

Packet 049T is complete only when:

- [ ] `repositoryFactory.ts` exists
- [ ] memory is the default persistence mode
- [ ] provider selection is centralized
- [ ] service layer can import repository getters instead of adapter classes
- [ ] file is placed under `src/persistence/factories/`

---

## 8. Failure Conditions

049T fails if:

- services instantiate adapters directly
- routes import adapters directly
- default mode is undefined or unsafe
- unrelated repository families are added
- this packet is treated as Dataverse completion

---

## 9. Next Action

Produce:

**`FCA_PACKET_049U_DURABLE_TARGET_01_SERVICE_REWIRE_PACKET.md`**

That packet should define the exact service-level rewiring for project, file, audit, and Auricrux execution services.