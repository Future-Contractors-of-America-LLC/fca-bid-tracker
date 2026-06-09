export const ESTIMATE_WORKSPACE_KEY = "fca_estimate_workspace_v1";

function normalizeTakeoffItem(item = {}, index = 0) {
  return {
    id: item.id || `TKO-${index + 1}`,
    label: item.label || `Takeoff item ${index + 1}`,
    quantity: item.quantity || "Pending",
    unit: item.unit || "EA",
    source: item.source || "Evidence spine pending",
    status: item.status || "Draft",
  };
}

function normalizeEstimateRecord(record = {}, index = 0) {
  return {
    id: record.id || `EST-${index + 1}`,
    bidId: record.bidId || `BID-${index + 1}`,
    projectId: record.projectId || "A-117",
    canonicalProjectId: record.canonicalProjectId || `PRJ-${String(record.projectId || "A117").replace(/[^A-Za-z0-9]/g, "")}`,
    package: record.package || `Estimate Package ${index + 1}`,
    estimateStatus: record.estimateStatus || "Estimate not started",
    takeoffStatus: record.takeoffStatus || "Takeoff not started",
    proposalStatus: record.proposalStatus || "Proposal not generated",
    estimator: record.estimator || "Unassigned",
    linkedFileCount: Number.isFinite(record.linkedFileCount) ? record.linkedFileCount : 0,
    evidenceSummary: record.evidenceSummary || "Evidence linkage pending",
    costBasis: record.costBasis || "Cost basis pending",
    scopeNarrative: record.scopeNarrative || "Scope narrative pending",
    takeoffItems: Array.isArray(record.takeoffItems) ? record.takeoffItems.map(normalizeTakeoffItem) : [],
    lastActionAt: record.lastActionAt || null,
    actionHistory: Array.isArray(record.actionHistory) ? record.actionHistory : [],
  };
}

function seedEstimateWorkspace() {
  return [
    {
      id: "EST-A117",
      bidId: "BID-1",
      projectId: "A-117",
      canonicalProjectId: "PRJ-A117",
      package: "Package A-117",
      estimateStatus: "Ready for estimate",
      takeoffStatus: "Manual takeoff seeded",
      proposalStatus: "Proposal narrative pending",
      estimator: "J. Benton",
      linkedFileCount: 4,
      evidenceSummary: "Plans, permit narrative, and onboarding packet linked to preconstruction evidence spine.",
      costBasis: "Tenant improvement budget aligned to current scope log and trade coverage.",
      scopeNarrative: "Interior demo, framing, and MEP coordination packaged for estimate refinement.",
      takeoffItems: [
        { id: "TKO-A117-001", label: "Interior demolition", quantity: "1,800", unit: "SF", source: "Bid package summary.pdf", status: "Verified" },
        { id: "TKO-A117-002", label: "Metal stud framing", quantity: "420", unit: "LF", source: "Permit set_A117.pdf", status: "Pending pricing" },
      ],
    },
    {
      id: "EST-B204",
      bidId: "BID-2",
      projectId: "B-204",
      canonicalProjectId: "PRJ-B204",
      package: "Package B-204",
      estimateStatus: "Trade leveling in progress",
      takeoffStatus: "Assemblies under review",
      proposalStatus: "Proposal update pending",
      estimator: "L. Nguyen",
      linkedFileCount: 3,
      evidenceSummary: "Mobilization and field kickoff files linked to execution prep.",
      costBasis: "Exterior upgrades and site electrical estimate pending trade refresh.",
      scopeNarrative: "Exterior scope is being leveled against current subcontractor coverage and mobilization plan.",
      takeoffItems: [
        { id: "TKO-B204-001", label: "Concrete restoration", quantity: "950", unit: "SF", source: "Mobilization_Checklist_B204.pdf", status: "Pending pricing" },
      ],
    },
    {
      id: "EST-C332",
      bidId: "BID-3",
      projectId: "C-332",
      canonicalProjectId: "PRJ-C332",
      package: "Package C-410",
      estimateStatus: "Won / closeout continuity",
      takeoffStatus: "Final scope verified",
      proposalStatus: "Award narrative preserved",
      estimator: "A. Ramirez",
      linkedFileCount: 2,
      evidenceSummary: "Closeout and owner signoff files linked to retained value and finish scope.",
      costBasis: "Final finish carpentry and punch completion values are preserved for closeout continuity.",
      scopeNarrative: "Awarded finish carpentry and punch completion package is linked to closeout and retainage release posture.",
      takeoffItems: [
        { id: "TKO-C332-001", label: "Finish carpentry touch-up", quantity: "36", unit: "EA", source: "Closeout_Punch_Confirmation_C332.pdf", status: "Verified" },
      ],
    },
  ].map((record, index) => normalizeEstimateRecord(record, index));
}

export function readEstimateWorkspace() {
  if (typeof window === "undefined") return seedEstimateWorkspace();

  try {
    const raw = window.localStorage.getItem(ESTIMATE_WORKSPACE_KEY);
    if (!raw) return seedEstimateWorkspace();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedEstimateWorkspace();
    return parsed.map((record, index) => normalizeEstimateRecord(record, index));
  } catch {
    return seedEstimateWorkspace();
  }
}

export function writeEstimateWorkspace(records = []) {
  const normalized = records.map((record, index) => normalizeEstimateRecord(record, index));

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(ESTIMATE_WORKSPACE_KEY, JSON.stringify(normalized));
    } catch {
      // best-effort persistence during shell hardening phase
    }
  }

  return normalized;
}

export function updateEstimateWorkspace(mutator) {
  const current = readEstimateWorkspace();
  const next = typeof mutator === "function" ? mutator(current) : current;
  return writeEstimateWorkspace(next);
}
