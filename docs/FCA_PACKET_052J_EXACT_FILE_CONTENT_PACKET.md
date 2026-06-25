# FCA_PACKET_052J_EXACT_FILE_CONTENT_PACKET

Status: Active
Classification: Binding exact-code packet
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `052J`
Next Packet: `052K`
Target Packet: `060A`

---

## Issue

`052I` fixed the repo file map and apply order.
`052J` must now provide exact starter file contents for the first shared contract and validation layer so implementation can begin without ambiguity.

---

## Truth Boundary

This packet provides exact file content.

It does **not** claim:
- these files are already applied in runtime code
- all imports match current repo structure without adaptation
- route business logic is complete
- deployment is complete

It **does** provide exact starter content for the first implementation wave.

---

## Apply Order

1. `src/lib/contracts/fcaEnums.ts`
2. `src/types/fca-contracts.ts`
3. `src/lib/api/fcaApiTypes.ts`
4. `src/lib/contracts/fcaSchemas.ts`
5. `api/_lib/contracts/fcaEnums.js`
6. `api/_lib/contracts/fcaContracts.js`
7. `api/_lib/validation/fcaSchemas.js`
8. `api/_lib/validation/assertValid.js`

---

## File 1 â€” `src/lib/contracts/fcaEnums.ts`

```ts
export const PROJECT_STATES = [
  'lead',
  'qualified',
  'pre_design',
  'design',
  'cd',
  'bid',
  'permit',
  'build',
  'qa',
  'closeout',
  'warranty',
  'growth',
  'feedback',
] as const

export const RECORD_STATUSES = [
  'draft',
  'open',
  'in_review',
  'approved',
  'resolved',
  'closed',
  'superseded',
  'archived',
] as const

export const FILE_STATUSES = [
  'uploaded',
  'processing',
  'indexed',
  'briefed',
  'superseded',
  'archived',
] as const

export const TRAINING_STATUSES = [
  'assigned',
  'in_progress',
  'passed',
  'failed',
  'issued',
  'expired',
  'revoked',
] as const

export const AURICRUX_MODES = [
  'explain',
  'recommend',
  'execute',
  'teach',
] as const

export const AUDIT_EVENT_TYPES = [
  'create',
  'update',
  'delete',
  'state_transition',
  'file_upload',
  'file_version',
  'briefing_generated',
  'remediation_linked',
  'feature_gate_evaluated',
  'auricrux_action',
] as const

export type ProjectState = (typeof PROJECT_STATES)[number]
export type RecordStatus = (typeof RECORD_STATUSES)[number]
export type FileStatus = (typeof FILE_STATUSES)[number]
export type TrainingStatus = (typeof TRAINING_STATUSES)[number]
export type AuricruxMode = (typeof AURICRUX_MODES)[number]
export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number]
```

---

## File 2 â€” `src/types/fca-contracts.ts`

