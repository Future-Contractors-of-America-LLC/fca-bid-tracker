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
