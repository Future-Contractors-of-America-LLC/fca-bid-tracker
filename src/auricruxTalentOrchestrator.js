import { adminGovernance } from "./adminGovernance.js";

const TALENT_ORCHESTRATOR_KEY = "fca_auricrux_talent_orchestrator_v1";

function nowIso() {
  return new Date().toISOString();
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function readStore() {
  if (typeof window === "undefined") {
    return {
      screenings: [],
      hires: [],
      dossiers: [],
      cultureWeights: {
        safetyOwnership: 0.35,
        accountability: 0.35,
        teamHumility: 0.30,
      },
    };
  }

  try {
    const raw = window.localStorage.getItem(TALENT_ORCHESTRATOR_KEY);
    if (!raw) {
      return {
        screenings: [],
        hires: [],
        dossiers: [],
        cultureWeights: {
          safetyOwnership: 0.35,
          accountability: 0.35,
          teamHumility: 0.30,
        },
      };
    }

    const parsed = JSON.parse(raw);
    return {
      screenings: Array.isArray(parsed.screenings) ? parsed.screenings : [],
      hires: Array.isArray(parsed.hires) ? parsed.hires : [],
      dossiers: Array.isArray(parsed.dossiers) ? parsed.dossiers : [],
      cultureWeights: parsed.cultureWeights || {
        safetyOwnership: 0.35,
        accountability: 0.35,
        teamHumility: 0.30,
      },
    };
  } catch {
    return {
      screenings: [],
      hires: [],
      dossiers: [],
      cultureWeights: {
        safetyOwnership: 0.35,
        accountability: 0.35,
        teamHumility: 0.30,
      },
    };
  }
}

function writeStore(next) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TALENT_ORCHESTRATOR_KEY, JSON.stringify(next));
  } catch {
    // best effort persistence only
  }
}

export function evaluateCultureAlignment(candidate = {}, governance = adminGovernance, overrides = null) {
  const module27 = governance?.module27TalentAutonomy || {};
  const principles = module27.behavioralPrinciples || {
    safetyOwnership: "Own jobsite safety as a personal standard.",
    accountability: "Close loops without supervision.",
    teamHumility: "Elevate team outcomes above ego.",
  };

  const weights = overrides || readStore().cultureWeights;
  const signals = {
    safetyOwnership: toNumber(candidate.culturalSignals?.safetyOwnership || candidate.culturalFit || 0),
    accountability: toNumber(candidate.culturalSignals?.accountability || candidate.culturalFit || 0),
    teamHumility: toNumber(candidate.culturalSignals?.teamHumility || candidate.culturalFit || 0),
  };

  const weighted = Math.round(
    (signals.safetyOwnership * toNumber(weights.safetyOwnership || 0.35))
    + (signals.accountability * toNumber(weights.accountability || 0.35))
    + (signals.teamHumility * toNumber(weights.teamHumility || 0.30)),
  );

  return {
    principles,
    weights,
    signals,
    score: Math.max(0, Math.min(100, weighted)),
  };
}

export function checkCredentialGate(candidate = {}, governance = adminGovernance) {
  const module27 = governance?.module27TalentAutonomy || {};
  const required = module27.credentialGate?.requiredCoreCertification || "FCA Core Certification";
  const certs = Array.isArray(candidate.certifications) ? candidate.certifications : [];
  const pass = certs.some((cert) => normalize(cert).includes(normalize(required)) || normalize(cert).includes("fca core"));

  return {
    pass,
    required,
    current: certs,
  };
}

export function computeFutureCapacityDemand(schedule = [], horizonMonths = 6) {
  const horizonMs = Math.max(1, toNumber(horizonMonths)) * 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const futureRows = (Array.isArray(schedule) ? schedule : []).filter((row) => {
    const rawDate = row.date || row.dueDate || row.updatedAt || row.createdAt;
    const parsed = Date.parse(rawDate || "");
    if (!Number.isFinite(parsed)) return false;
    return parsed >= now && parsed <= now + horizonMs;
  });

  const roleHints = ["electric", "superintendent", "foreman", "operator", "safety", "bim"];
  const roleDemand = {};
  for (const row of futureRows) {
    const text = normalize(`${row.task || ""} ${row.title || ""} ${row.zone || ""} ${row.status || ""}`);
    for (const role of roleHints) {
      if (text.includes(role)) {
        roleDemand[role] = (roleDemand[role] || 0) + 1;
      }
    }
  }

  return {
    horizonMonths: Math.max(1, toNumber(horizonMonths)),
    futureRows: futureRows.length,
    roleDemand,
    summary: Object.entries(roleDemand)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([role, count]) => `${role}:${count}`),
  };
}

