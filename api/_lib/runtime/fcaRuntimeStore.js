const STORE_KEY = '__FCA_RUNTIME_SPINE_STORE__'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function nowIso() {
  return new Date().toISOString()
}

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = {
      projects: [
        {
          id: 'PRJ-001',
          name: 'Launch Demo Project',
          code: 'LDP-001',
          customerId: 'CUST-FCA-LAUNCH-001',
          customerName: 'Future Contractors of America Launch Customer',
          description: 'Canonical project spine launch workspace.',
          siteAddress: '100 Contractor Way, Richmond, VA',
          opportunityId: 'BID-001',
          state: 'qualified',
          recordStatus: 'open',
          auditEventCount: 2,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ],
      takeoffs: [
        {
          id: 'TKO-001',
          projectId: 'PRJ-001',
          drawingSetId: 'DS-001',
          sheetId: 'A1.1',
          detailRef: 'Lobby-01',
          zoneRef: 'Level-1',
          assemblyCode: 'DIV09',
          description: 'Lobby wall finish takeoff',
          quantity: 128,
          unit: 'SF',
          wasteFactorPct: 8,
          productionRate: 42,
          fileIds: ['FILE-001'],
          sourceObjectIds: ['PRJ-001'],
          recordStatus: 'open',
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ],
      rfis: [
        {
          id: 'RFI-001',
          projectId: 'PRJ-001',
          number: 'RFI-001',
          drawingSetId: 'DS-001',
          sheetId: 'A1.1',
          redlineId: 'RED-001',
          question: 'Confirm lobby wall finish transition at ceiling edge.',
          suggestedResponse: 'Architect to confirm detail condition.',
          dueAt: null,
          fileIds: ['FILE-001'],
          sourceObjectIds: ['PRJ-001'],
          recordStatus: 'open',
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ],
    }
  }

  return globalThis[STORE_KEY]
}

function listProjects() {
  return clone(getStore().projects)
}

function getProject(projectId) {
  const item = getStore().projects.find((project) => project.id === projectId)
  return item ? clone(item) : null
}

function createProject(payload) {
  const store = getStore()
  const item = {
    id: payload.id || `PRJ-${Date.now()}`,
    name: payload.name,
    code: payload.code || null,
    customerId: payload.customerId || null,
    customerName: payload.customerName || null,
    description: payload.description || null,
    siteAddress: payload.siteAddress || null,
    opportunityId: payload.opportunityId || null,
    state: 'lead',
    recordStatus: 'open',
    auditEventCount: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  store.projects.unshift(item)
  return clone(item)
}

function updateProject(projectId, patch = {}) {
  const store = getStore()
  const index = store.projects.findIndex((project) => project.id === projectId)
  if (index === -1) {
    return null
  }

  const current = store.projects[index]
  const updated = {
    ...current,
    ...patch,
    id: current.id,
    updatedAt: nowIso(),
  }

  store.projects[index] = updated
  return clone(updated)
}

function listTakeoffs(projectId) {
  return clone(getStore().takeoffs.filter((item) => item.projectId === projectId))
}

function createTakeoff(projectId, payload) {
  const store = getStore()
  const item = {
    id: `TKO-${Date.now()}`,
    projectId,
    drawingSetId: payload.drawingSetId || null,
    sheetId: payload.sheetId || null,
    detailRef: payload.detailRef || null,
    zoneRef: payload.zoneRef || null,
    assemblyCode: payload.assemblyCode || null,
    description: payload.description,
    quantity: payload.quantity,
    unit: payload.unit,
    wasteFactorPct: payload.wasteFactorPct ?? null,
    productionRate: payload.productionRate ?? null,
    fileIds: payload.fileIds || [],
    sourceObjectIds: payload.sourceObjectIds || [],
    recordStatus: 'open',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  store.takeoffs.unshift(item)
  return clone(item)
}

function listRFIs(projectId) {
  return clone(getStore().rfis.filter((item) => item.projectId === projectId))
}

function createRFI(projectId, payload) {
  const store = getStore()
  const item = {
    id: `RFI-${Date.now()}`,
    projectId,
    number: payload.number || `RFI-${store.rfis.length + 1}`,
    drawingSetId: payload.drawingSetId || null,
    sheetId: payload.sheetId || null,
    redlineId: payload.redlineId || null,
    question: payload.question,
    suggestedResponse: payload.suggestedResponse || null,
    dueAt: payload.dueAt || null,
    fileIds: payload.fileIds || [],
    sourceObjectIds: payload.sourceObjectIds || [],
    recordStatus: 'open',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  store.rfis.unshift(item)
  return clone(item)
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  listTakeoffs,
  createTakeoff,
  listRFIs,
  createRFI,
}
