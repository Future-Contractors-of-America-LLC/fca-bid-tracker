# FCA_PACKET_052H_SHARED_SCHEMA_PAYLOAD_CONTRACT

Status: Active
Classification: Binding implementation packet
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Controlling Packet: `052H`
Next Packet: `052I`
Target Packet: `060A`

---

## Issue

`052G` fixed canonical routes, storage, UI entry points, and anti-drift rules.
`052H` must now lock the shared payload contract so backend, frontend, SaaS, and Academy all speak the same object language.

---

## Truth Boundary

This packet is an implementation-ready schema contract.

It does **not** claim:
- live repo route handlers are all wired
- runtime validation is already enforced
- storage persistence is already deployed
- tenant-authenticated traffic has been verified end-to-end

It **does** define the payload shapes, enum rules, linkage rules, and starter validation surfaces required for implementation.

---

## Canonical Rule

Every shared object must be:
- tenant-bound
- auditable
- project-linked where applicable
- file-linkable where applicable
- Auricrux-action-linkable
- Academy-remediation-compatible where applicable
- reversible through state and audit history

No standalone object definitions are allowed.

---

## 1. Shared Primitive Types

```ts
export type UUID = string;
export type ISODateTime = string;
export type EntityStatus = string;
export type ProjectState =
  | 'lead'
  | 'qualified'
  | 'pre_design'
  | 'design'
  | 'cd'
  | 'bid'
  | 'permit'
  | 'build'
  | 'qa'
  | 'closeout'
  | 'warranty'
  | 'growth'
  | 'feedback';
```

---

## 2. Base Envelope Contract

Every persisted object must implement:

```ts
export interface BaseEntity {
  id: UUID;
  tenantId: UUID;
  projectId?: UUID | null;
  status: EntityStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  createdBy: UUID;
  updatedBy: UUID;
  auricruxActionId?: UUID | null;
  auditEventIds: UUID[];
  fileIds: UUID[];
  sourceObjectIds: UUID[];
  remediationLinkIds: UUID[];
}
```

Validation rules:
- `id`, `tenantId`, `status`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy` required
- `auditEventIds`, `fileIds`, `sourceObjectIds`, `remediationLinkIds` default to empty arrays, never null
- `projectId` required for project-bound objects

---

## 3. Core Shared Entity Contracts

### 3.1 Project

```ts
export interface Project extends BaseEntity {
  projectId: UUID;
  code: string;
  name: string;
  customerId?: UUID | null;
  lifecycleState: ProjectState;
  description?: string;
}
```

Validation:
- `code`: 1-64 chars
- `name`: 1-200 chars
- `lifecycleState`: must be valid `ProjectState`

### 3.2 File

```ts
export type FileStatus = 'uploaded' | 'processing' | 'indexed' | 'briefed' | 'superseded' | 'archived';

export interface FileRecord extends BaseEntity {
  artifactType: 'plan' | 'spec' | 'photo' | 'pdf' | 'email' | 'model' | 'generated' | 'academy';
  storagePath: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  version: number;
  checksum?: string | null;
  status: FileStatus;
}
```

Validation:
- `artifactType`, `storagePath`, `originalName`, `mimeType`, `sizeBytes`, `version` required
- `sizeBytes >= 0`
- `version >= 1`

### 3.3 Drawing Set / Sheet

```ts
export type DrawingSetStatus = 'draft' | 'active' | 'superseded' | 'closed';

export interface DrawingSet extends BaseEntity {
  title: string;
  revisionLabel?: string | null;
  issueDate?: string | null;
  status: DrawingSetStatus;
}

export interface Sheet extends BaseEntity {
  drawingSetId: UUID;
  sheetNumber: string;
  sheetTitle: string;
  discipline?: string | null;
  revisionLabel?: string | null;
}
```

Validation:
- `drawingSetId`, `sheetNumber`, `sheetTitle` required
- `sheetNumber` unique within `drawingSetId`

### 3.4 Takeoff Item

```ts
export type TakeoffStatus = 'draft' | 'open' | 'in_review' | 'approved' | 'resolved' | 'closed';

export interface TakeoffItem extends BaseEntity {
  sheetId: UUID;
  subject: string;
  quantity: number;
  unit: string;
  zone?: string | null;
  assemblyCode?: string | null;
  status: TakeoffStatus;
}
```

Validation:
- `sheetId`, `subject`, `quantity`, `unit`, `status` required
- `quantity >= 0`

### 3.5 Redline

```ts
export type RedlineStatus = 'draft' | 'open' | 'in_review' | 'resolved' | 'closed';

