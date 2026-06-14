import { listProjects } from "./workflow-store.js";

const STORE_KEY = "__FCA_WARRANTY_AND_CLOSEOUT_STORE__";
const DEFAULT_TENANT_ID = "TEN-FCA-001";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = { tenants: {} };
  }
  return globalThis[STORE_KEY];
}

function seedTenantState(tenantId) {
  const projects = listProjects(tenantId);
  const primaryProjectId = projects[0]?.id || "PRJ-001";

  return {
    closeoutPackages: [
      {
        closeoutPackageId: "CLO-001",
        projectId: primaryProjectId,
        title: "Launch Demo Project Closeout Binder",
        status: "in_progress",
        requiredArtifacts: ["O&M Manuals", "As-Builts", "Warranty Matrix", "Punch Completion Letter"],
        completedArtifacts: ["O&M Manuals"],
        responsibleParty: "Auricrux",
        nextAction: "Complete warranty matrix and as-built validation.",
        updatedAt: nowIso(),
      },
    ],
    warrantyCases: [
      {
        warrantyCaseId: "WAR-001",
        projectId: primaryProjectId,
        title: "Lobby finish touch-up request",
        status: "open",
        severity: "standard",
        requester: "Future Contractors of America Launch Customer",
        issueType: "finish-defect",
        description: "Customer requested touch-up at lobby wall finish transition.",
        dueAt: null,
        updatedAt: nowIso(),
      },
    ],
    updatedAt: nowIso(),
  };
}

function getTenantState(tenantId = DEFAULT_TENANT_ID) {
  const store = getStore();
  const key = tenantId || DEFAULT_TENANT_ID;
  if (!store.tenants[key]) {
    store.tenants[key] = seedTenantState(key);
  }
  return store.tenants[key];
}

export function listCloseoutPackages(tenantId, projectId = null) {
  const state = getTenantState(tenantId);
  return clone(state.closeoutPackages.filter((item) => (projectId ? item.projectId === projectId : true)));
}

export function createCloseoutPackage(tenantId, payload = {}) {
  const state = getTenantState(tenantId);
  const item = {
    closeoutPackageId: `CLO-${Date.now()}`,
    projectId: payload.projectId,
    title: payload.title || `Closeout package for ${payload.projectId}`,
    status: payload.status || "draft",
    requiredArtifacts: Array.isArray(payload.requiredArtifacts) ? payload.requiredArtifacts : [],
    completedArtifacts: Array.isArray(payload.completedArtifacts) ? payload.completedArtifacts : [],
    responsibleParty: payload.responsibleParty || "Auricrux",
    nextAction: payload.nextAction || "Complete closeout artifact collection.",
    updatedAt: nowIso(),
  };
  state.closeoutPackages.unshift(item);
  state.updatedAt = nowIso();
  return clone({ closeoutPackage: item, updatedAt: state.updatedAt });
}

export function mutateCloseoutPackage(tenantId, action, payload = {}) {
  const state = getTenantState(tenantId);
  const index = state.closeoutPackages.findIndex((item) => item.closeoutPackageId === payload.closeoutPackageId);
  if (index === -1) throw new Error(`Closeout package not found: ${payload.closeoutPackageId}`);
  const current = state.closeoutPackages[index];
  if (action !== "advance-closeout-package") throw new Error(`Unsupported closeout action: ${action}`);
  const updated = {
    ...current,
    status: payload.status || current.status,
    completedArtifacts: Array.isArray(payload.completedArtifacts) ? payload.completedArtifacts : current.completedArtifacts,
    nextAction: payload.nextAction || current.nextAction,
    updatedAt: nowIso(),
  };
  state.closeoutPackages[index] = updated;
  state.updatedAt = nowIso();
  return clone({ closeoutPackage: updated, updatedAt: state.updatedAt });
}

export function listWarrantyCases(tenantId, projectId = null) {
  const state = getTenantState(tenantId);
  return clone(state.warrantyCases.filter((item) => (projectId ? item.projectId === projectId : true)));
}

export function createWarrantyCase(tenantId, payload = {}) {
  const state = getTenantState(tenantId);
  const item = {
    warrantyCaseId: `WAR-${Date.now()}`,
    projectId: payload.projectId,
    title: payload.title || `Warranty case for ${payload.projectId}`,
    status: payload.status || "open",
    severity: payload.severity || "standard",
    requester: payload.requester || "Customer",
    issueType: payload.issueType || "general",
    description: payload.description || "Warranty issue logged.",
    dueAt: payload.dueAt || null,
    updatedAt: nowIso(),
  };
  state.warrantyCases.unshift(item);
  state.updatedAt = nowIso();
  return clone({ warrantyCase: item, updatedAt: state.updatedAt });
}

export function mutateWarrantyCase(tenantId, action, payload = {}) {
  const state = getTenantState(tenantId);
  const index = state.warrantyCases.findIndex((item) => item.warrantyCaseId === payload.warrantyCaseId);
  if (index === -1) throw new Error(`Warranty case not found: ${payload.warrantyCaseId}`);
  const current = state.warrantyCases[index];
  if (action !== "advance-warranty-case") throw new Error(`Unsupported warranty action: ${action}`);
  const updated = {
    ...current,
    status: payload.status || current.status,
    severity: payload.severity || current.severity,
    dueAt: payload.dueAt || current.dueAt,
    updatedAt: nowIso(),
  };
  state.warrantyCases[index] = updated;
  state.updatedAt = nowIso();
  return clone({ warrantyCase: updated, updatedAt: state.updatedAt });
}
