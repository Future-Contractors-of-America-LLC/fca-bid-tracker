export const PROPOSAL_READINESS_ITEMS = [
  { key: "plansReceived", label: "Plans / drawings received", tier: "core", weight: 12 },
  { key: "siteWalkComplete", label: "Site walk completed", tier: "core", weight: 12 },
  { key: "budgetConfirmed", label: "Budget confirmed with owner", tier: "commercial", weight: 10 },
  { key: "decisionMakerIdentified", label: "Decision maker identified", tier: "commercial", weight: 10 },
  { key: "scopeDocumented", label: "Scope documented and aligned", tier: "technical", weight: 10 },
  { key: "scheduleConfirmed", label: "Schedule / bid deadline confirmed", tier: "commercial", weight: 8 },
  { key: "insuranceVerified", label: "Insurance requirements verified", tier: "risk", weight: 8 },
  { key: "bondingResolved", label: "Bonding requirements resolved", tier: "risk", weight: 8 },
  { key: "subQuotesReceived", label: "Subcontractor quotes received", tier: "technical", weight: 10 },
  { key: "proposalTemplateReady", label: "Proposal template selected", tier: "delivery", weight: 6 },
  { key: "pricingReviewComplete", label: "Internal pricing review complete", tier: "delivery", weight: 6 },
];

export function computeProposalReadiness(checklist = {}) {
  const cl = checklist && typeof checklist === "object" ? checklist : {};
  let totalWeight = 0;
  let earnedWeight = 0;
  let completed = 0;
  const missing = [];

  for (const item of PROPOSAL_READINESS_ITEMS) {
    totalWeight += item.weight;
    if (cl[item.key] === true) {
      earnedWeight += item.weight;
      completed += 1;
    } else {
      missing.push(item);
    }
  }

  const percent = totalWeight ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  let status = "not-ready";
  if (percent >= 85) status = "proposal-ready";
  else if (percent >= 60) status = "nearly-ready";
  else if (percent >= 35) status = "in-progress";

  return {
    percent,
    status,
    completed,
    total: PROPOSAL_READINESS_ITEMS.length,
    missing,
    coreComplete: cl.plansReceived === true && cl.siteWalkComplete === true,
  };
}
