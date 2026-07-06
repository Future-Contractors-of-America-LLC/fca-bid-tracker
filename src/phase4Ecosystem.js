import { adminGovernance } from "./adminGovernance.js";

const PHASE4_STORE_KEY = "fca_auricrux_phase4_marketplace_v1";

function readPhase4Store() {
  if (typeof window === "undefined") {
    return { personas: [], insights: [], passports: [], certificates: [] };
  }

  try {
    const raw = window.localStorage.getItem(PHASE4_STORE_KEY);
    if (!raw) return { personas: [], insights: [], passports: [], certificates: [] };
    const parsed = JSON.parse(raw);
    return {
      personas: Array.isArray(parsed.personas) ? parsed.personas : [],
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      passports: Array.isArray(parsed.passports) ? parsed.passports : [],
      certificates: Array.isArray(parsed.certificates) ? parsed.certificates : [],
    };
  } catch {
    return { personas: [], insights: [], passports: [], certificates: [] };
  }
}

function writePhase4Store(next) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PHASE4_STORE_KEY, JSON.stringify(next));
  } catch {
    // best effort persistence
  }
}

function nowIso() {
  return new Date().toISOString();
}

function stableHash(input) {
  const text = String(input || "");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `fca-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function isMarginConstitutionCompliant(manifest = {}) {
  const threshold = Number(adminGovernance?.triadPilot?.minimumMarginThresholdPct || 14);
  const personaThreshold = Number(manifest.marginReviewThresholdPct || threshold);
  return personaThreshold >= threshold;
}

export function runSandboxValidation(manifest = {}, simulation = {}) {
  const violations = [];

  if (!manifest.id) violations.push("manifest.id is required");
  if (!manifest.title) violations.push("manifest.title is required");
  if (!manifest.instructions) violations.push("manifest.instructions are required");
  if (!manifest.capabilities || !Array.isArray(manifest.capabilities) || manifest.capabilities.length === 0) {
    violations.push("manifest.capabilities must include at least one capability");
  }

  if (!isMarginConstitutionCompliant(manifest)) {
    violations.push("persona margin threshold violates constitutional minimum margin rule");
  }

  if (manifest.requiresDirectProdWrite === true) {
    violations.push("persona cannot request direct production write access during sandbox validation");
  }

  const prompts = Array.isArray(simulation.prompts) ? simulation.prompts : [];
  const responseSet = Array.isArray(simulation.responses) ? simulation.responses : [];
  if (prompts.length && responseSet.length && prompts.length !== responseSet.length) {
    violations.push("simulation prompts/responses count mismatch");
  }

  const score = Math.max(0, 100 - violations.length * 20);
  return {
    ok: violations.length === 0,
    score,
    violations,
    sandboxRunId: `sandbox-${Date.now()}`,
    checkedAt: nowIso(),
  };
}

export function submitMarketplacePersona(manifest = {}, simulation = {}, submittedBy = "unknown") {
  const result = runSandboxValidation(manifest, simulation);
  const store = readPhase4Store();

  const record = {
    id: `persona-${Date.now()}`,
    submittedBy,
    manifest,
    status: result.ok ? "approved" : "rejected",
    sandbox: result,
    submittedAt: nowIso(),
  };

  writePhase4Store({
    ...store,
    personas: [record, ...store.personas].slice(0, 400),
  });

  return record;
}

function redactPii(sample = {}) {
  const blockedKeys = new Set(["companyName", "workerName", "email", "phone", "address", "projectName"]);
  return Object.entries(sample).reduce((acc, [key, value]) => {
    if (blockedKeys.has(key)) return acc;
    acc[key] = value;
    return acc;
  }, {});
}

export function publishFederatedInsight(sample = {}) {
  const store = readPhase4Store();
  const anonymized = redactPii(sample);

  const insight = {
    id: `insight-${Date.now()}`,
    workflowKey: anonymized.workflowKey || "unspecified",
    technique: anonymized.technique || "unspecified",
    observedDeltaPct: Number(anonymized.observedDeltaPct || 0),
    confidence: Number(anonymized.confidence || 0),
    payload: anonymized,
    publishedAt: nowIso(),
  };

  writePhase4Store({
    ...store,
    insights: [insight, ...store.insights].slice(0, 1000),
  });

  return insight;
}

export function issueTalentPassport(profile = {}, certifications = [], auditTrail = []) {
  const normalizedCerts = Array.isArray(certifications) ? certifications : [];
  const normalizedAudit = Array.isArray(auditTrail) ? auditTrail : [];

  const passport = {
    passportId: `passport-${Date.now()}`,
    workerId: profile.workerId || "unknown-worker",
    role: profile.role || "unknown-role",
    certifications: normalizedCerts,
    verifiedPerformanceSignals: normalizedAudit.map((row) => ({
      eventType: row.eventType || row.type || "unknown",
      timestamp: row.timestamp || nowIso(),
      score: Number(row.score || 0),
    })).slice(0, 500),
    issuedAt: nowIso(),
  };

  passport.provenanceHash = stableHash(JSON.stringify({
    workerId: passport.workerId,
    certifications: passport.certifications,
    verifiedPerformanceSignals: passport.verifiedPerformanceSignals,
    issuedAt: passport.issuedAt,
  }));

  const store = readPhase4Store();
  writePhase4Store({
    ...store,
    passports: [passport, ...store.passports].slice(0, 1000),
  });

  return passport;
}

export function issueComplianceCertificate(projectId, requirements = [], eventStream = []) {
  const required = Array.isArray(requirements) ? requirements : [];
  const observed = Array.isArray(eventStream) ? eventStream : [];

  const unmet = required.filter((rule) => !observed.some((evt) => String(evt.type || evt.eventType || "") === String(rule.eventType || "")));

  const certificate = {
    certificateId: `compliance-${Date.now()}`,
    projectId: projectId || "unknown-project",
    requirementCount: required.length,
    observedEventCount: observed.length,
    unmetRequirements: unmet,
    passed: unmet.length === 0,
    issuedAt: nowIso(),
  };

  certificate.proofHash = stableHash(JSON.stringify({
    projectId: certificate.projectId,
    requirementCount: certificate.requirementCount,
    observedEventCount: certificate.observedEventCount,
    unmetRequirements: certificate.unmetRequirements,
    issuedAt: certificate.issuedAt,
  }));

  const store = readPhase4Store();
  writePhase4Store({
    ...store,
    certificates: [certificate, ...store.certificates].slice(0, 1000),
  });

  return certificate;
}