```ts
import type {
  AuditEventType,
  AuricruxMode,
  FileStatus,
  ProjectState,
} from '../lib/contracts/fcaEnums'

export interface BaseRecord {
  id: string
  tenantId: string
  status: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  auricruxActionId?: string | null
  auditEventId?: string | null
}

export interface ProjectBoundRecord extends BaseRecord {
  projectId: string
  fileIds?: string[]
  sourceObjectIds?: string[]
  remediationLinkIds?: string[]
}

export interface Project extends BaseRecord {
  name: string
  code?: string | null
  customerId?: string | null
  customerName?: string | null
  state: ProjectState
  description?: string | null
  siteAddress?: string | null
  opportunityId?: string | null
}

export interface FileRecord extends ProjectBoundRecord {
  fileName: string
  artifactType: string
  contentType: string
  blobPath: string
  version: number
  sizeBytes?: number | null
  hash?: string | null
  uploadedBy: string
  uploadedAt: string
  briefingStatus?: FileStatus | null
}

export interface DrawingSet extends ProjectBoundRecord {
  title: string
  revisionLabel?: string | null
  issueDate?: string | null
  discipline?: string | null
  drawingSetCode?: string | null
}

export interface Sheet extends ProjectBoundRecord {
  drawingSetId: string
  sheetNumber: string
  sheetTitle: string
  discipline?: string | null
  revisionLabel?: string | null
  issueDate?: string | null
}

export interface TakeoffItem extends ProjectBoundRecord {
  drawingSetId?: string | null
  sheetId?: string | null
  detailRef?: string | null
  zoneRef?: string | null
  assemblyCode?: string | null
  description: string
  quantity: number
  unit: string
  wasteFactorPct?: number | null
  productionRate?: number | null
}

export interface Redline extends ProjectBoundRecord {
  drawingSetId?: string | null
  sheetId?: string | null
  regionRef?: string | null
  classification?: string | null
  title: string
  description?: string | null
  assignedTo?: string | null
  dueAt?: string | null
}

export interface RFI extends ProjectBoundRecord {
  number?: string | null
  drawingSetId?: string | null
  sheetId?: string | null
  redlineId?: string | null
  question: string
  suggestedResponse?: string | null
  officialResponse?: string | null
  dueAt?: string | null
  respondedAt?: string | null
}

export interface ChangeEvent extends ProjectBoundRecord {
  title: string
  description?: string | null
  originType?: string | null
  originId?: string | null
  scheduleImpactDays?: number | null
  costImpactAmount?: number | null
}

export interface ChangeOrder extends ProjectBoundRecord {
  number?: string | null
  changeEventId: string
  title: string
  amount: number
  scheduleImpactDays?: number | null
  approvalStatus?: string | null
}

export interface QCItem extends ProjectBoundRecord {
  category?: string | null
  locationRef?: string | null
  checklistRef?: string | null
  title: string
  description?: string | null
  assignedTo?: string | null
  dueAt?: string | null
}

export interface TrainingRecord extends BaseRecord {
  userId: string
  moduleId: string
  projectId?: string | null
  sourceActionId?: string | null
  progressPct?: number | null
  completedAt?: string | null
  score?: number | null
}

export interface Credential extends BaseRecord {
  userId: string
  name: string
  issuingAuthority?: string | null
  issuedAt?: string | null
  expiresAt?: string | null
  credentialNumber?: string | null
  trainingRecordId?: string | null
}

export interface RemediationLink extends BaseRecord {
  projectId?: string | null
  sourceObjectType: string
  sourceObjectId: string
  targetType: 'course' | 'module' | 'lesson' | 'checklist' | 'assessment'
  targetId: string
  rationale: string
}

export interface FeatureGateEvaluation extends BaseRecord {
  userId: string
  featureKey: string
  allowed: boolean
  rationale: string
  requiredCredentialIds?: string[]
  requiredTrainingRecordIds?: string[]
}

export interface AuricruxAction extends BaseRecord {
  mode: AuricruxMode
  targetObjectType: string
  targetObjectId: string
  rationale: string
  beforeSnapshotJson?: string | null
  afterSnapshotJson?: string | null
}

export interface AuditEvent extends BaseRecord {
  eventType: AuditEventType
  targetObjectType: string
  targetObjectId: string
  actorType: 'user' | 'auricrux' | 'system'
  actorId: string
  message: string
  metadataJson?: string | null
}
```

---

## File 3 â€” `src/lib/api/fcaApiTypes.ts`

```ts
export interface ApiSuccess<T> {
  ok: true
  data: T
  meta?: {
    requestId?: string
    timestamp?: string
    packet?: string
  }
}

export interface ApiError {
  ok: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResult<T> = ApiSuccess<T> | ApiError
```

---

## File 4 â€” `src/lib/contracts/fcaSchemas.ts`

