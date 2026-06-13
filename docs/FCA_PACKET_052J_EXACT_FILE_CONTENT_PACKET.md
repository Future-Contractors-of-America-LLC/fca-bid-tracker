# FCA_PACKET_052J_EXACT_FILE_CONTENT_PACKET

Status: Active
Classification: Binding implementation packet
Repository: `Future-Contractors-of-America-LLC/fca-bid-tracker`
Current Packet: `052J`
Next Packet: `052K`
Target Packet: `060A`

---

## Issue

`052I` fixed the file map and apply order.
`052J` now supplies exact starter file contents for the first canonical contract layer, validation layer, and initial route stubs so repo execution can begin without ambiguity.

---

## Truth Boundary

This packet provides exact file contents intended for repository application.

It does **not** claim:
- these files are already applied as live repo code
- these stubs satisfy final production acceptance
- route business logic is complete
- deploy/runtime validation has passed

It **does** provide exact repo-ready starter contents for the first code application wave.

---

## 1. File: `src/lib/contracts/fcaEnums.ts`

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

## 2. File: `src/types/fca-contracts.ts`

```ts
import type {
  AuditEventType,
  AuricruxMode,
  FileStatus,
  ProjectState,
  RecordStatus,
} from '../lib/contracts/fcaEnums'

export interface BaseRecord {
  id: string
  tenantId: string
  status: RecordStatus | string
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

## 3. File: `src/lib/contracts/fcaSchemas.ts`

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

export const RecordStatusSchema = z.enum(RECORD_STATUSES)
export const ProjectStateSchema = z.enum(PROJECT_STATES)
export const FileStatusSchema = z.enum(FILE_STATUSES)
export const TrainingStatusSchema = z.enum(TRAINING_STATUSES)
export const AuricruxModeSchema = z.enum(AURICRUX_MODES)
export const AuditEventTypeSchema = z.enum(AUDIT_EVENT_TYPES)

export const StringArraySchema = z.array(z.string()).default([])

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
  sizeBytes: z.number().int().nonnegative().optional(),
})

export const CompleteFileUploadPayloadSchema = z.object({
  fileId: z.string().min(1),
  blobPath: z.string().min(1),
  hash: z.string().optional(),
  version: z.number().int().min(1),
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

## 4. File: `api/_lib/contracts/fcaEnums.js`

```js
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
]

export const RECORD_STATUSES = [
  'draft',
  'open',
  'in_review',
  'approved',
  'resolved',
  'closed',
  'superseded',
  'archived',
]

export const FILE_STATUSES = [
  'uploaded',
  'processing',
  'indexed',
  'briefed',
  'superseded',
  'archived',
]

export const TRAINING_STATUSES = [
  'assigned',
  'in_progress',
  'passed',
  'failed',
  'issued',
  'expired',
  'revoked',
]

export const AURICRUX_MODES = ['explain', 'recommend', 'execute', 'teach']

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
]
```

---

## 5. File: `api/_lib/contracts/fcaContracts.js`

```js
export function makeApiSuccess(data, meta = {}) {
  return {
    ok: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }
}

export function makeApiError(code, message, details = undefined) {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  }
}
```

---

## 6. File: `api/_lib/validation/fcaSchemas.js`

```js
import { z } from 'zod'
import {
  AUDIT_EVENT_TYPES,
  AURICRUX_MODES,
  FILE_STATUSES,
  PROJECT_STATES,
  RECORD_STATUSES,
  TRAINING_STATUSES,
} from '../contracts/fcaEnums.js'

export const RecordStatusSchema = z.enum(RECORD_STATUSES)
export const ProjectStateSchema = z.enum(PROJECT_STATES)
export const FileStatusSchema = z.enum(FILE_STATUSES)
export const TrainingStatusSchema = z.enum(TRAINING_STATUSES)
export const AuricruxModeSchema = z.enum(AURICRUX_MODES)
export const AuditEventTypeSchema = z.enum(AUDIT_EVENT_TYPES)

export const StringArraySchema = z.array(z.string()).default([])

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
  sizeBytes: z.number().int().nonnegative().optional(),
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

## 7. File: `api/_lib/validation/assertValid.js`

