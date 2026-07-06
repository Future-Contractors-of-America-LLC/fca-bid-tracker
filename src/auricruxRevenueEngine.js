import { adminGovernance } from "./adminGovernance.js";

const REVENUE_AUTONOMY_KEY = "fca_auricrux_revenue_autonomy_v1";

function nowIso() {
  return new Date().toISOString();
}

function readStore() {
  if (typeof window === "undefined") {
    return {
      killSwitch: false,
      aggressiveness: "balanced",
      frozenAccounts: [],
      outreachLog: [],
      proposals: [],
      escalations: [],
      upgrades: [],
    };
  }

  try {
    const raw = window.localStorage.getItem(REVENUE_AUTONOMY_KEY);
    if (!raw) {
      return {
        killSwitch: false,
        aggressiveness: "balanced",
        frozenAccounts: [],
        outreachLog: [],
        proposals: [],
        escalations: [],
        upgrades: [],
      };
    }
    const parsed = JSON.parse(raw);
    return {
      killSwitch: Boolean(parsed.killSwitch),
      aggressiveness: parsed.aggressiveness || "balanced",
      frozenAccounts: Array.isArray(parsed.frozenAccounts) ? parsed.frozenAccounts : [],
      outreachLog: Array.isArray(parsed.outreachLog) ? parsed.outreachLog : [],
      proposals: Array.isArray(parsed.proposals) ? parsed.proposals : [],
      escalations: Array.isArray(parsed.escalations) ? parsed.escalations : [],
      upgrades: Array.isArray(parsed.upgrades) ? parsed.upgrades : [],
    };
  } catch {
    return {
      killSwitch: false,
      aggressiveness: "balanced",
      frozenAccounts: [],
      outreachLog: [],
      proposals: [],
      escalations: [],
      upgrades: [],
    };
  }
}

function writeStore(next) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REVENUE_AUTONOMY_KEY, JSON.stringify(next));
  } catch {
    // best effort persistence
  }
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function buildOutreachSequence(persona = "", aggressiveness = "balanced") {
  const p = String(persona || "").toLowerCase();
  const intensity = {
    conservative: ["email", "linkedin"],
    balanced: ["email", "linkedin", "sms"],
    assertive: ["email", "linkedin", "sms", "voice"],
  }[aggressiveness] || ["email", "linkedin", "sms"];

  if (p.includes("owner")) {
    return intensity.map((channel) => ({
      channel,
      tone: "executive-roi",
      message: "Quantify overhead recovery, compliance risk reduction, and enterprise licensing upside.",
    }));
  }

  if (p.includes("contractor")) {
    return intensity.map((channel) => ({
      channel,
      tone: "technical-confidence",
      message: "Show schedule certainty, field quality evidence, and Academy credential throughput.",
    }));
  }

  return intensity.map((channel) => ({
    channel,
    tone: "operational-improvement",
    message: "Lead with certification velocity, crew readiness, and predictable cash conversion.",
  }));
}

export function evaluateRevenueConstraints(lead = {}, governance = adminGovernance) {
  const module26 = governance?.module26RevenueAutonomy || {};
  const constraints = module26?.strategyConstraints || {};

  const annualRevenue = toNumber(lead.annualRevenueUsd || lead.metadata?.annualRevenueUsd || 0);
  const margin = toNumber(lead.estimatedMarginPct || lead.marginPct || 0);

  const annualRevenueFloor = toNumber(constraints.minimumTargetAnnualRevenueUsd || 5000000);
  const marginFloor = toNumber(constraints.minimumBidMarginPct || 12);

  const passed = annualRevenue >= annualRevenueFloor && margin >= marginFloor;
  const reasons = [];
  if (annualRevenue < annualRevenueFloor) reasons.push(`annualRevenueUsd below ${annualRevenueFloor}`);
  if (margin < marginFloor) reasons.push(`estimatedMarginPct below ${marginFloor}`);

  return {
    passed,
    annualRevenue,
    margin,
    annualRevenueFloor,
    marginFloor,
    reasons,
  };
}

export function runAutonomousProspecting(lead = {}, governance = adminGovernance) {
  const constraints = evaluateRevenueConstraints(lead, governance);
  const store = readStore();

  if (store.killSwitch) {
    return {
      ok: false,
      status: "blocked-killswitch",
      message: "Global revenue kill-switch is active.",
    };
  }

  if (store.frozenAccounts.includes(lead.id || lead.company)) {
    return {
      ok: false,
      status: "blocked-account-freeze",
      message: "Account is frozen by governance.",
    };
  }

  if (!constraints.passed) {
    return {
      ok: false,
      status: "blocked-constraints",
      message: `Prospect failed strategy constraints: ${constraints.reasons.join(", ")}`,
      constraints,
    };
  }

  const sequence = buildOutreachSequence(lead.persona, store.aggressiveness);
  const outreach = {
    id: `outreach-${Date.now()}`,
    leadId: lead.id || lead.leadId || `lead-${Date.now()}`,
    company: lead.company || "Unknown",
    sequence,
    startedAt: nowIso(),
    status: "initiated",
  };

  writeStore({
    ...store,
    outreachLog: [outreach, ...store.outreachLog].slice(0, 1500),
  });

  return {
    ok: true,
    status: "initiated",
    outreach,
    constraints,
  };
}

