import { portalBids } from "./systemState";

export const BID_WORKSPACE_KEY = "fca_bid_workspace_v1";

function normalizeQualification(qualification = {}, bid = {}) {
  return {
    score: qualification.score || "62/100",
    status: qualification.status || "Discovery in progress",
    budgetFit: qualification.budgetFit || "Budget needs confirmation",
    scopeFit: qualification.scopeFit || bid.scopePackage || "Scope needs validation",
    jurisdiction: qualification.jurisdiction || "License and permit review pending",
    travel: qualification.travel || "Travel zone review pending",
    evidence: qualification.evidence || "Customer documents pending",
    nextGate: qualification.nextGate || "Complete qualification command review",
  };
}

function normalizeBidRecord(bid = {}, index = 0) {
  const projectId = bid.projectId || (index === 0 ? "A-117" : index === 1 ? "B-204" : "C-332");
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
    projectId,
    canonicalProjectId: bid.canonicalProjectId || `PRJ-${String(projectId).replace(/[^A-Za-z0-9]/g, "")}`,
    estimateReadiness: bid.estimateReadiness || "Estimate posture pending",
    qualification: normalizeQualification(bid.qualification, bid),
    lastActionAt: bid.lastActionAt || null,
    actionHistory: Array.isArray(bid.actionHistory) ? bid.actionHistory : [],
  };
}

function seedBidWorkspace() {
  return portalBids.map((bid, index) =>
    normalizeBidRecord(
      {
        ...bid,
        id: `BID-${index + 1}`,
        projectId: index === 0 ? "A-117" : index === 1 ? "B-204" : "C-332",
        estimateReadiness: index === 0 ? "Ready for estimate" : index === 1 ? "Trade leveling pending" : "Award carry-forward",
        qualification: {
          score: index === 0 ? "84/100" : index === 1 ? "71/100" : "63/100",
          status: index === 0 ? "Ready for estimate" : index === 1 ? "Budget review" : "Discovery in progress",
          budgetFit: index === 0 ? "Confirmed" : index === 1 ? "Pending buyer confirmation" : "Budget not verified",
          scopeFit: bid.scopePackage,
          jurisdiction: index === 0 ? "Licensed coverage verified" : "Municipal review pending",
          travel: index === 0 ? "Inside standard travel zone" : "Travel premium review pending",
          evidence: index === 0 ? "Plans, photos, and buyer notes attached" : "Awaiting full evidence packet",
          nextGate: index === 0 ? "Route to estimator handoff" : "Complete qualification command review",
        },
      },
      index
    )
  );
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