export interface Redline extends BaseEntity {
  sheetId: UUID;
  title: string;
  category: 'clarification' | 'field_condition' | 'design_conflict' | 'scope_gap';
  regionRef?: string | null;
  status: RedlineStatus;
}
```

### 3.6 RFI

```ts
export type RFIStatus = 'draft' | 'open' | 'in_review' | 'answered' | 'resolved' | 'closed';

export interface RFI extends BaseEntity {
  sheetId?: UUID | null;
  redlineId?: UUID | null;
  question: string;
  suggestedAnswer?: string | null;
  officialAnswer?: string | null;
  dueAt?: ISODateTime | null;
  status: RFIStatus;
}
```

Validation:
- `question` required, 1-5000 chars
- at least one of `sheetId`, `redlineId`, or `sourceObjectIds.length > 0`

### 3.7 Change Event / Change Order

```ts
export type ChangeStatus = 'draft' | 'open' | 'pricing' | 'submitted' | 'approved' | 'rejected' | 'closed';

export interface ChangeEvent extends BaseEntity {
  rfiId?: UUID | null;
  redlineId?: UUID | null;
  title: string;
  narrative: string;
  estimatedCostDelta?: number | null;
  estimatedDaysDelta?: number | null;
  status: ChangeStatus;
}

export interface ChangeOrder extends BaseEntity {
  changeEventId: UUID;
  title: string;
  narrative: string;
  laborAmount?: number | null;
  materialAmount?: number | null;
  equipmentAmount?: number | null;
  subcontractAmount?: number | null;
  overheadAmount?: number | null;
  profitAmount?: number | null;
  totalAmount: number;
  status: ChangeStatus;
}
```

Validation:
- `changeEventId`, `title`, `narrative`, `totalAmount`, `status` required for `ChangeOrder`
- monetary fields default to `0` where omitted at execution time
- `totalAmount` must equal sum of cost parts when cost parts are present

### 3.8 QC Item

```ts
export type QCStatus = 'draft' | 'open' | 'failed' | 'passed' | 'resolved' | 'closed';

export interface QCItem extends BaseEntity {
  sheetId?: UUID | null;
  trade?: string | null;
  title: string;
  checklistCode?: string | null;
  responsibleParty?: string | null;
  dueAt?: ISODateTime | null;
  status: QCStatus;
}
```

### 3.9 Training Record / Credential

```ts
export type TrainingStatus = 'assigned' | 'in_progress' | 'passed' | 'failed' | 'waived';
export type CredentialStatus = 'issued' | 'active' | 'expired' | 'revoked';

export interface TrainingRecord extends BaseEntity {
  userId: UUID;
  moduleId: UUID;
  sourceActionId?: UUID | null;
  mode: 'teach' | 'remediation' | 'required';
  status: TrainingStatus;
  score?: number | null;
  completedAt?: ISODateTime | null;
}

export interface Credential extends BaseEntity {
  userId: UUID;
  code: string;
  title: string;
  issuer?: string | null;
  issuedAt?: ISODateTime | null;
  expiresAt?: ISODateTime | null;
  status: CredentialStatus;
}
```

Validation:
- `TrainingRecord.moduleId`, `TrainingRecord.userId`, `TrainingRecord.mode`, `TrainingRecord.status` required
- `Credential.userId`, `Credential.code`, `Credential.title`, `Credential.status` required

### 3.10 Auricrux Action / Audit Event

```ts
export type AuricruxMode = 'explain' | 'recommend' | 'execute' | 'teach';

export interface AuricruxAction extends BaseEntity {
  mode: AuricruxMode;
  subjectType: string;
  subjectId?: UUID | null;
  reason: string;
  beforeSnapshot?: Record<string, unknown> | null;
  afterSnapshot?: Record<string, unknown> | null;
  outcome: 'proposed' | 'executed' | 'rejected' | 'rolled_back';
}