export function runZeroTouchInterview(candidate = {}, requiredCerts = [], governance = adminGovernance, cultureWeightOverrides = null) {
  const credentialGate = checkCredentialGate(candidate, governance);
  const culture = evaluateCultureAlignment(candidate, governance, cultureWeightOverrides);

  const certs = Array.isArray(candidate.certifications) ? candidate.certifications : [];
  const matches = (Array.isArray(requiredCerts) ? requiredCerts : []).filter((required) =>
    certs.some((owned) => normalize(owned).includes(normalize(required))),
  ).length;

  const certCoverage = requiredCerts.length ? Math.round((matches / requiredCerts.length) * 100) : 85;
  const skillFit = toNumber(candidate.skillFit || 0);
  const retention = toNumber(candidate.retentionLikelihood || 0);

  const goScore = Math.round((skillFit * 0.4) + (culture.score * 0.3) + (certCoverage * 0.2) + (retention * 0.1));
  const zeroTouchEligible = goScore >= 95 && credentialGate.pass;

  const screening = {
    id: `screen-${Date.now()}`,
    candidateId: candidate.id || "unknown",
    candidateName: candidate.name || "Unknown",
    goScore,
    zeroTouchEligible,
    credentialGate,
    culture,
    certCoverage,
    screenedAt: nowIso(),
  };

  const store = readStore();
  writeStore({
    ...store,
    screenings: [screening, ...store.screenings].slice(0, 1500),
  });

  return screening;
}

export function planAutonomousOnboarding(candidate = {}, projects = [], tasks = []) {
  const project = (Array.isArray(projects) ? projects : [])[0] || null;
  const task = (Array.isArray(tasks) ? tasks : []).find((row) => {
    const text = normalize(`${row.task || ""} ${row.title || ""}`);
    const certs = Array.isArray(candidate.certifications) ? candidate.certifications.map(normalize) : [];
    return certs.some((cert) => text.includes(cert.split(" ")[0] || ""));
  }) || (Array.isArray(tasks) ? tasks[0] : null);

  return {
    credentialProvisioning: "queued",
    projectAssignment: project ? { id: project.id, name: project.name || project.id } : null,
    firstTaskAssignment: task ? { id: task.id || task.taskId || "task-unknown", name: task.task || task.title || "First task" } : null,
    onboardingReadyAt: nowIso(),
  };
}

export function createContextualDossier(candidate = {}, scenario = {}, recommendations = []) {
  const dossier = {
    id: `dossier-${Date.now()}`,
    candidateId: candidate.id || "unknown",
    candidateName: candidate.name || "Unknown",
    scenarioType: scenario.type || "sensitive-hr-case",
    scenarioSummary: scenario.summary || "Sensitive workforce scenario requires executive decision.",
    dataPoints: scenario.dataPoints || {},
    recommendedPaths: (recommendations || []).slice(0, 3),
    generatedAt: nowIso(),
  };

  const store = readStore();
  writeStore({
    ...store,
    dossiers: [dossier, ...store.dossiers].slice(0, 500),
  });

  return dossier;
}

export function shouldEscalateToFounder(params = {}, governance = adminGovernance) {
  const protocol = governance?.module27TalentAutonomy?.humanEscalationProtocol || {};
  const salary = toNumber(params.salaryNegotiationAmountUsd || 0);
  const salaryThreshold = toNumber(protocol.salaryNegotiationThresholdUsd || 150000);

  const disciplinary = Boolean(params.performanceDisciplinary);
  const cultureDispute = Boolean(params.cultureFitDispute);
  const complexSalary = salary >= salaryThreshold;

  return {
    escalate: disciplinary || cultureDispute || complexSalary,
    reasons: [
      disciplinary ? "performance-disciplinary" : "",
      cultureDispute ? "culture-fit-dispute" : "",
      complexSalary ? "complex-salary-negotiation" : "",
    ].filter(Boolean),
    salaryThreshold,
  };
}

export function buildStewardshipSignals(worker = {}, messagesSentiment = {}, audit = {}) {
  const utilization = toNumber(worker.utilizationPct || 0);
  const underUtilized = utilization > 0 && utilization < 60;
  const burnoutRisk = String(messagesSentiment.sentiment || "neutral").toLowerCase() === "negative" && toNumber(worker.hoursPerWeek || 0) >= 55;

  const upskillingPath = underUtilized
    ? ["Advanced Field Safety Leadership", "Critical Path Recovery", "Crew Productivity Management"]
    : ["Role-aligned continuation path"];

  return {
    underUtilized,
    burnoutRisk,
    upskillingPath,
    auditSignal: audit.summary || "No adverse audit signal",
  };
}

export function setCultureWeights(weights = {}) {
  const store = readStore();
  const next = {
    ...store,
    cultureWeights: {
      safetyOwnership: Math.max(0, Math.min(1, toNumber(weights.safetyOwnership || store.cultureWeights.safetyOwnership))),
      accountability: Math.max(0, Math.min(1, toNumber(weights.accountability || store.cultureWeights.accountability))),
      teamHumility: Math.max(0, Math.min(1, toNumber(weights.teamHumility || store.cultureWeights.teamHumility))),
    },
  };

  writeStore(next);
  return next;
}

export function readTalentOrchestratorState() {
  return readStore();
}
