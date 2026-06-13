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