export interface AuditEvent extends BaseEntity {
  eventType: string;
  subjectType: string;
  subjectId?: UUID | null;
  actorType: 'user' | 'auricrux' | 'system';
  summary: string;
  metadata?: Record<string, unknown> | null;
}
```

Validation:
- `reason`, `mode`, `subjectType`, `outcome` required for `AuricruxAction`
- `eventType`, `subjectType`, `actorType`, `summary` required for `AuditEvent`

---

## 4. Linkage Contract

### Required linkage rules
- `TakeoffItem.sheetId` must resolve to a valid `Sheet`
- `Redline.sheetId` must resolve to a valid `Sheet`
- `RFI.redlineId` must resolve to a valid `Redline` when present
- `ChangeEvent.rfiId` must resolve to a valid `RFI` when present
- `ChangeOrder.changeEventId` must resolve to a valid `ChangeEvent`
- `TrainingRecord.sourceActionId` must resolve to a valid `AuricruxAction` when `mode = remediation`
- `AuricruxAction.subjectId` must resolve when `subjectType` is a typed shared object
- `AuditEvent.subjectId` must resolve when `subjectType` is a typed shared object

### Cross-tenant rule
No linkage may cross `tenantId` boundaries.

### Project inheritance rule
If a linked object has `projectId`, all linked sibling objects must share the same `projectId` unless the subject is tenant-global.

---

## 5. Canonical Request / Response Shapes

### 5.1 Create request shape

```ts
export interface CreateEntityRequest<T> {
  data: T;
  context?: {
    requestId?: string;
    sourceSurface?: string;
  };
}
```

### 5.2 Standard response shape

```ts
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  auditEventId?: UUID;
  auricruxActionId?: UUID | null;
}
```

### 5.3 Collection response shape

```ts
export interface ListResponse<T> {
  ok: boolean;
  items: T[];
  nextCursor?: string | null;
}
```

---

## 6. Starter Zod Validation Surface

```ts
import { z } from 'zod';

export const uuidSchema = z.string().min(1);
export const isoDateTimeSchema = z.string().min(1);

export const baseEntitySchema = z.object({
  id: uuidSchema,
  tenantId: uuidSchema,
  projectId: uuidSchema.nullish(),
  status: z.string().min(1),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  createdBy: uuidSchema,
  updatedBy: uuidSchema,
  auricruxActionId: uuidSchema.nullish(),
  auditEventIds: z.array(uuidSchema).default([]),
  fileIds: z.array(uuidSchema).default([]),
  sourceObjectIds: z.array(uuidSchema).default([]),
  remediationLinkIds: z.array(uuidSchema).default([]),
});
```

Minimum required implementation in next code packet:
- `projectSchema`
- `fileRecordSchema`
- `sheetSchema`
- `takeoffItemSchema`
- `redlineSchema`
- `rfiSchema`
- `changeEventSchema`
- `changeOrderSchema`
- `qcItemSchema`
- `trainingRecordSchema`
- `credentialSchema`
- `auricruxActionSchema`
- `auditEventSchema`

---

## 7. Validation Failure Rules

Reject writes when:
- required linkage target missing
- tenant mismatch detected
- project mismatch detected on project-bound linked objects
- invalid enum value submitted
- arrays submitted as `null`
- `AuricruxAction` is created without `reason`
- `AuditEvent` is omitted for a state-changing action
- remediation record is created without source action linkage

---

## 8. DO / TEACH Parity Rule

If a SaaS workflow can:
- create
- update
- explain
- validate
- remediate

then the Academy layer must be able to represent the same subject domain using the same canonical object names or linked training projections.

No fake TEACH schema divergence is allowed.

---

## 9. File Targets for Implementation Packet Follow-On

This packet should be implemented into repo code through files such as:
- `src/types/fca-contracts.ts`
- `src/lib/validation/fcaSchemas.ts`
- `api/_lib/contracts/fcaContracts.ts`
- `api/_lib/validation/fcaSchemas.ts`
- `docs/fca-contractor-command-payload-contract.md`

These file paths are starter targets, not a claim they already exist.

---

## 10. Acceptance Criteria

`052H` is complete only if:
- shared object interfaces are fixed
- enums are fixed
- request and response envelopes are fixed
- field-level validation rules are fixed
- linkage rules are fixed
- audit and Auricrux requirements are fixed
- DO / TEACH parity is explicit
- the next code packet can implement without schema ambiguity

---

## 11. Next Packet

`052I = Schema Implementation and Validation Wiring Packet`

Must deliver:
- exact file-by-file starter code targets
- frontend/backoffice shared TypeScript interfaces
- backend validator skeletons
- route-level request validation plan
- acceptance checks for schema drift

---

## Progress Lock

- Current packet: `052H`
- Next packet: `052I`
- Target packet: `060A`
- Save-after-every-prompt rule remains active
