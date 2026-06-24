export const PIPELINE_STAGES = [
  "new",
  "under-review",
  "qualified",
  "invited",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

export const STAGE_LABELS = {
  new: "New",
  "under-review": "Under Review",
  qualified: "Qualified",
  invited: "Invited",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export function formatLeadCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatLeadDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function defaultNextAction(status) {
  const map = {
    new: "Run Auricrux intake qualification review",
    "under-review": "Complete qualification checklist",
    qualified: "Issue pilot invite and begin estimate handoff",
    invited: "Complete pilot checkout",
    proposal: "Prepare proposal-ready package",
    negotiation: "Advance commercial terms review",
    won: "Activate onboarding and project workspace",
    lost: "Archive lead and capture loss reason",
  };
  return map[status] || "Review lead in Auricrux Central";
}

export function estimateLeadScore(item) {
  let score = 45;
  const client = item?.client || {};
  const site = item?.site || {};
  if (client.contactEmail) score += 10;
  if (client.contactPhone) score += 8;
  if (site.jurisdiction) score += 8;
  if (item?.budgetStatus === "confirmed") score += 12;
  if (item?.ownershipStatus === "verified") score += 10;
  if (Number(site.estimatedValue || 0) >= 100000) score += 7;
  return Math.min(score, 100);
}

export function normalizeLead(item) {
  if (!item) return null;
  const client = item.client || {};
  const site = item.site || {};
  const auricrux = item.auricruxSummary || item.auricrux || {};

  return {
    id: item.leadId,
    leadId: item.leadId,
    company: client.name || client.company || "Unknown",
    projectName: site.name || site.projectName || "Unnamed project",
    contactName: client.contactName || "",
    contactEmail: client.contactEmail || "",
    contactPhone: client.contactPhone || "",
    trade: item.serviceLine || site.trade || "",
    location: site.jurisdiction || site.location || "",
    value: Number(site.estimatedValue || site.value || 0),
    notes: item.notes || "",
    source: item.sourceChannel || "lead-gen",
    pipelineStage: item.status || "new",
    status: item.status || "new",
    budgetStatus: item.budgetStatus || "",
    jurisdictionStatus: item.jurisdictionStatus || "",
    ownershipStatus: item.ownershipStatus || "",
    opportunityId: item.opportunityId || "",
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || "",
    auricruxScore: Number(auricrux.score || item.auricruxScore || estimateLeadScore(item)),
    auricruxRisk: auricrux.risk || item.auricruxRisk || (estimateLeadScore(item) >= 75 ? "low" : estimateLeadScore(item) >= 55 ? "medium" : "high"),
    nextAction: auricrux.nextAction || item.nextAction || defaultNextAction(item.status || "new"),
    raw: item,
  };
}

export function computeLeadMetrics(leads) {
  const active = leads.filter((lead) => lead.pipelineStage !== "lost");
  const pipelineValue = active.reduce((sum, lead) => sum + Number(lead.value || 0), 0);
  const wonValue = leads
    .filter((lead) => lead.pipelineStage === "won")
    .reduce((sum, lead) => sum + Number(lead.value || 0), 0);
  const avgScore =
    leads.length === 0
      ? 0
      : Math.round(leads.reduce((sum, lead) => sum + Number(lead.auricruxScore || 0), 0) / leads.length);

  return {
    totalLeads: leads.length,
    activeLeads: active.length,
    pipelineValue,
    wonValue,
    avgScore,
  };
}

export function groupLeadsByStage(leads) {
  const grouped = {};
  PIPELINE_STAGES.forEach((stage) => {
    grouped[stage] = [];
  });
  leads.forEach((lead) => {
    const stage = lead.pipelineStage || "new";
    if (!grouped[stage]) grouped[stage] = [];
    grouped[stage].push(lead);
  });
  return grouped;
}

export const CHECKLIST_FIELDS = [
  { key: "plansReceived", label: "Plans received" },
  { key: "siteWalkComplete", label: "Site walk complete" },
  { key: "budgetConfirmed", label: "Budget confirmed" },
  { key: "decisionMakerIdentified", label: "Decision maker identified" },
];

export function defaultChecklist(overrides = {}) {
  return {
    plansReceived: false,
    siteWalkComplete: false,
    budgetConfirmed: false,
    decisionMakerIdentified: false,
    ...overrides,
  };
}

export function getLeadChecklist(lead) {
  return defaultChecklist(lead?.raw?.checklist || {});
}

export function qualificationBlockingReasons(lead, checklist = null) {
  const reasons = [];
  const activeChecklist = checklist || getLeadChecklist(lead);
  const client = lead?.raw?.client || {};

  if ((lead?.budgetStatus || lead?.raw?.budgetStatus) !== "confirmed" && !activeChecklist.budgetConfirmed) {
    reasons.push("Budget must be confirmed.");
  }
  const jurisdiction = lead?.jurisdictionStatus || lead?.raw?.jurisdictionStatus;
  if (!["pending", "validated"].includes(jurisdiction)) {
    reasons.push("Jurisdiction review must be pending or validated.");
  }
  const ownership = lead?.ownershipStatus || lead?.raw?.ownershipStatus;
  if (!["pending", "verified"].includes(ownership) && !activeChecklist.decisionMakerIdentified) {
    reasons.push("Ownership or decision-maker verification is required.");
  }
  if (!lead?.contactEmail && !client.contactEmail) {
    reasons.push("Contact email is required.");
  }
  CHECKLIST_FIELDS.forEach(({ key, label }) => {
    if (!activeChecklist[key]) {
      reasons.push(`${label} must be complete.`);
    }
  });
  return reasons;
}

export function isQualificationReady(lead, checklist = null) {
  return qualificationBlockingReasons(lead, checklist).length === 0;
}

  const company = String(form.company || "").trim();
  const projectName = String(form.projectName || "").trim();

  return {
    sourceChannel: form.source || "lead-gen",
    serviceLine: form.trade || "general-construction",
    projectIntent: form.projectType || "commercial",
    budgetSignal: form.budgetConfirmed ? "confirmed" : "pending",
    sourceRoute: form.sourceRoute || "/portal/leads",
    createdBy: "fca-lead-intelligence",
    client: {
      name: company,
      contactName: form.contactName || "",
      contactEmail: form.contactEmail || "",
      contactPhone: form.contactPhone || "",
      leadType: form.leadType || "gc",
    },
    site: {
      name: projectName,
      jurisdiction: form.location || "",
      projectType: form.projectType || "",
      estimatedValue: Number(form.value || 0),
      squareFootage: form.squareFootage || "",
      bidDeadline: form.bidDeadline || "",
      unionRequired: form.unionRequired || "",
      trade: form.trade || "",
    },
    notes: form.notes || "",
    checklist: {
      plansReceived: !!form.plansReceived,
      siteWalkComplete: !!form.siteWalkComplete,
      budgetConfirmed: !!form.budgetConfirmed,
      decisionMakerIdentified: !!form.decisionMakerIdentified,
    },
  };
}

export function buildQualifyPayload(lead, checklist, reason = "") {
  const activeChecklist = checklist || getLeadChecklist(lead);
  return {
    reason: reason || "Qualified through FCA Lead Intelligence review.",
    qualifiedBy: "auricrux",
    sourceRoute: "/portal/leads",
    budgetStatus: activeChecklist.budgetConfirmed || lead.budgetStatus === "confirmed" ? "confirmed" : lead.budgetStatus,
    jurisdictionStatus: lead.jurisdictionStatus === "validated" ? "validated" : "pending",
    ownershipStatus: activeChecklist.decisionMakerIdentified ? "verified" : lead.ownershipStatus || "pending",
    checklist: activeChecklist,
  };
}