```js
export function assertValid(schema, payload) {
  const result = schema.safeParse(payload)

  if (!result.success) {
    const details = result.error.flatten()
    const error = new Error('Payload validation failed')
    error.statusCode = 400
    error.code = 'INVALID_PAYLOAD'
    error.details = details
    throw error
  }

  return result.data
}
```

---

## 8. File: `api/projects/index.js`

```js
import { CreateProjectPayloadSchema } from '../_lib/validation/fcaSchemas.js'
import { assertValid } from '../_lib/validation/assertValid.js'
import { makeApiError, makeApiSuccess } from '../_lib/contracts/fcaContracts.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(
      makeApiSuccess(
        {
          route: '/api/projects',
          items: [],
          notYetImplemented: true,
        },
        { packet: '052J' },
      ),
    )
  }

  if (req.method === 'POST') {
    try {
      const payload = assertValid(CreateProjectPayloadSchema, req.body ?? {})

      return res.status(202).json(
        makeApiSuccess(
          {
            route: '/api/projects',
            acceptedPayload: payload,
            notYetImplemented: true,
          },
          { packet: '052J' },
        ),
      )
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        makeApiError(error.code || 'UNHANDLED_ERROR', error.message, error.details),
      )
    }
  }

  return res.status(405).json(makeApiError('METHOD_NOT_ALLOWED', 'Method not allowed'))
}
```

---

## 9. File: `api/projects/[projectId]/takeoffs/index.js`

```js
import { CreateTakeoffItemPayloadSchema } from '../../../../_lib/validation/fcaSchemas.js'
import { assertValid } from '../../../../_lib/validation/assertValid.js'
import { makeApiError, makeApiSuccess } from '../../../../_lib/contracts/fcaContracts.js'

export default async function handler(req, res) {
  const { projectId } = req.query

  if (!projectId) {
    return res.status(400).json(makeApiError('MISSING_PROJECT_ID', 'projectId is required'))
  }

  if (req.method === 'GET') {
    return res.status(200).json(
      makeApiSuccess(
        {
          route: `/api/projects/${projectId}/takeoffs`,
          items: [],
          notYetImplemented: true,
        },
        { packet: '052J' },
      ),
    )
  }

  if (req.method === 'POST') {
    try {
      const payload = assertValid(CreateTakeoffItemPayloadSchema, req.body ?? {})

      return res.status(202).json(
        makeApiSuccess(
          {
            route: `/api/projects/${projectId}/takeoffs`,
            projectId,
            acceptedPayload: payload,
            notYetImplemented: true,
          },
          { packet: '052J' },
        ),
      )
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        makeApiError(error.code || 'UNHANDLED_ERROR', error.message, error.details),
      )
    }
  }

  return res.status(405).json(makeApiError('METHOD_NOT_ALLOWED', 'Method not allowed'))
}
```

---

## 10. File: `api/projects/[projectId]/rfis/index.js`

```js
import { CreateRFIPayloadSchema } from '../../../../_lib/validation/fcaSchemas.js'
import { assertValid } from '../../../../_lib/validation/assertValid.js'
import { makeApiError, makeApiSuccess } from '../../../../_lib/contracts/fcaContracts.js'

export default async function handler(req, res) {
  const { projectId } = req.query

  if (!projectId) {
    return res.status(400).json(makeApiError('MISSING_PROJECT_ID', 'projectId is required'))
  }

  if (req.method === 'GET') {
    return res.status(200).json(
      makeApiSuccess(
        {
          route: `/api/projects/${projectId}/rfis`,
          items: [],
          notYetImplemented: true,
        },
        { packet: '052J' },
      ),
    )
  }

  if (req.method === 'POST') {
    try {
      const payload = assertValid(CreateRFIPayloadSchema, req.body ?? {})

      return res.status(202).json(
        makeApiSuccess(
          {
            route: `/api/projects/${projectId}/rfis`,
            projectId,
            acceptedPayload: payload,
            notYetImplemented: true,
          },
          { packet: '052J' },
        ),
      )
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        makeApiError(error.code || 'UNHANDLED_ERROR', error.message, error.details),
      )
    }
  }

  return res.status(405).json(makeApiError('METHOD_NOT_ALLOWED', 'Method not allowed'))
}
```

