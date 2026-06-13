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
