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