---

## 11. File: `api/projects/[projectId]/remediation-links/index.js`

```js
import { CreateRemediationLinkPayloadSchema } from '../../../../_lib/validation/fcaSchemas.js'
import { assertValid } from '../../../../_lib/validation/assertValid.js'
import { makeApiError, makeApiSuccess } from '../../../../_lib/contracts/fcaContracts.js'

export default async function handler(req, res) {
  const { projectId } = req.query

  if (!projectId) {
    return res.status(400).json(makeApiError('MISSING_PROJECT_ID', 'projectId is required'))
  }

  if (req.method === 'GET') {
    return res.status(200).json(
      makeApiSuccess(
        {
          route: `/api/projects/${projectId}/remediation-links`,
          items: [],
          notYetImplemented: true,
        },
        { packet: '052J' },
      ),
    )
  }

  if (req.method === 'POST') {
    try {
      const payload = assertValid(CreateRemediationLinkPayloadSchema, req.body ?? {})

      return res.status(202).json(
        makeApiSuccess(
          {
            route: `/api/projects/${projectId}/remediation-links`,
            projectId,
            acceptedPayload: payload,
            notYetImplemented: true,
          },
          { packet: '052J' },
        ),
      )
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        makeApiError(error.code || 'UNHANDLED_ERROR', error.message, error.details),
      )
    }
  }

  return res.status(405).json(makeApiError('METHOD_NOT_ALLOWED', 'Method not allowed'))
}
```

---

## 12. File: `api/auricrux/actions/index.js`

```js
import { CreateAuricruxActionPayloadSchema } from '../../../_lib/validation/fcaSchemas.js'
import { assertValid } from '../../../_lib/validation/assertValid.js'
import { makeApiError, makeApiSuccess } from '../../../_lib/contracts/fcaContracts.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json(makeApiError('METHOD_NOT_ALLOWED', 'Method not allowed'))
  }

  try {
    const payload = assertValid(CreateAuricruxActionPayloadSchema, req.body ?? {})

    return res.status(202).json(
      makeApiSuccess(
        {
          route: '/api/auricrux/actions',
          acceptedPayload: payload,
          notYetImplemented: true,
        },
        { packet: '052J' },
      ),
    )
  } catch (error) {
    return res.status(error.statusCode || 500).json(
      makeApiError(error.code || 'UNHANDLED_ERROR', error.message, error.details),
    )
  }
}
```

---

## 13. Apply Order

1. apply `src/lib/contracts/fcaEnums.ts`
2. apply `src/types/fca-contracts.ts`
3. apply `src/lib/contracts/fcaSchemas.ts`
4. apply `api/_lib/contracts/fcaEnums.js`
5. apply `api/_lib/contracts/fcaContracts.js`
6. apply `api/_lib/validation/fcaSchemas.js`
7. apply `api/_lib/validation/assertValid.js`
8. apply route stubs
9. run validation

---

## 14. Validation Commands

```bash
npm install
npm run lint
npm run build
```

Minimum route smoke checks next step:
- import success for `api/projects/index.js`
- import success for `api/projects/[projectId]/takeoffs/index.js`
- import success for `api/projects/[projectId]/rfis/index.js`
- import success for `api/projects/[projectId]/remediation-links/index.js`
- import success for `api/auricrux/actions/index.js`

---

## 15. Acceptance Criteria

`052J` is complete only if:
- exact file contents exist for first shared contract layer
- exact file contents exist for first validation layer
- exact file contents exist for first route stubs
- apply order is fixed
- validation commands are fixed
- no naming drift remains between schema packet and file-content packet

---

## 16. Next Packet

`052K = Code Apply and Non-Regression Patch Packet`

Must deliver:
- exact repo patch plan against current tree
- file replacement vs file creation classification
- import-path verification notes
- compatibility notes with current bid tracker structure
- commit batch order

---

## Progress Lock

- Current packet: `052J`
- Next packet: `052K`
- Target packet: `060A`
- Save-after-every-prompt rule remains active
