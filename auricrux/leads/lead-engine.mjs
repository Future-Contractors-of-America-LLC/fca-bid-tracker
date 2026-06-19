/**
 * Auricrux Lead Engine (exec copy)
 */

export const LEAD_SOURCES = [
  "lead-gen",
  "customer-intake",
  "lead-referral",
  "planhub-style"
];

export const PIPELINE_STAGES = [
  "new",
  "qualified",
  "invited",
  "proposal",
  "negotiation",
  "won",
  "lost"
];

export function isLeadRecord(record) {
  if (!record) return false;
  const source = String(record.source || "").toLowerCase();
  return (
    LEAD_SOURCES.includes(source) ||
    Boolean(record.intakeId) ||
    Boolean(record.pipelineStage)
  );
}

export function qualifyLead(lead) {
  let score = Number(lead.auricruxScore || 0);
  const signals = [];

  if (lead.contactEmail) {
    score += 3;
    signals.push("Contact email verified");
  }
  if (lead.contactPhone) {
    score += 2;
    signals.push("Direct phone captured");
  }
  if (lead.checklist?.budgetConfirmed) {
    score += 5;
    signals.push("Budget confirmed");
  }
  if (lead.checklist?.decisionMakerIdentified) {
    score += 5;
    signals.push("Decision maker identified");
  }
  if (Number(lead.value || 0) >= 100000) {
    signals.push("High-value opportunity");
  }

  const pipelineStage =
    score >= 70 && lead.pipelineStage === "new"
      ? "qualified"
      : lead.pipelineStage || "new";

  return {
    ...lead,
    auricruxScore: Math.min(score, 100),
    pipelineStage,
    status: pipelineStage,
    nextAction:
      pipelineStage === "qualified"
        ? "Schedule qualification call and issue pilot invite"
        : lead.nextAction || lead.auricruxRecommendation,
    auricruxLeadSignals: signals
  };
}

export function leadToPipelineEntry(lead, pilotOffer) {
  const checkoutBase = pilotOffer?.checkoutBase || "";
  const intakeId = lead.intakeId || lead.id;
  const checkoutUrl = checkoutBase
    ? checkoutBase + "?client_reference_id=" + encodeURIComponent(intakeId)
    : lead.checkoutUrl || "";

  return {
    intakeId,
    leadId: lead.id,
    company: lead.company || "",
    project: lead.projectName || lead.project || "",
    value: lead.value || 0,
    trade: lead.trade || "",
    location: lead.location || "",
    pipelineStage: lead.pipelineStage || "new",
    auricruxScore: lead.auricruxScore || 0,
    auricruxRisk: lead.auricruxRisk || "",
    nextAction: lead.nextAction || "",
    source: lead.source || "lead-gen",
    createdUtc: lead.createdAt || new Date().toISOString(),
    updatedUtc: lead.updatedAt || new Date().toISOString(),
    checkoutUrl
  };
}

export function routeLeadActions(lead) {
  const actions = [];

  if ((lead.pipelineStage || "new") === "new") {
    actions.push("Run Auricrux qualification scoring");
  }
  if (lead.pipelineStage === "qualified") {
    actions.push("Send pilot offer and attach checkout link");
  }
  if (lead.pipelineStage === "invited") {
    actions.push("Monitor Stripe payment proof and activate onboarding");
  }
  if (lead.pipelineStage === "proposal") {
    actions.push("Generate proposal-ready bid package");
  }

  return actions;
}
