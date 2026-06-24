import { listBids } from "./workflow-store.js";

const STORE_KEY = "__FCA_COMMERCIAL_STORE__";
const DEFAULT_TENANT_ID = "TEN-FCA-001";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = { tenants: {} };
  }
  return globalThis[STORE_KEY];
}

function seedEstimates(tenantId) {
  const bids = listBids(tenantId);
  return bids.map((bid, index) => ({
    estimateId: `EST-${index + 1}`,
    bidId: bid.id,
    package: bid.package,
    status: bid.status === "Won" ? "Ready for proposal" : bid.status === "Qualified" ? "In estimating" : "Pre-estimate review",
    estimator: bid.estimator,
    total: bid.value,
    assumptions: [
      "Work performed during standard business hours unless otherwise approved.",
      "Owner-furnished decisions remain on schedule for procurement milestones.",
    ],
    exclusions: [
      "Unforeseen concealed conditions unless documented by change authorization.",
      "Permit or jurisdictional fees not explicitly listed in pricing breakdown.",
    ],
    lineItems: [
      { code: `LI-${index + 1}-01`, label: "General conditions", amount: "$8,500" },
      { code: `LI-${index + 1}-02`, label: "Trade scope package", amount: bid.value },
    ],
    lastActionAt: null,
    actionHistory: [],
  }));
}

function seedProposals(tenantId) {
  const bids = listBids(tenantId);
  return bids
    .filter((bid) => bid.status === "Won" || bid.status === "Qualified")
    .slice(0, 2)
    .map((bid, index) => ({
      proposalId: `PRO-${index + 1}`,
      bidId: bid.id,
      estimateId: `EST-${index + 1}`,
      package: bid.package,
      status: bid.status === "Won" ? "Ready to send" : "Draft",
      deliveryMode: "Customer portal package",
      commercialNarrative: `Proposal package for ${bid.package} aligned to active Contractor Command commercial continuity.`,
      assumptionsSummary: "Scope assumptions and exclusions packaged for customer approval.",
      nextAction: bid.status === "Won" ? "Send approval package" : "Complete estimate review",
      lastActionAt: null,
      actionHistory: [],
    }));
}

function getTenantState(tenantId = DEFAULT_TENANT_ID) {
  const store = getStore();
  const key = tenantId || DEFAULT_TENANT_ID;
  if (!store.tenants[key]) {
    store.tenants[key] = {
      estimates: seedEstimates(key),
      proposals: seedProposals(key),
      updatedAt: new Date().toISOString(),
    };
  }
  return store.tenants[key];
}

function stamp(label, detail) {
  return { at: new Date().toISOString(), label, detail };
}

export function listEstimates(tenantId) {
  return clone(getTenantState(tenantId).estimates);
}

export function listProposals(tenantId) {
  return clone(getTenantState(tenantId).proposals);
}

export function mutateEstimate(tenantId, action, payload = {}) {
  const state = getTenantState(tenantId);
  const idx = state.estimates.findIndex((item) => item.estimateId === payload.estimateId);
  if (idx === -1) throw new Error(`Estimate not found: ${payload.estimateId}`);
  const current = state.estimates[idx];
  let updated = current;
  let createdProposal = null;

  switch (action) {
    case "advance-estimate":
      updated = {
        ...current,
        status: payload.status || "Ready for proposal",
        lastActionAt: new Date().toISOString(),
        actionHistory: [stamp(`Estimate moved to ${payload.status || "Ready for proposal"}`, payload.detail || "Estimate advanced."), ...current.actionHistory].slice(0, 12),
      };
      break;
    case "generate-proposal": {
      updated = {
        ...current,
        status: "Proposal generated",
        lastActionAt: new Date().toISOString(),
        actionHistory: [stamp("Proposal generated", payload.detail || "Proposal package generated from estimate."), ...current.actionHistory].slice(0, 12),
      };
      const existing = state.proposals.find((item) => item.estimateId === current.estimateId);
      if (existing) {
        createdProposal = {
          ...existing,
          status: "Ready to send",
          nextAction: "Send approval package",
          lastActionAt: new Date().toISOString(),
          actionHistory: [stamp("Proposal refreshed from estimate", payload.detail || "Proposal regenerated from estimate."), ...(existing.actionHistory || [])].slice(0, 12),
        };
        state.proposals = state.proposals.map((item) => item.proposalId === existing.proposalId ? createdProposal : item);
      } else {
        createdProposal = {
          proposalId: `PRO-${Date.now()}`,
          bidId: current.bidId,
          estimateId: current.estimateId,
          package: current.package,
          status: "Ready to send",
          deliveryMode: "Customer portal package",
          commercialNarrative: `Proposal package for ${current.package} generated from the live estimate workspace.`,
          assumptionsSummary: current.assumptions.join(" "),
          nextAction: "Send approval package",
          lastActionAt: new Date().toISOString(),
          actionHistory: [stamp("Proposal created", payload.detail || "Proposal created from estimate.")],
        };
        state.proposals.unshift(createdProposal);
      }
      break;
    }
    case "add-line": {
      const newLine = {
        code: payload.code || `LINE-${Date.now()}`,
        label: payload.label || "New scope line",
        amount: payload.amount || "$0",
        note: payload.note || "Customer-customized line item",
      };
      updated = {
        ...current,
        lines: [...(current.lines || []), newLine],
        lastActionAt: new Date().toISOString(),
        actionHistory: [stamp("Line item added", payload.detail || newLine.label), ...(current.actionHistory || [])].slice(0, 12),
      };
      break;
    }
    case "update-scope-notes":
      updated = {
        ...current,
        scopeNotes: payload.scopeNotes ?? current.scopeNotes,
        lastActionAt: new Date().toISOString(),
        actionHistory: [stamp("Scope notes updated", payload.detail || "Estimate scope notes saved."), ...(current.actionHistory || [])].slice(0, 12),
      };
      break;
    default:
      throw new Error(`Unsupported estimate action: ${action}`);
  }

  state.estimates[idx] = updated;
  state.updatedAt = new Date().toISOString();
  return clone({ estimate: updated, proposal: createdProposal, updatedAt: state.updatedAt });
}

export function mutateProposal(tenantId, action, payload = {}) {
  const state = getTenantState(tenantId);
  const idx = state.proposals.findIndex((item) => item.proposalId === payload.proposalId);
  if (idx === -1) throw new Error(`Proposal not found: ${payload.proposalId}`);
  const current = state.proposals[idx];
  let updated = current;

  switch (action) {
    case "advance-proposal":
      updated = {
        ...current,
        status: payload.status || "Sent",
        nextAction: payload.nextAction || (payload.status === "Approved" ? "Create project handoff package" : "Track customer response"),
        lastActionAt: new Date().toISOString(),
        actionHistory: [stamp(`Proposal moved to ${payload.status || "Sent"}`, payload.detail || "Proposal advanced."), ...current.actionHistory].slice(0, 12),
      };
      break;
    default:
      throw new Error(`Unsupported proposal action: ${action}`);
  }

  state.proposals[idx] = updated;
  state.updatedAt = new Date().toISOString();
  return clone({ proposal: updated, updatedAt: state.updatedAt });
}