export function generateDynamicValueCase(lead = {}, enterprise = {}) {
  const headcount = toNumber(lead.employeeCount || enterprise.employeeCount || 0) || 50;
  const adminHours = toNumber(enterprise.adminHoursWeekly || 14);
  const loadedRate = toNumber(enterprise.loadedLaborRateUsd || 85);
  const inefficiencyPct = toNumber(enterprise.schedulingInefficiencyPct || 18);
  const weeks = toNumber(enterprise.analysisWeeks || 52);

  const annualOverheadLeakage = Math.round(headcount * adminHours * loadedRate * (inefficiencyPct / 100) * (weeks / 52));
  const academyWeeks = toNumber(enterprise.academyCertificationWeeks || 3) || 3;
  const expectedRecoveryPct = toNumber(enterprise.expectedRecoveryPct || 38);
  const annualRecoveredUsd = Math.round(annualOverheadLeakage * (expectedRecoveryPct / 100));

  return {
    headline: `${lead.company || "Prospect"} can recover approximately $${annualRecoveredUsd.toLocaleString()} annually with Auricrux operations plus Academy acceleration.`,
    annualOverheadLeakage,
    annualRecoveredUsd,
    academyCertificationWeeks: academyWeeks,
    assumptions: {
      headcount,
      adminHours,
      loadedRate,
      inefficiencyPct,
      expectedRecoveryPct,
    },
  };
}

export function generateProposalAsApi(lead = {}, valueCase = {}, governance = adminGovernance) {
  const constraints = evaluateRevenueConstraints(lead, governance);
  const store = readStore();

  const proposal = {
    id: `proposal-${Date.now()}`,
    leadId: lead.id || lead.leadId || "unknown",
    company: lead.company || "Unknown",
    generatedAt: nowIso(),
    status: constraints.passed ? "draft-ready" : "blocked-by-strategy",
    strategyCompliance: constraints,
    valueCase,
    proposalSections: [
      "Executive ROI Summary",
      "Operational Baseline and Risk Map",
      "Academy Certification Ramp Plan",
      "Governance and Compliance Envelope",
      "Commercial Terms and License Path",
    ],
    legalSignatureRequired: true,
  };

  writeStore({
    ...store,
    proposals: [proposal, ...store.proposals].slice(0, 1000),
  });

  return proposal;
}

export function runRevenueFlywheel(lead = {}, academy = {}, governanceSignals = {}) {
  const academyCompleted = Boolean(academy.completed || academy.certificationCompleted);
  const complianceOk = governanceSignals.complianceStatus !== "blocked";

  const upgrade = {
    id: `upgrade-${Date.now()}`,
    leadId: lead.id || lead.leadId || "unknown",
    company: lead.company || "Unknown",
    academyCompleted,
    complianceOk,
    result: academyCompleted && complianceOk ? "enterprise-licensee" : "pending",
    evaluatedAt: nowIso(),
  };

  const store = readStore();
  writeStore({
    ...store,
    upgrades: [upgrade, ...store.upgrades].slice(0, 1000),
  });

  return upgrade;
}

export function assessHighStakesRelationshipRisk(lead = {}, relationshipSignals = {}, governance = adminGovernance) {
  const protocol = governance?.module26RevenueAutonomy?.humanEscalationProtocol || {};
  const threshold = toNumber(protocol.riskThresholdScore || 75);

  const dealSize = toNumber(lead.estimatedValue || 0);
  const negativeTouches = toNumber(relationshipSignals.negativeTouches || 0);
  const legalComplexity = toNumber(relationshipSignals.legalComplexityScore || 0);
  const sentimentPenalty = String(relationshipSignals.sentiment || "neutral").toLowerCase() === "negative" ? 25 : 0;
  const prSensitivityTag = normalize(relationshipSignals.prSensitivityTag || lead.prSensitivityTag || "standard");
  const prPenalty = {
    low: 0,
    standard: 8,
    medium: 12,
    high: 22,
    critical: 30,
  }[prSensitivityTag] ?? 8;

  const riskScore = Math.min(100, Math.round((dealSize / 1000000) * 10 + negativeTouches * 8 + legalComplexity * 0.4 + sentimentPenalty + prPenalty));
  const needsEscalation = riskScore >= threshold;

  return {
    needsEscalation,
    riskScore,
    threshold,
    prSensitivityTag,
  };
}

export function scheduleFounderEscalation(lead = {}, reason = "high-stakes-relationship", governance = adminGovernance) {
  const protocol = governance?.module26RevenueAutonomy?.humanEscalationProtocol || {};
  const founder = protocol.defaultEscalationOwner || "Founder";
  const leadId = lead.id || lead.leadId || "unknown";

  const meeting = {
    id: `meeting-${Date.now()}`,
    leadId,
    company: lead.company || "Unknown",
    owner: founder,
    reason,
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: nowIso(),
    channel: "executive-briefing",
    status: "scheduled",
  };

  const store = readStore();
  writeStore({
    ...store,
    escalations: [meeting, ...store.escalations].slice(0, 500),
  });

  return meeting;
}

export function updateRevenueGovernanceControls(patch = {}) {
  const store = readStore();
  const next = {
    ...store,
    killSwitch: typeof patch.killSwitch === "boolean" ? patch.killSwitch : store.killSwitch,
    aggressiveness: patch.aggressiveness || store.aggressiveness || "balanced",
    frozenAccounts: Array.isArray(patch.frozenAccounts) ? patch.frozenAccounts : store.frozenAccounts,
  };
  writeStore(next);
  return next;
}

export function readRevenueAutonomyState() {
  return readStore();
}
