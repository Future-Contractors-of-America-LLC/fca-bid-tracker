import { portalBids } from "./systemState";

export const BID_WORKSPACE_KEY = "fca_bid_workspace_v1";

function normalizeBidRecord(bid = {}, index = 0) {
  return {
    id: bid.id || `BID-${index + 1}`,
    package: bid.package || `Package-${index + 1}`,
    value: bid.value || "$0",
    status: bid.status || "Quoted",
    blocker: bid.blocker || "No blocker recorded",
    estimator: bid.estimator || "Unassigned",
    scopePackage: bid.scopePackage || "Scope pending",
    dueDate: bid.dueDate || "TBD",
    tradeCoverage: bid.tradeCoverage || "Coverage pending",
    nextCommercialMove: bid.nextCommercialMove || "Advance commercial review",
    lastActionAt: bid.lastActionAt || null,
    actionHistory: Array.isArray(bid.actionHistory) ? bid.actionHistory : [],
  };
}

function seedBidWorkspace() {
  return portalBids.map((bid, index) => normalizeBidRecord({ ...bid, id: `BID-${index + 1}` }, index));
}

export function readBidWorkspace() {
  if (typeof window === "undefined") return seedBidWorkspace();

  try {
    const raw = window.localStorage.getItem(BID_WORKSPACE_KEY);
    if (!raw) return seedBidWorkspace();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedBidWorkspace();
    return parsed.map((bid, index) => normalizeBidRecord(bid, index));
  } catch {
    return seedBidWorkspace();
  }
}

export function writeBidWorkspace(bids = []) {
  const normalized = bids.map((bid, index) => normalizeBidRecord(bid, index));

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(BID_WORKSPACE_KEY, JSON.stringify(normalized));
    } catch {
      // best-effort persistence during shell hardening phase
    }
  }

  return normalized;
}

export function updateBidWorkspace(mutator) {
  const current = readBidWorkspace();
  const next = typeof mutator === "function" ? mutator(current) : current;
  return writeBidWorkspace(next);
}
