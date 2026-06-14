const {
  PROJECT_STATES,
  RECORD_STATUSES,
  FILE_STATUSES,
  TRAINING_STATUSES,
  AURICRUX_MODES,
  AUDIT_EVENT_TYPES,
} = require('../contracts/fcaEnums')

function issue(path, message) {
  return { path: Array.isArray(path) ? path : [path], message }
}

function success(data) {
  return {
    success: true,
    data,
  }
}

function failure(issues) {
  return {
    success: false,
    error: {
      flatten() {
        const fieldErrors = {}
        for (const entry of issues) {
          const key = Array.isArray(entry.path) ? entry.path.join('.') : String(entry.path || '')
          if (!fieldErrors[key]) {
            fieldErrors[key] = []
          }
          fieldErrors[key].push(entry.message)
        }
        return {
          formErrors: [],
          fieldErrors,
        }
      },
    },
  }
}

function validateString(value, field, { min = 0, optional = false } = {}) {
  if (value === undefined || value === null) {
    return optional ? [] : [issue(field, `${field} is required`)]
  }
  if (typeof value !== 'string') {
    return [issue(field, `${field} must be a string`)]
  }
  if (value.length < min) {
    return [issue(field, `${field} must be at least ${min} character${min === 1 ? '' : 's'}`)]
  }
  return []
}

function validateNumber(value, field, { positive = false, nonnegative = false, min, max, optional = false } = {}) {
  if (value === undefined || value === null) {
    return optional ? [] : [issue(field, `${field} is required`)]
  }
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return [issue(field, `${field} must be a number`)]
  }
  if (positive && !(value > 0)) {
    return [issue(field, `${field} must be greater than 0`)]
  }
  if (nonnegative && value < 0) {
    return [issue(field, `${field} must be greater than or equal to 0`)]
  }
  if (typeof min === 'number' && value < min) {
    return [issue(field, `${field} must be greater than or equal to ${min}`)]
  }
  if (typeof max === 'number' && value > max) {
    return [issue(field, `${field} must be less than or equal to ${max}`)]
  }
  return []
}

function validateStringArray(value, field, { optional = false } = {}) {
  if (value === undefined || value === null) {
    return optional ? [] : [issue(field, `${field} is required`)]
  }
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    return [issue(field, `${field} must be an array of strings`)]
  }
  return []
}

function validateEnum(value, field, values, { optional = false } = {}) {
  if (value === undefined || value === null) {
    return optional ? [] : [issue(field, `${field} is required`)]
  }
  if (!values.includes(value)) {
    return [issue(field, `${field} must be one of: ${values.join(', ')}`)]
  }
  return []
}

function createSchema(validator) {
  return {
    safeParse(payload) {
      const normalized = payload && typeof payload === 'object' ? payload : {}
      const issues = validator(normalized)
      return issues.length === 0 ? success(normalized) : failure(issues)
    },
  }
}

const ProjectStateSchema = { values: PROJECT_STATES }
const RecordStatusSchema = { values: RECORD_STATUSES }
const FileStatusSchema = { values: FILE_STATUSES }
const TrainingStatusSchema = { values: TRAINING_STATUSES }
const AuricruxModeSchema = { values: AURICRUX_MODES }
const AuditEventTypeSchema = { values: AUDIT_EVENT_TYPES }
const StringArraySchema = { type: 'string-array' }

const CreateProjectPayloadSchema = createSchema((payload) => [
  ...validateString(payload.name, 'name', { min: 1 }),
  ...validateString(payload.code, 'code', { optional: true }),
  ...validateString(payload.customerId, 'customerId', { optional: true }),
  ...validateString(payload.customerName, 'customerName', { optional: true }),
  ...validateString(payload.description, 'description', { optional: true }),
  ...validateString(payload.siteAddress, 'siteAddress', { optional: true }),
  ...validateString(payload.opportunityId, 'opportunityId', { optional: true }),
])

const InitiateFileUploadPayloadSchema = createSchema((payload) => [
  ...validateString(payload.fileName, 'fileName', { min: 1 }),
  ...validateString(payload.artifactType, 'artifactType', { min: 1 }),
  ...validateString(payload.contentType, 'contentType', { min: 1 }),
  ...validateNumber(payload.sizeBytes, 'sizeBytes', { nonnegative: true, optional: true }),
])

const CreateTakeoffItemPayloadSchema = createSchema((payload) => [
  ...validateString(payload.drawingSetId, 'drawingSetId', { optional: true }),
  ...validateString(payload.sheetId, 'sheetId', { optional: true }),
  ...validateString(payload.detailRef, 'detailRef', { optional: true }),
  ...validateString(payload.zoneRef, 'zoneRef', { optional: true }),
  ...validateString(payload.assemblyCode, 'assemblyCode', { optional: true }),
  ...validateString(payload.description, 'description', { min: 1 }),
  ...validateNumber(payload.quantity, 'quantity', { positive: true }),
  ...validateString(payload.unit, 'unit', { min: 1 }),
  ...validateNumber(payload.wasteFactorPct, 'wasteFactorPct', { min: 0, max: 100, optional: true }),
  ...validateNumber(payload.productionRate, 'productionRate', { nonnegative: true, optional: true }),
  ...validateStringArray(payload.fileIds, 'fileIds', { optional: true }),
  ...validateStringArray(payload.sourceObjectIds, 'sourceObjectIds', { optional: true }),
])

const CreateRFIPayloadSchema = createSchema((payload) => [
  ...validateString(payload.number, 'number', { optional: true }),
  ...validateString(payload.drawingSetId, 'drawingSetId', { optional: true }),
  ...validateString(payload.sheetId, 'sheetId', { optional: true }),
  ...validateString(payload.redlineId, 'redlineId', { optional: true }),
  ...validateString(payload.question, 'question', { min: 1 }),
  ...validateString(payload.suggestedResponse, 'suggestedResponse', { optional: true }),
  ...validateString(payload.dueAt, 'dueAt', { optional: true }),
  ...validateStringArray(payload.fileIds, 'fileIds', { optional: true }),
  ...validateStringArray(payload.sourceObjectIds, 'sourceObjectIds', { optional: true }),
])

const CreateRemediationLinkPayloadSchema = createSchema((payload) => [
  ...validateString(payload.projectId, 'projectId', { optional: true }),
  ...validateString(payload.sourceObjectType, 'sourceObjectType', { min: 1 }),
  ...validateString(payload.sourceObjectId, 'sourceObjectId', { min: 1 }),
  ...validateEnum(payload.targetType, 'targetType', ['course', 'module', 'lesson', 'checklist', 'assessment']),
  ...validateString(payload.targetId, 'targetId', { min: 1 }),
  ...validateString(payload.rationale, 'rationale', { min: 1 }),
])

const CreateAuricruxActionPayloadSchema = createSchema((payload) => [
  ...validateEnum(payload.mode, 'mode', AURICRUX_MODES),
  ...validateString(payload.targetObjectType, 'targetObjectType', { min: 1 }),
  ...validateString(payload.targetObjectId, 'targetObjectId', { min: 1 }),
  ...validateString(payload.rationale, 'rationale', { min: 1 }),
  ...validateString(payload.beforeSnapshotJson, 'beforeSnapshotJson', { optional: true }),
  ...validateString(payload.afterSnapshotJson, 'afterSnapshotJson', { optional: true }),
])

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
