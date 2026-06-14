import { academyCatalog } from "../src/academyCatalog.js";

const STORE_KEY = "__FCA_REMEDIATION_STORE__";
const DEFAULT_TENANT_ID = "TEN-FCA-001";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function getProgram(programKey) {
  return academyCatalog.programs.find((program) => program.key === programKey) || null;
}

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = { tenants: {} };
  }
  return globalThis[STORE_KEY];
}

function seedLinks() {
  return [
    {
      remediationId: "REM-001",
      projectId: "A-117",
      sourceObjectType: "rfi",
      sourceObjectId: "RFI-A-117-01",
      targetType: "program",
      targetId: "project-controls",
      targetTitle: "Project Controls and Document Governance",
      rationale: "Repeated document clarification work requires structured project-controls remediation.",
      status: "open",
      linkedAt: nowIso(),
      linkedBy: "Auricrux",
      evidenceStatus: "pending-review",
    },
    {
      remediationId: "REM-002",
      projectId: "A-117",
      sourceObjectType: "takeoff",
      sourceObjectId: "TKO-A-117-01",
      targetType: "program",
      targetId: "precon-estimating",
      targetTitle: "Estimating and Preconstruction Readiness",
      rationale: "Quantity variance requires estimating calibration and scope-review reinforcement.",
      status: "open",
      linkedAt: nowIso(),
      linkedBy: "Auricrux",
      evidenceStatus: "pending-review",
    },
  ];
}

function getTenantState(tenantId = DEFAULT_TENANT_ID) {
  const store = getStore();
  const key = tenantId || DEFAULT_TENANT_ID;
  if (!store.tenants[key]) {
    store.tenants[key] = {
      links: seedLinks(),
      updatedAt: nowIso(),
    };
  }
  return store.tenants[key];
}

export function listRemediationLinks(tenantId, filters = {}) {
  const state = getTenantState(tenantId);
  const projectId = filters.projectId || null;
  const sourceObjectType = filters.sourceObjectType || null;
  const sourceObjectId = filters.sourceObjectId || null;
  const status = filters.status || null;

  const items = state.links.filter((item) => {
    if (projectId && item.projectId !== projectId) return false;
    if (sourceObjectType && item.sourceObjectType !== sourceObjectType) return false;
    if (sourceObjectId && item.sourceObjectId !== sourceObjectId) return false;
    if (status && item.status !== status) return false;
    return true;
  });

  return clone(items);
}

export function createRemediationLink(tenantId, payload = {}) {
  const state = getTenantState(tenantId);
  const program = getProgram(payload.targetId);
  if (!program) {
    throw new Error(`Program not found: ${payload.targetId}`);
  }

  const remediation = {
    remediationId: `REM-${Date.now()}`,
    projectId: payload.projectId || null,
    sourceObjectType: payload.sourceObjectType,
    sourceObjectId: payload.sourceObjectId,
    targetType: payload.targetType || "program",
    targetId: payload.targetId,
    targetTitle: program.title,
    rationale: payload.rationale,
    status: "open",
    linkedAt: nowIso(),
    linkedBy: payload.linkedBy || "Auricrux",
    evidenceStatus: payload.evidenceStatus || "pending-review",
  };

  state.links.unshift(remediation);
  state.updatedAt = nowIso();
  return clone({ remediation, updatedAt: state.updatedAt });
}

export function mutateRemediationLink(tenantId, action, payload = {}) {
  const state = getTenantState(tenantId);
  const index = state.links.findIndex((item) => item.remediationId === payload.remediationId);
  if (index === -1) {
    throw new Error(`Remediation link not found: ${payload.remediationId}`);
  }

  const current = state.links[index];
  let updated = current;

  switch (action) {
    case "advance-remediation":
      updated = {
        ...current,
        status: payload.status || "in_progress",
        evidenceStatus: payload.evidenceStatus || current.evidenceStatus,
        lastActionAt: nowIso(),
      };
      break;
    case "close-remediation":
      updated = {
        ...current,
        status: "closed",
        evidenceStatus: payload.evidenceStatus || "verified",
        closureNote: payload.closureNote || "Closed through Academy remediation completion.",
        lastActionAt: nowIso(),
      };
      break;
    default:
      throw new Error(`Unsupported remediation action: ${action}`);
  }

  state.links[index] = updated;
  state.updatedAt = nowIso();
  return clone({ remediation: updated, updatedAt: state.updatedAt });
}
