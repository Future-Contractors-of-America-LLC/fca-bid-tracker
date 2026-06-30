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

    // Fix: partial-hydrate data loss guard.
    // All three collections must be present (non-null) to trust Table data.
    // If any one load returns null (404 or load failure), fall through to seed
    // so we never compose a store with live data in one collection and an
    // empty array in another — which schedulePersist would then write back,
    // silently wiping the live rows.
    if (projects !== null && takeoffs !== null && rfis !== null) {
      globalThis[STORE_KEY] = { projects, takeoffs, rfis };
      return;
    }

    // Table is empty or partially bootstrapped — seed and persist all.
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

// Fix: per-collection persist — saves only the changed collection so concurrent
// workers on scaled SWA instances cannot overwrite each other's collections.
// Awaited by callers so responses are only returned after Table write succeeds
// (resolves both the 202-before-persist and stale-debounced-write issues).
async function persistCollection(collectionName, items) {
  if (!persistenceEnabled()) return;
  try {
    await saveCollection(collectionName, items);
  } catch (error) {
    // Log but do not throw — memory is authoritative for the current request;
    // Table divergence is surfaced in logs rather than silently ignored.
    console.warn(`fcaRuntimeStore: persist failed for ${collectionName}`, error?.message || error);
  }
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
  await persistCollection("projects", store.projects);
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
  await persistCollection("projects", store.projects);
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
  await persistCollection("takeoffs", store.takeoffs);
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
  await persistCollection("rfis", store.rfis);
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
