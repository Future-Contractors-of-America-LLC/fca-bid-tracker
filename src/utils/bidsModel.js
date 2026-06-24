export const BID_CHECKLIST_FIELDS = [
  { key: "plansReceived", label: "Plans received" },
  { key: "siteWalkComplete", label: "Site walk complete" },
  { key: "budgetConfirmed", label: "Budget confirmed" },
  { key: "decisionMakerIdentified", label: "Decision maker identified" },
  { key: "tradeLevelingComplete", label: "Trade leveling complete" },
  { key: "jurisdictionReviewed", label: "Jurisdiction reviewed" },
];

export function defaultBidChecklist(overrides = {}) {
  return {
    plansReceived: false,
    siteWalkComplete: false,
    budgetConfirmed: false,
    decisionMakerIdentified: false,
    tradeLevelingComplete: false,
    jurisdictionReviewed: false,
    ...overrides,
  };
}

export function getBidChecklist(bid) {
  return defaultBidChecklist(bid?.checklist || bid?.raw?.checklist || {});
}

export function qualificationBlockingReasons(bid, checklist = null) {
  const reasons = [];
  const activeChecklist = checklist || getBidChecklist(bid);
  BID_CHECKLIST_FIELDS.forEach(({ key, label }) => {
    if (!activeChecklist[key]) {
      reasons.push(`${label} must be complete.`);
    }
  });
  return reasons;
}

export function isQualificationReady(bid, checklist = null) {
  return qualificationBlockingReasons(bid, checklist).length === 0;
}

export function buildQualifyPayload(bid, checklist, detail = "") {
  const activeChecklist = checklist || getBidChecklist(bid);
  const completeCount = BID_CHECKLIST_FIELDS.filter(({ key }) => activeChecklist[key]).length;
  const score = Math.round((completeCount / BID_CHECKLIST_FIELDS.length) * 100);
  return {
    checklist: activeChecklist,
    score: `${score}/100`,
    status: "Qualified",
    budgetFit: activeChecklist.budgetConfirmed ? "Confirmed" : bid?.qualification?.budgetFit,
    scopeFit: bid?.scopePackage || bid?.qualification?.scopeFit,
    jurisdiction: activeChecklist.jurisdictionReviewed ? "Licensed coverage verified" : bid?.qualification?.jurisdiction,
    travel: bid?.qualification?.travel,
    evidence: "Qualification checklist complete with governed evidence posture",
    nextGate: "Route to estimate",
    detail: detail || "Qualified through governed bid checklist review.",
  };
}

export function resolveEvidencePacket(bidId, packets = []) {
  return packets.find((packet) => packet.bidId === bidId) || null;
}