```ts
import { z } from 'zod'
import {
  AUDIT_EVENT_TYPES,
  AURICRUX_MODES,
  FILE_STATUSES,
  PROJECT_STATES,
  RECORD_STATUSES,
  TRAINING_STATUSES,
} from './fcaEnums'

export const ProjectStateSchema = z.enum(PROJECT_STATES)
export const RecordStatusSchema = z.enum(RECORD_STATUSES)
export const FileStatusSchema = z.enum(FILE_STATUSES)
export const TrainingStatusSchema = z.enum(TRAINING_STATUSES)
export const AuricruxModeSchema = z.enum(AURICRUX_MODES)
export const AuditEventTypeSchema = z.enum(AUDIT_EVENT_TYPES)

export const StringArraySchema = z.array(z.string())

export const BaseRecordSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  status: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
  auricruxActionId: z.string().nullable().optional(),
  auditEventId: z.string().nullable().optional(),
})

export const ProjectBoundRecordSchema = BaseRecordSchema.extend({
  projectId: z.string().min(1),
  fileIds: StringArraySchema.optional(),
  sourceObjectIds: StringArraySchema.optional(),
  remediationLinkIds: StringArraySchema.optional(),
})

export const CreateProjectPayloadSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  description: z.string().optional(),
  siteAddress: z.string().optional(),
  opportunityId: z.string().optional(),
})

export const InitiateFileUploadPayloadSchema = z.object({
  fileName: z.string().min(1),
  artifactType: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().nonnegative().optional(),
})

export const CreateTakeoffItemPayloadSchema = z.object({
  drawingSetId: z.string().optional(),
  sheetId: z.string().optional(),
  detailRef: z.string().optional(),
  zoneRef: z.string().optional(),
  assemblyCode: z.string().optional(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  wasteFactorPct: z.number().min(0).max(100).optional(),
  productionRate: z.number().nonnegative().optional(),
  fileIds: StringArraySchema.optional(),
  sourceObjectIds: StringArraySchema.optional(),
})

export const CreateRFIPayloadSchema = z.object({
  number: z.string().optional(),
  drawingSetId: z.string().optional(),
  sheetId: z.string().optional(),
  redlineId: z.string().optional(),
  question: z.string().min(1),
  suggestedResponse: z.string().optional(),
  dueAt: z.string().optional(),
  fileIds: StringArraySchema.optional(),
  sourceObjectIds: StringArraySchema.optional(),
})

export const CreateRemediationLinkPayloadSchema = z.object({
  projectId: z.string().optional(),
  sourceObjectType: z.string().min(1),
  sourceObjectId: z.string().min(1),
  targetType: z.enum(['course', 'module', 'lesson', 'checklist', 'assessment']),
  targetId: z.string().min(1),
  rationale: z.string().min(1),
})

export const CreateAuricruxActionPayloadSchema = z.object({
  mode: AuricruxModeSchema,
  targetObjectType: z.string().min(1),
  targetObjectId: z.string().min(1),
  rationale: z.string().min(1),
  beforeSnapshotJson: z.string().optional(),
  afterSnapshotJson: z.string().optional(),
})
```

---

## File 5 â€” `api/_lib/contracts/fcaEnums.js`

```js
const PROJECT_STATES = [
  'lead',
  'qualified',
  'pre_design',
  'design',
  'cd',
  'bid',
  'permit',
  'build',
  'qa',
  'closeout',
  'warranty',
  'growth',
  'feedback',
]

const RECORD_STATUSES = [
  'draft',
  'open',
  'in_review',
  'approved',
  'resolved',
  'closed',
  'superseded',
  'archived',
]

const FILE_STATUSES = [
  'uploaded',
  'processing',
  'indexed',
  'briefed',
  'superseded',
  'archived',
]

const TRAINING_STATUSES = [
  'assigned',
  'in_progress',
  'passed',
  'failed',
  'issued',
  'expired',
  'revoked',
]

const AURICRUX_MODES = ['explain', 'recommend', 'execute', 'teach']

const AUDIT_EVENT_TYPES = [
  'create',
  'update',
  'delete',
  'state_transition',
  'file_upload',
  'file_version',
  'briefing_generated',
  'remediation_linked',
  'feature_gate_evaluated',
  'auricrux_action',
]

module.exports = {
  PROJECT_STATES,
  RECORD_STATUSES,
  FILE_STATUSES,
  TRAINING_STATUSES,
  AURICRUX_MODES,
  AUDIT_EVENT_TYPES,
}
```

---

## File 6 â€” `api/_lib/contracts/fcaContracts.js`

```js
function makeApiSuccess(data, meta = {}) {
  return {
    ok: true,
    data,
    meta,
  }
}

function makeApiError(code, message, details) {
  return {
    ok: false,
    error: {
      code,
      message,
      details,
    },
  }
}

module.exports = {
  makeApiSuccess,
  makeApiError,
}
```

---

## File 7 â€” `api/_lib/validation/fcaSchemas.js`

