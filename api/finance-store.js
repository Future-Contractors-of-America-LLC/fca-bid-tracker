import { listBids } from "./workflow-store.js";

const STORE_KEY = "__FCA_FINANCE_STORE__";
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
  const bids = listBids(tenantId);
  const projects = bids.slice(0, 2).map((bid, index) => ({
    projectId: index === 0 ? "A-117" : `PRJ-${index + 1}`,
    package: bid.package,
    contractValue: bid.value,
    committedCost: index === 0 ? "$124,500" : "$68,200",
    actualCost: index === 0 ? "$86,750" : "$31,400",
    billedToDate: index === 0 ? "$92,000" : "$20,000",
    earnedToDate: index === 0 ? "$96,500" : "$24,100",
  }));

  return {
    changeOrders: [
      {
        changeOrderId: "CO-001",
        projectId: "A-117",
        title: "Lobby access control revision",
        status: "Pricing review",
        amount: "$12,400",
        reason: "Revised owner security scope",
        createdAt: nowIso(),
      },
    ],
    payApps: [
      {
        payAppId: "PA-001",
        projectId: "A-117",
        applicationNumber: 3,
        status: "Draft",
        period: "2026-06",
        amountRequested: "$48,250",
        retentionHeld: "$4,825",
        createdAt: nowIso(),
      },
    ],
    jobCosts: projects.map((project) => ({
      projectId: project.projectId,
      contractValue: project.contractValue,
      committedCost: project.committedCost,
      actualCost: project.actualCost,
      billedToDate: project.billedToDate,
      earnedToDate: project.earnedToDate,
      grossMarginForecast: project.projectId === "A-117" ? "$37,750" : "$28,600",
      updatedAt: nowIso(),
    })),
    billingSummary: projects.map((project) => ({
      projectId: project.projectId,
      contractValue: project.contractValue,
      billedToDate: project.billedToDate,
      outstandingToBill: project.projectId === "A-117" ? "$28,000" : "$14,500",
      collectionsStatus: project.projectId === "A-117" ? "Current" : "Pending first draw",
      updatedAt: nowIso(),
    })),
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

export function listChangeOrders(tenantId, projectId = null) {
  const state = getTenantState(tenantId);
  return clone(state.changeOrders.filter((item) => (projectId ? item.projectId === projectId : true)));
}

export function createChangeOrder(tenantId, payload = {}) {
  const state = getTenantState(tenantId);
  const item = {
    changeOrderId: `CO-${Date.now()}`,
    projectId: payload.projectId,
    title: payload.title,
    status: payload.status || "Draft",
    amount: payload.amount || "$0",
    reason: payload.reason || "Change event recorded",
    createdAt: nowIso(),
  };
  state.changeOrders.unshift(item);
  state.updatedAt = nowIso();
  return clone({ changeOrder: item, updatedAt: state.updatedAt });
}

export function mutateChangeOrder(tenantId, action, payload = {}) {
  const state = getTenantState(tenantId);
  const index = state.changeOrders.findIndex((item) => item.changeOrderId === payload.changeOrderId);
  if (index === -1) throw new Error(`Change order not found: ${payload.changeOrderId}`);
  const current = state.changeOrders[index];
  if (action !== "advance-change-order") throw new Error(`Unsupported change-order action: ${action}`);
  const updated = {
    ...current,
    status: payload.status || current.status,
    amount: payload.amount || current.amount,
    lastActionAt: nowIso(),
  };
  state.changeOrders[index] = updated;
  state.updatedAt = nowIso();
  return clone({ changeOrder: updated, updatedAt: state.updatedAt });
}

export function listPayApps(tenantId, projectId = null) {
  const state = getTenantState(tenantId);
  return clone(state.payApps.filter((item) => (projectId ? item.projectId === projectId : true)));
}

export function createPayApp(tenantId, payload = {}) {
  const state = getTenantState(tenantId);
  const item = {
    payAppId: `PA-${Date.now()}`,
    projectId: payload.projectId,
    applicationNumber: payload.applicationNumber || 1,
    status: payload.status || "Draft",
    period: payload.period || new Date().toISOString().slice(0, 7),
    amountRequested: payload.amountRequested || "$0",
    retentionHeld: payload.retentionHeld || "$0",
    createdAt: nowIso(),
  };
  state.payApps.unshift(item);
  state.updatedAt = nowIso();
  return clone({ payApp: item, updatedAt: state.updatedAt });
}

export function mutatePayApp(tenantId, action, payload = {}) {
  const state = getTenantState(tenantId);
  const index = state.payApps.findIndex((item) => item.payAppId === payload.payAppId);
  if (index === -1) throw new Error(`Pay app not found: ${payload.payAppId}`);
  const current = state.payApps[index];
  if (action !== "advance-pay-app") throw new Error(`Unsupported pay-app action: ${action}`);
  const updated = {
    ...current,
    status: payload.status || current.status,
    amountRequested: payload.amountRequested || current.amountRequested,
    lastActionAt: nowIso(),
  };
  state.payApps[index] = updated;
  state.updatedAt = nowIso();
  return clone({ payApp: updated, updatedAt: state.updatedAt });
}

export function listJobCosts(tenantId, projectId = null) {
  const state = getTenantState(tenantId);
  return clone(state.jobCosts.filter((item) => (projectId ? item.projectId === projectId : true)));
}

export function listBillingSummaries(tenantId, projectId = null) {
  const state = getTenantState(tenantId);
  return clone(state.billingSummary.filter((item) => (projectId ? item.projectId === projectId : true)));
}
