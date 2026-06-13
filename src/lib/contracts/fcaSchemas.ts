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