```js
const { z } = require('zod')
const {
  PROJECT_STATES,
  RECORD_STATUSES,
  FILE_STATUSES,
  TRAINING_STATUSES,
  AURICRUX_MODES,
  AUDIT_EVENT_TYPES,
} = require('../contracts/fcaEnums')

const ProjectStateSchema = z.enum(PROJECT_STATES)
const RecordStatusSchema = z.enum(RECORD_STATUSES)
const FileStatusSchema = z.enum(FILE_STATUSES)
const TrainingStatusSchema = z.enum(TRAINING_STATUSES)
const AuricruxModeSchema = z.enum(AURICRUX_MODES)
const AuditEventTypeSchema = z.enum(AUDIT_EVENT_TYPES)

const StringArraySchema = z.array(z.string())

const CreateProjectPayloadSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  description: z.string().optional(),
  siteAddress: z.string().optional(),
  opportunityId: z.string().optional(),
})

const InitiateFileUploadPayloadSchema = z.object({
  fileName: z.string().min(1),
  artifactType: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().nonnegative().optional(),
})

const CreateTakeoffItemPayloadSchema = z.object({
  drawingSetId: z.string().optional(),
  sheetId: z.string().optional(),
  detailRef: z.string().optional(),
  zoneRef: z.string().optional(),
  assemblyCode: z.string().optional(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  wasteFactorPct: z.number().min(0).max(100).optional(),
  productionRate: z.number().nonnegative().optional(),
  fileIds: StringArraySchema.optional(),
  sourceObjectIds: StringArraySchema.optional(),
})

const CreateRFIPayloadSchema = z.object({
  number: z.string().optional(),
  drawingSetId: z.string().optional(),
  sheetId: z.string().optional(),
  redlineId: z.string().optional(),
  question: z.string().min(1),
  suggestedResponse: z.string().optional(),
  dueAt: z.string().optional(),
  fileIds: StringArraySchema.optional(),
  sourceObjectIds: StringArraySchema.optional(),
})

const CreateRemediationLinkPayloadSchema = z.object({
  projectId: z.string().optional(),
  sourceObjectType: z.string().min(1),
  sourceObjectId: z.string().min(1),
  targetType: z.enum(['course', 'module', 'lesson', 'checklist', 'assessment']),
  targetId: z.string().min(1),
  rationale: z.string().min(1),
})

const CreateAuricruxActionPayloadSchema = z.object({
  mode: AuricruxModeSchema,
  targetObjectType: z.string().min(1),
  targetObjectId: z.string().min(1),
  rationale: z.string().min(1),
  beforeSnapshotJson: z.string().optional(),
  afterSnapshotJson: z.string().optional(),
})

module.exports = {
  ProjectStateSchema,
  RecordStatusSchema,
  FileStatusSchema,
  TrainingStatusSchema,
  AuricruxModeSchema,
  AuditEventTypeSchema,
  StringArraySchema,
  CreateProjectPayloadSchema,
  InitiateFileUploadPayloadSchema,
  CreateTakeoffItemPayloadSchema,
  CreateRFIPayloadSchema,
  CreateRemediationLinkPayloadSchema,
  CreateAuricruxActionPayloadSchema,
}
```

---

## File 8 â€” `api/_lib/validation/assertValid.js`

```js
function assertValid(schema, payload) {
  const result = schema.safeParse(payload)

  if (!result.success) {
    const error = new Error('Validation failed')
    error.statusCode = 400
    error.code = 'VALIDATION_FAILED'
    error.details = result.error.flatten()
    throw error
  }

  return result.data
}

module.exports = {
  assertValid,
}
```

---

## Validation Commands

```bash
npm install
npm run lint
npm run build
```

If build scripts differ, minimum required checks remain:
- import integrity
- lint pass
- production build pass

---

## Non-Regression Rules

- Do not rename existing packet files.
- Do not split shared enums into separate SaaS/LMS copies.
- Do not add alternate contract filenames for the same objects.
- Do not claim route completion from contract-file creation alone.

---

## Acceptance Criteria

`052J` is complete only if:
- exact content exists for the first contract files
- exact content exists for the first validation files
- frontend/backend contract naming is aligned
- validation commands are stated
- non-regression rules are stated
- the next packet can build route stubs from these files directly

---

## Next Packet

`052K = First Route Stub Packet`

Must deliver exact code for:
- `api/projects/index.js`
- `api/projects/[projectId].js`
- `api/projects/[projectId]/takeoffs/index.js`
- `api/projects/[projectId]/rfis/index.js`
- `api/auricrux/actions/index.js`

---

## Progress Lock

- Current packet: `052J`
- Next packet: `052K`
- Target packet: `060A`
- Save-after-every-prompt rule remains active
