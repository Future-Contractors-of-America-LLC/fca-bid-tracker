const {
  persistenceEnabled,
  loadCollection,
  saveCollection,
} = require("../persistence/fcaRuntimeTableStore.cjs");

const STORE_KEY = "__FCA_RUNTIME_SPINE_STORE__";
let hydratePromise = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function seedStore() {
  return {
    projects: [
      {
        id: "PRJ-001",
        name: "Launch Demo Project",
        code: "LDP-001",
        customerId: "CUST-FCA-LAUNCH-001",
        customerName: "Future Contractors of America Launch Customer",
        description: "Canonical project spine launch workspace.",
        siteAddress: "100 Contractor Way, Richmond, VA",
        opportunityId: "BID-001",
        state: "qualified",
        recordStatus: "open",
        auditEventCount: 2,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ],
    takeoffs: [
      {
        id: "TKO-001",
        projectId: "PRJ-001",
        drawingSetId: "DS-001",
        sheetId: "A1.1",
        detailRef: "Lobby-01",
        zoneRef: "Level-1",
        assemblyCode: "DIV09",
        description: "Lobby wall finish takeoff",
        quantity: 128,
        unit: "SF",
        wasteFactorPct: 8,
        productionRate: 42,
        fileIds: ["FILE-001"],
        sourceObjectIds: ["PRJ-001"],
        recordStatus: "open",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ],
    rfis: [
      {
        id: "RFI-001",
        projectId: "PRJ-001",
        number: "RFI-001",
        drawingSetId: "DS-001",
        sheetId: "A1.1",
        redlineId: "RED-001",
        question: "Confirm lobby wall finish transition at ceiling edge.",
        suggestedResponse: "Architect to confirm detail condition.",
        dueAt: null,
        fileIds: ["FILE-001"],
        sourceObjectIds: ["PRJ-001"],
        recordStatus: "open",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ],
  };
}

function getMemoryStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = seedStore();
  }
  return globalThis[STORE_KEY];
}

async function ensureStore() {
  if (hydratePromise) {
    await hydratePromise;
    return getMemoryStore();
  }

  hydratePromise = (async () => {
    if (!persistenceEnabled()) return;

    const [projects, takeoffs, rfis] = await Promise.all([
      loadCollection("projects"),
      loadCollection("takeoffs"),
      loadCollection("rfis"),
    ]);

    if (projects || takeoffs || rfis) {
      globalThis[STORE_KEY] = {
        projects: projects || [],
        takeoffs: takeoffs || [],
        rfis: rfis || [],
      };
      return;
    }

    const seeded = seedStore();
    globalThis[STORE_KEY] = seeded;
    await Promise.all([
      saveCollection("projects", seeded.projects),
      saveCollection("takeoffs", seeded.takeoffs),
      saveCollection("rfis", seeded.rfis),
    ]);
  })();

  await hydratePromise;
  return getMemoryStore();
}

function schedulePersist(store) {
  if (!persistenceEnabled()) return;
  setTimeout(() => {
    Promise.all([
      saveCollection("projects", store.projects),
      saveCollection("takeoffs", store.takeoffs),
      saveCollection("rfis", store.rfis),
    ]).catch(() => {});
  }, 200);
}

function backingSource() {
  return persistenceEnabled() ? "fca-runtime-table" : "fca-runtime-memory";
}

async function listProjects() {
  const store = await ensureStore();
  return clone(store.projects);
}

async function getProject(projectId) {
  const store = await ensureStore();
  const item = store.projects.find((project) => project.id === projectId);
  return item ? clone(item) : null;
}

async function createProject(payload) {
  const store = await ensureStore();
  const item = {
    id: payload.id || `PRJ-${Date.now()}`,
    name: payload.name,
    code: payload.code || null,
    customerId: payload.customerId || null,
    customerName: payload.customerName || null,
    description: payload.description || null,
    siteAddress: payload.siteAddress || null,
    opportunityId: payload.opportunityId || null,
    state: "lead",
    recordStatus: "open",
    auditEventCount: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  store.projects.unshift(item);
  schedulePersist(store);
  return clone(item);
}

async function updateProject(projectId, patch = {}) {
  const store = await ensureStore();
  const index = store.projects.findIndex((project) => project.id === projectId);
  if (index === -1) return null;

  const current = store.projects[index];
  const updated = {
    ...current,
    ...patch,
    id: current.id,
    updatedAt: nowIso(),
  };

  store.projects[index] = updated;
  schedulePersist(store);
  return clone(updated);
}

async function listTakeoffs(projectId) {
  const store = await ensureStore();
  return clone(store.takeoffs.filter((item) => item.projectId === projectId));
}

async function createTakeoff(projectId, payload) {
  const store = await ensureStore();
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
    recordStatus: "open",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  store.takeoffs.unshift(item);
  schedulePersist(store);
  return clone(item);
}

async function listRFIs(projectId) {
  const store = await ensureStore();
  return clone(store.rfis.filter((item) => item.projectId === projectId));
}

async function createRFI(projectId, payload) {
  const store = await ensureStore();
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
    recordStatus: "open",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  store.rfis.unshift(item);
  schedulePersist(store);
  return clone(item);
}

module.exports = {
  backingSource,
  listProjects,
  getProject,
  createProject,
  updateProject,
  listTakeoffs,
  createTakeoff,
  listRFIs,
  createRFI,
};
