import {
  submitMarketplacePersona,
  publishFederatedInsight,
  issueTalentPassport,
  issueComplianceCertificate,
} from "./phase4Ecosystem.js";

const TRIAD_STATE_KEY = "fca_auricrux_triad_state_v1";
const TRIAD_EVENT_KEY = "fca_auricrux_triad_event";

export const TRIAD_EVENT_TYPES = {
  LEAD_REJECTED_MARGIN: "triad.lead.rejected_margin",
  LEAD_WON: "triad.lead.won",
  FINANCE_BUDGET_INITIALIZED: "triad.finance.budget_initialized",
  FILES_WORKSPACE_CREATED: "triad.files.workspace_created",
  FIELD_GUARDIAN_ASSIGNED: "triad.field.guardian_assigned",
  FIELD_MILESTONE_COMPLETED: "triad.field.milestone_completed",
  FIELD_BUDGET_GUARDRAIL_BREACH: "triad.field.budget_guardrail_breach",
  PROJECT_SCOPE_CLARIFICATION_DRAFTED: "triad.project.scope_clarification_drafted",
  FINANCE_PAYAPP_DRAFTED: "triad.finance.payapp_drafted",
  FINANCE_INVOICE_BLOCKED: "triad.finance.invoice_blocked",
  FINANCE_INVOICE_READY: "triad.finance.invoice_ready",
  FINANCE_CASH_COLLECTED: "triad.finance.cash_collected",
  PERSONA_DECISION_ENQUEUED: "triad.persona.decision_enqueued",
  PERSONA_DECISION_APPROVED: "triad.persona.decision_approved",
  PERSONA_DECISION_OVERRIDDEN: "triad.persona.decision_overridden",
  PERSONA_WEIGHT_UPDATED: "triad.persona.weight_updated",
  SAFETY_INCIDENT_DETECTED: "triad.safety.incident_detected",
  FIELD_TASK_STOPPED: "triad.field.task_stopped",
  COMMUNICATION_ALERTED: "triad.communication.alerted",
  CHANGE_ORDER_INITIATED: "triad.finance.change_order_initiated",
  AUDIT_BLACKBOX_LOGGED: "triad.audit.blackbox_logged",
  MARKETPLACE_PERSONA_SUBMITTED: "triad.marketplace.persona_submitted",
  MARKETPLACE_PERSONA_APPROVED: "triad.marketplace.persona_approved",
  MARKETPLACE_PERSONA_REJECTED: "triad.marketplace.persona_rejected",
  FEDERATED_INSIGHT_PUBLISHED: "triad.federated.insight_published",
  TALENT_PASSPORT_ISSUED: "triad.talent.passport_issued",
  COMPLIANCE_CERTIFICATE_ISSUED: "triad.compliance.certificate_issued",
};

export const PERSONA_MANIFESTS = {
  estimator: {
    id: "estimator",
    title: "Estimator Persona",
    instructions: "Review incoming bid request. Analyze historical cost data from project X. Identify the most economical subcontractors for this scope. Draft the bid and flag for human review if margin < 15%.",
    marginReviewThresholdPct: 15,
    weights: {
      costEfficiency: 0.45,
      riskControl: 0.3,
      scheduleConfidence: 0.25,
    },
  },
  fieldGuardian: {
    id: "fieldGuardian",
    title: "Field Guardian Persona",
    instructions: "Monitor daily logs. If progress in a zone falls 10% behind critical path, draft a resource-shift proposal and ping the superintendent.",
    criticalPathLagThresholdPct: 10,
    weights: {
      scheduleRecovery: 0.4,
      safetyAssurance: 0.35,
      crewUtilization: 0.25,
    },
  },
  governance: {
    id: "governance",
    title: "Governance Persona",
    instructions: "Review every outbound payment. If insurance certificates are expired, block payment and draft a Notice to Correct email to the vendor.",
    requiresInsuranceCertificate: true,
    weights: {
      compliance: 0.5,
      cashProtection: 0.3,
      vendorReliability: 0.2,
    },
  },
};

export const TRIAD_JOB_SCHEMA = {
  id: "job-<leadId>",
  lead: {
    leadId: "string",
    status: "Won",
    company: "string",
    contact: "string",
    sourceChannel: "string",
    estimatedValue: "number",
    estimatedMarginPct: "number",
    executiveOverride: "boolean",
  },
  project: {
    projectId: "string",
    status: "Setup|Active|Paused",
    workspaceFolders: ["01-Commercial", "02-Execution", "03-Finance", "04-Closeout"],
    aiPersona: "Field Guardian",
    criticalPathStatus: "On Track|At Risk",
  },
  field: {
    milestones: [
      {
        taskId: "string",
        taskName: "string",
        completedAt: "ISO-8601",
        loggedHours: "number",
        budgetHours: "number",
        photoVerified: "boolean",
        digitalSignature: "string",
      },
    ],
    paused: "boolean",
  },
  finance: {
    budgetEstimateUsd: "number",
    payApps: [
      {
        id: "string",
        amountUsd: "number",
        status: "Draft|Ready|Blocked|Collected",
        verification: {
          workLogged: "boolean",
          photoVerified: "boolean",
          withinBudget: "boolean",
          digitalSignature: "boolean",
        },
      },
    ],
    billedUsd: "number",
    collectedUsd: "number",
  },
  governance: {
    minimumMarginThresholdPct: "number",
    events: "array",
  },
};

function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort persistence
  }
}

function nowIso() {
  return new Date().toISOString();
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function seedState() {
  return {
    version: "phase3",
    updatedAt: nowIso(),
    jobs: {},
    events: [],
    handoffLog: [],
    decisionQueue: [],
    personaManifests: PERSONA_MANIFESTS,
    marketplaceSubmissions: [],
    federatedInsights: [],
    talentPassports: [],
    complianceCertificates: [],
  };
}

export function readTriadState() {
  const state = readJson(TRIAD_STATE_KEY, seedState());
  if (!state || typeof state !== "object") return seedState();
  if (!state.jobs || typeof state.jobs !== "object") state.jobs = {};
  if (!Array.isArray(state.events)) state.events = [];
  if (!Array.isArray(state.handoffLog)) state.handoffLog = [];
  if (!Array.isArray(state.decisionQueue)) state.decisionQueue = [];
  if (!state.personaManifests || typeof state.personaManifests !== "object") {
    state.personaManifests = PERSONA_MANIFESTS;
  }
  if (!Array.isArray(state.marketplaceSubmissions)) state.marketplaceSubmissions = [];
  if (!Array.isArray(state.federatedInsights)) state.federatedInsights = [];
  if (!Array.isArray(state.talentPassports)) state.talentPassports = [];
  if (!Array.isArray(state.complianceCertificates)) state.complianceCertificates = [];
  if (!state.updatedAt) state.updatedAt = nowIso();
  return state;
}

function appendHandoff(stage, payload) {
  return writeTriadState((current) => ({
    ...current,
    handoffLog: [
      {
        id: `handoff-${Math.random().toString(36).slice(2, 10)}`,
        stage,
        timestamp: nowIso(),
        payload,
      },
      ...(current.handoffLog || []),
    ].slice(0, 300),
  }));
}

function enqueueDecision({ personaId, projectId, title, actionType, payload, recommendedAction }) {
  const decision = {
    id: `decision-${Math.random().toString(36).slice(2, 10)}`,
    personaId,
    projectId,
    title,
    actionType,
    payload,
    recommendedAction,
    status: "pending",
    createdAt: nowIso(),
    resolvedAt: "",
    overrideReason: "",
  };

  writeTriadState((current) => ({
    ...current,
    decisionQueue: [decision, ...(current.decisionQueue || [])].slice(0, 400),
  }));

  appendEvent(TRIAD_EVENT_TYPES.PERSONA_DECISION_ENQUEUED, {
    decisionId: decision.id,
    personaId,
    projectId,
    actionType,
    title,
  });

  return decision;
}

function adjustPersonaWeights(personaId, overrideReason = "") {
  const normalized = String(overrideReason || "").toLowerCase();
  const state = readTriadState();
  const manifests = state.personaManifests || PERSONA_MANIFESTS;
  const current = manifests[personaId];
  if (!current || !current.weights) return;

  const nextWeights = { ...current.weights };

  if (normalized.includes("relationship") || normalized.includes("client")) {
    nextWeights.riskControl = Math.min(0.6, (nextWeights.riskControl || 0) + 0.04);
    nextWeights.costEfficiency = Math.max(0.25, (nextWeights.costEfficiency || 0) - 0.02);
  }
  if (normalized.includes("schedule") || normalized.includes("delay")) {
    nextWeights.scheduleRecovery = Math.min(0.55, (nextWeights.scheduleRecovery || 0) + 0.05);
  }
  if (normalized.includes("compliance") || normalized.includes("certificate") || normalized.includes("insurance")) {
    nextWeights.compliance = Math.min(0.65, (nextWeights.compliance || 0) + 0.05);
  }

  writeTriadState((base) => ({
    ...base,
    personaManifests: {
      ...(base.personaManifests || PERSONA_MANIFESTS),
      [personaId]: {
        ...current,
        weights: nextWeights,
        lastWeightUpdateAt: nowIso(),
      },
    },
  }));

  appendEvent(TRIAD_EVENT_TYPES.PERSONA_WEIGHT_UPDATED, {
    personaId,
    reason: overrideReason || "override-feedback",
    nextWeights,
  });
}

function writeTriadState(mutator) {
  const current = readTriadState();
  const next = typeof mutator === "function" ? mutator(current) : current;
  next.updatedAt = nowIso();
  writeJson(TRIAD_STATE_KEY, next);
  return next;
}

function appendEvent(type, payload) {
  const event = {
    id: `evt-${Math.random().toString(36).slice(2, 10)}`,
    type,
    timestamp: nowIso(),
    payload,
  };

  const state = writeTriadState((current) => ({
    ...current,
    events: [event, ...(current.events || [])].slice(0, 500),
  }));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TRIAD_EVENT_KEY, { detail: event }));
  }

  return { event, state };
}

export function subscribeTriadEvents(callback) {
  if (typeof window === "undefined") return () => {};
  const handler = (event) => callback(event.detail);
  window.addEventListener(TRIAD_EVENT_KEY, handler);
  return () => window.removeEventListener(TRIAD_EVENT_KEY, handler);
}

function defaultWorkspaceFolders(projectId) {
  return [
    `${projectId}/01-Commercial/Leads`,
    `${projectId}/02-Execution/Field-Tasks`,
    `${projectId}/03-Finance/Pay-Apps`,
    `${projectId}/04-Closeout/Evidence`,
  ];
}

function buildJobFromLead(lead, minimumMarginThresholdPct, executiveOverride) {
  const leadId = lead.leadId || lead.id || `lead-${Date.now()}`;
  const projectId = lead.opportunityId || `PRJ-${leadId}`;
  const estimatedValue = toNumber(lead.estimatedValue || lead.value || 0);
  const estimatedMarginPct = toNumber(lead.estimatedMarginPct || lead.marginPct || 0);

  return {
    id: `job-${leadId}`,
    createdAt: nowIso(),
    lead: {
      leadId,
      status: "Won",
      company: lead.company || "Unknown Company",
      contact: lead.contact || "Unknown Contact",
      sourceChannel: lead.sourceChannel || "unknown",
      estimatedValue,
      estimatedMarginPct,
      executiveOverride: Boolean(executiveOverride),
    },
    project: {
      projectId,
      status: "Setup",
      workspaceFolders: defaultWorkspaceFolders(projectId),
      aiPersona: "Field Guardian",
      criticalPathStatus: "On Track",
    },
    field: {
      milestones: [],
      paused: false,
    },
    finance: {
      budgetEstimateUsd: estimatedValue,
      payApps: [],
      billedUsd: 0,
      collectedUsd: 0,
    },
    governance: {
      minimumMarginThresholdPct,
      events: [],
    },
  };
}

export function executeLeadWonHandoff(lead, options = {}) {
  const minimumMarginThresholdPct = toNumber(options.minimumMarginThresholdPct || 14);
  const executiveOverride = Boolean(options.executiveOverride);
  const estimatedMarginPct = toNumber(lead?.estimatedMarginPct || lead?.marginPct || 0);

  if (estimatedMarginPct < minimumMarginThresholdPct && !executiveOverride) {
    appendEvent(TRIAD_EVENT_TYPES.LEAD_REJECTED_MARGIN, {
      leadId: lead?.leadId || lead?.id || "unknown",
      estimatedMarginPct,
      minimumMarginThresholdPct,
      reason: "Lead rejected by constitutional minimum margin threshold.",
    });

    return {
      ok: false,
      reason: "minimum-margin-threshold",
      message: `Lead rejected: estimated margin ${estimatedMarginPct.toFixed(1)}% is below minimum ${minimumMarginThresholdPct.toFixed(1)}%.`,
    };
  }

  const job = buildJobFromLead(lead, minimumMarginThresholdPct, executiveOverride);

  writeTriadState((current) => ({
    ...current,
    jobs: {
      ...current.jobs,
      [job.project.projectId]: job,
    },
  }));

  appendEvent(TRIAD_EVENT_TYPES.LEAD_WON, {
    projectId: job.project.projectId,
    leadId: job.lead.leadId,
    estimatedValueUsd: job.lead.estimatedValue,
  });
  appendEvent(TRIAD_EVENT_TYPES.FINANCE_BUDGET_INITIALIZED, {
    projectId: job.project.projectId,
    budgetEstimateUsd: job.finance.budgetEstimateUsd,
  });
  appendEvent(TRIAD_EVENT_TYPES.FILES_WORKSPACE_CREATED, {
    projectId: job.project.projectId,
    folders: job.project.workspaceFolders,
  });
  appendEvent(TRIAD_EVENT_TYPES.FIELD_GUARDIAN_ASSIGNED, {
    projectId: job.project.projectId,
    persona: job.project.aiPersona,
  });
  appendHandoff("lead-to-project", {
    projectId: job.project.projectId,
    leadId: job.lead.leadId,
    personas: ["estimator", "fieldGuardian", "governance"],
  });

  return { ok: true, projectId: job.project.projectId, job };
}

export function registerFieldMilestoneCompletion(payload = {}, options = {}) {
  const projectId = payload.projectId;
  if (!projectId) return { ok: false, message: "projectId is required" };

  const loggedHours = toNumber(payload.loggedHours || payload.actualHours || 0);
  const budgetHours = Math.max(1, toNumber(payload.budgetHours || payload.estimatedHours || 1));
  const overrunRatio = loggedHours / budgetHours;
  const overrun = overrunRatio > 1.1;

  const verification = {
    workLogged: loggedHours > 0,
    photoVerified: Boolean(payload.photoVerified),
    withinBudget: !overrun,
    digitalSignature: Boolean(payload.digitalSignature),
  };

  const state = writeTriadState((current) => {
    const existing = current.jobs[projectId] || {
      id: `job-${projectId}`,
      createdAt: nowIso(),
      lead: {
        leadId: payload.leadId || projectId,
        status: "Won",
        company: payload.company || "Unknown",
        contact: "",
        sourceChannel: "manual",
        estimatedValue: toNumber(payload.estimatedValue || 0),
        estimatedMarginPct: 0,
        executiveOverride: false,
      },
      project: {
        projectId,
        status: "Active",
        workspaceFolders: defaultWorkspaceFolders(projectId),
        aiPersona: "Field Guardian",
        criticalPathStatus: "On Track",
      },
      field: {
        milestones: [],
        paused: false,
      },
      finance: {
        budgetEstimateUsd: toNumber(payload.estimatedValue || 0),
        payApps: [],
        billedUsd: 0,
        collectedUsd: 0,
      },
      governance: {
        minimumMarginThresholdPct: toNumber(options.minimumMarginThresholdPct || 14),
        events: [],
      },
    };

    const milestone = {
      taskId: payload.taskId || `task-${Date.now()}`,
      taskName: payload.taskName || "Milestone",
      completedAt: nowIso(),
      loggedHours,
      budgetHours,
      photoVerified: verification.photoVerified,
      digitalSignature: payload.digitalSignature || "",
    };

    const nextPayApp = {
      id: `payapp-${Date.now()}`,
      amountUsd: Math.max(0, toNumber(payload.amountUsd || 0)),
      status: verification.workLogged && verification.photoVerified && verification.withinBudget && verification.digitalSignature ? "Ready" : "Blocked",
      verification,
      createdAt: nowIso(),
      sourceMilestoneTaskId: milestone.taskId,
    };

    const nextJob = {
      ...existing,
      project: {
        ...existing.project,
        status: overrun ? "Paused" : existing.project.status || "Active",
        criticalPathStatus: overrun ? "At Risk" : "On Track",
      },
      field: {
        ...existing.field,
        paused: overrun,
        milestones: [milestone, ...(existing.field?.milestones || [])].slice(0, 200),
      },
      finance: {
        ...existing.finance,
        payApps: [nextPayApp, ...(existing.finance?.payApps || [])].slice(0, 200),
        billedUsd: (existing.finance?.billedUsd || 0) + nextPayApp.amountUsd,
      },
    };

    return {
      ...current,
      jobs: {
        ...current.jobs,
        [projectId]: nextJob,
      },
    };
  });

  appendEvent(TRIAD_EVENT_TYPES.FIELD_MILESTONE_COMPLETED, {
    projectId,
    taskId: payload.taskId || "unknown",
    taskName: payload.taskName || "Milestone",
  });

  if (overrun) {
    appendEvent(TRIAD_EVENT_TYPES.FIELD_BUDGET_GUARDRAIL_BREACH, {
      projectId,
      taskId: payload.taskId || "unknown",
      ratio: Number(overrunRatio.toFixed(2)),
      action: "Work paused and PM alerted.",
    });
    appendEvent(TRIAD_EVENT_TYPES.PROJECT_SCOPE_CLARIFICATION_DRAFTED, {
      projectId,
      draftMemo: `Scope clarification drafted automatically for ${payload.taskName || "milestone"} due to budget hour overrun.` ,
    });
  }

  const job = state.jobs[projectId];
  const payApp = job?.finance?.payApps?.[0];
  if (payApp?.status === "Ready") {
    appendEvent(TRIAD_EVENT_TYPES.FINANCE_PAYAPP_DRAFTED, {
      projectId,
      payAppId: payApp.id,
      amountUsd: payApp.amountUsd,
    });
    appendEvent(TRIAD_EVENT_TYPES.FINANCE_INVOICE_READY, {
      projectId,
      payAppId: payApp.id,
    });
    appendHandoff("field-to-finance", {
      projectId,
      payAppId: payApp.id,
      verification: payApp.verification,
      status: "ready",
    });
  } else {
    appendEvent(TRIAD_EVENT_TYPES.FINANCE_INVOICE_BLOCKED, {
      projectId,
      payAppId: payApp?.id || "unknown",
      verification: payApp?.verification || verification,
      reason: "Financial integrity gate: missing proof-of-work requirements.",
    });
    enqueueDecision({
      personaId: "governance",
      projectId,
      title: "Invoice blocked by financial integrity gate",
      actionType: "invoice-block",
      payload: {
        payAppId: payApp?.id || "unknown",
        verification: payApp?.verification || verification,
      },
      recommendedAction: "Collect missing proof-of-work and digital signature before invoice release.",
    });
  }

  return {
    ok: true,
    overrun,
    projectPaused: overrun,
    verification,
    projectId,
  };
}

export function recordTriadCashCollection(projectId, payAppId, amountUsd) {
  if (!projectId || !payAppId) return { ok: false, message: "projectId and payAppId are required" };

  const state = writeTriadState((current) => {
    const job = current.jobs[projectId];
    if (!job) return current;

    const payApps = (job.finance?.payApps || []).map((payApp) => (
      payApp.id === payAppId
        ? {
            ...payApp,
            status: "Collected",
            collectedAt: nowIso(),
          }
        : payApp
    ));

    const nextJob = {
      ...job,
      finance: {
        ...job.finance,
        payApps,
        collectedUsd: (job.finance?.collectedUsd || 0) + toNumber(amountUsd),
      },
    };

    return {
      ...current,
      jobs: {
        ...current.jobs,
        [projectId]: nextJob,
      },
    };
  });

  appendEvent(TRIAD_EVENT_TYPES.FINANCE_CASH_COLLECTED, {
    projectId,
    payAppId,
    amountUsd: toNumber(amountUsd),
  });

  return { ok: true, state };
}

export function listTriadJobs() {
  const state = readTriadState();
  return Object.values(state.jobs || {});
}

export function listTriadEvents(limit = 40) {
  const state = readTriadState();
  return (state.events || []).slice(0, Math.max(1, limit));
}

export function listTriadHandoffs(limit = 40) {
  const state = readTriadState();
  return (state.handoffLog || []).slice(0, Math.max(1, limit));
}

export function getPersonaManifests() {
  const state = readTriadState();
  return state.personaManifests || PERSONA_MANIFESTS;
}

export function listDecisionQueue() {
  const state = readTriadState();
  return (state.decisionQueue || []).slice();
}

export function resolveDecisionQueueItem(decisionId, resolution = {}) {
  const decision = listDecisionQueue().find((row) => row.id === decisionId);
  if (!decision) return { ok: false, message: "decision not found" };

  const mode = resolution.mode === "override" ? "override" : "approve";
  const overrideReason = String(resolution.overrideReason || "").trim();

  writeTriadState((current) => ({
    ...current,
    decisionQueue: (current.decisionQueue || []).map((row) => {
      if (row.id !== decisionId) return row;
      return {
        ...row,
        status: mode === "override" ? "overridden" : "approved",
        resolvedAt: nowIso(),
        overrideReason,
      };
    }),
  }));

  if (mode === "override") {
    appendEvent(TRIAD_EVENT_TYPES.PERSONA_DECISION_OVERRIDDEN, {
      decisionId,
      personaId: decision.personaId,
      projectId: decision.projectId,
      overrideReason,
    });
    adjustPersonaWeights(decision.personaId, overrideReason);
  } else {
    appendEvent(TRIAD_EVENT_TYPES.PERSONA_DECISION_APPROVED, {
      decisionId,
      personaId: decision.personaId,
      projectId: decision.projectId,
    });
  }

  return { ok: true };
}

export async function orchestratePersonaSignal(signalType, payload = {}) {
  const signal = String(signalType || "").toLowerCase();
  if (signal !== "safety-incident") {
    return { ok: false, message: `Unsupported signal '${signalType}'.` };
  }

  const projectId = payload.projectId || "unmapped-project";
  const taskId = payload.taskId || "unknown-task";
  const incidentNote = payload.note || "Safety incident detected by Field Guardian.";

  appendEvent(TRIAD_EVENT_TYPES.SAFETY_INCIDENT_DETECTED, {
    projectId,
    taskId,
    note: incidentNote,
  });

  appendEvent(TRIAD_EVENT_TYPES.FIELD_TASK_STOPPED, {
    projectId,
    taskId,
    reason: "Safety incident lockout",
  });

  appendEvent(TRIAD_EVENT_TYPES.COMMUNICATION_ALERTED, {
    projectId,
    recipient: payload.siteManager || "site-manager",
    channel: "communications",
    message: "Safety incident triggered immediate stop-work.",
  });

  appendEvent(TRIAD_EVENT_TYPES.CHANGE_ORDER_INITIATED, {
    projectId,
    reason: "Lost-time recovery from safety incident",
    estimatedImpactUsd: toNumber(payload.estimatedImpactUsd || 0),
  });

  appendEvent(TRIAD_EVENT_TYPES.AUDIT_BLACKBOX_LOGGED, {
    projectId,
    taskId,
    route: "/portal/audit",
    note: "Cross-persona handoff chain captured.",
  });

  appendHandoff("phase3-cross-persona", {
    signal: signalType,
    projectId,
    taskId,
    chain: [
      "field-task-stopped",
      "communication-alerted",
      "change-order-initiated",
      "audit-blackbox-logged",
    ],
  });

  enqueueDecision({
    personaId: "fieldGuardian",
    projectId,
    title: "Safety incident response package prepared",
    actionType: "safety-incident-handoff",
    payload: {
      taskId,
      note: incidentNote,
    },
    recommendedAction: "Confirm site stand-down and approve recovery plan before restart.",
  });

  return { ok: true, projectId, taskId };
}

export function submitMarketplacePersonaCandidate(manifest = {}, simulation = {}, submittedBy = "ecosystem-developer") {
  const submission = submitMarketplacePersona(manifest, simulation, submittedBy);

  writeTriadState((current) => ({
    ...current,
    marketplaceSubmissions: [submission, ...(current.marketplaceSubmissions || [])].slice(0, 500),
  }));

  appendEvent(TRIAD_EVENT_TYPES.MARKETPLACE_PERSONA_SUBMITTED, {
    submissionId: submission.id,
    personaId: submission.manifest?.id || "unknown",
    submittedBy: submission.submittedBy,
  });

  appendEvent(
    submission.status === "approved"
      ? TRIAD_EVENT_TYPES.MARKETPLACE_PERSONA_APPROVED
      : TRIAD_EVENT_TYPES.MARKETPLACE_PERSONA_REJECTED,
    {
      submissionId: submission.id,
      personaId: submission.manifest?.id || "unknown",
      score: submission.sandbox?.score || 0,
      violations: submission.sandbox?.violations || [],
    },
  );

  return submission;
}

export function publishFederatedTechnique(sample = {}) {
  const insight = publishFederatedInsight(sample);

  writeTriadState((current) => ({
    ...current,
    federatedInsights: [insight, ...(current.federatedInsights || [])].slice(0, 1500),
  }));

  appendEvent(TRIAD_EVENT_TYPES.FEDERATED_INSIGHT_PUBLISHED, {
    insightId: insight.id,
    workflowKey: insight.workflowKey,
    observedDeltaPct: insight.observedDeltaPct,
  });

  return insight;
}

export function issueTalentExchangePassport(profile = {}, certifications = [], auditTrail = []) {
  const passport = issueTalentPassport(profile, certifications, auditTrail);

  writeTriadState((current) => ({
    ...current,
    talentPassports: [passport, ...(current.talentPassports || [])].slice(0, 2000),
  }));

  appendEvent(TRIAD_EVENT_TYPES.TALENT_PASSPORT_ISSUED, {
    passportId: passport.passportId,
    workerId: passport.workerId,
    role: passport.role,
  });

  return passport;
}

export function issueProjectComplianceCertificate(projectId, requirements = [], eventStream = []) {
  const certificate = issueComplianceCertificate(projectId, requirements, eventStream);

  writeTriadState((current) => ({
    ...current,
    complianceCertificates: [certificate, ...(current.complianceCertificates || [])].slice(0, 2000),
  }));

  appendEvent(TRIAD_EVENT_TYPES.COMPLIANCE_CERTIFICATE_ISSUED, {
    certificateId: certificate.certificateId,
    projectId: certificate.projectId,
    passed: certificate.passed,
    requirementCount: certificate.requirementCount,
    unmetCount: (certificate.unmetRequirements || []).length,
  });

  return certificate;
}

export function logTriadBlackboxEvent(entryType, payload = {}) {
  const nextPayload = {
    entryType: entryType || "generic-blackbox",
    ...payload,
  };

  const result = appendEvent(TRIAD_EVENT_TYPES.AUDIT_BLACKBOX_LOGGED, nextPayload);
  appendHandoff("blackbox-audit", {
    entryType: nextPayload.entryType,
    payload: nextPayload,
  });
  return result;
}

export function replayTriadScenario(kind = "") {
  const scenario = String(kind || "").toLowerCase();

  if (scenario === "lead-won") {
    return executeLeadWonHandoff(
      {
        leadId: `SIM-${Date.now()}`,
        company: "Simulated Lead Company",
        contact: "Pilot Operator",
        sourceChannel: "simulation",
        estimatedValue: 240000,
        estimatedMarginPct: 18,
      },
      {
        minimumMarginThresholdPct: 14,
      },
    );
  }

  if (scenario === "milestone") {
    const jobs = listTriadJobs();
    const projectId = jobs[0]?.project?.projectId || `PRJ-SIM-${Date.now()}`;
    if (!jobs.length) {
      executeLeadWonHandoff(
        {
          leadId: `SIM-${Date.now()}`,
          company: "Simulated Lead Company",
          contact: "Pilot Operator",
          sourceChannel: "simulation",
          estimatedValue: 240000,
          estimatedMarginPct: 18,
        },
        {
          minimumMarginThresholdPct: 14,
        },
      );
    }

    return registerFieldMilestoneCompletion({
      projectId,
      taskId: `TASK-${Date.now()}`,
      taskName: "Simulated milestone",
      loggedHours: 7,
      budgetHours: 8,
      photoVerified: true,
      digitalSignature: `sim-signature-${Date.now()}`,
      amountUsd: 42000,
    });
  }

  if (scenario === "safety-incident") {
    const jobs = listTriadJobs();
    const projectId = jobs[0]?.project?.projectId || `PRJ-SIM-${Date.now()}`;
    return orchestratePersonaSignal("safety-incident", {
      projectId,
      taskId: `TASK-${Date.now()}`,
      note: "Simulated scaffold incident in Zone A.",
      estimatedImpactUsd: 12000,
      siteManager: "Superintendent",
    });
  }

  return { ok: false, message: `Unknown replay scenario '${kind}'.` };
}

export function validateTriadContract() {
  const state = readTriadState();
  const errors = [];

  const jobs = Object.values(state.jobs || {});
  for (const job of jobs) {
    if (!job.id) errors.push("job.id missing");
    if (!job.lead?.leadId) errors.push(`job ${job.id}: lead.leadId missing`);
    if (!job.project?.projectId) errors.push(`job ${job.id}: project.projectId missing`);
    if (!Array.isArray(job.project?.workspaceFolders)) errors.push(`job ${job.id}: project.workspaceFolders must be array`);
    if (typeof job.finance?.budgetEstimateUsd !== "number") errors.push(`job ${job.id}: finance.budgetEstimateUsd must be number`);
    const payApps = job.finance?.payApps || [];
    for (const payApp of payApps) {
      if (!payApp.id) errors.push(`job ${job.id}: payapp.id missing`);
      if (typeof payApp.amountUsd !== "number") errors.push(`job ${job.id}: payapp.amountUsd must be number`);
      const verification = payApp.verification || {};
      if (typeof verification.workLogged !== "boolean") errors.push(`job ${job.id}: payapp.verification.workLogged must be boolean`);
      if (typeof verification.photoVerified !== "boolean") errors.push(`job ${job.id}: payapp.verification.photoVerified must be boolean`);
      if (typeof verification.withinBudget !== "boolean") errors.push(`job ${job.id}: payapp.verification.withinBudget must be boolean`);
      if (typeof verification.digitalSignature !== "boolean") errors.push(`job ${job.id}: payapp.verification.digitalSignature must be boolean`);
    }
  }

  for (const decision of state.decisionQueue || []) {
    if (!decision.id) errors.push("decisionQueue: id missing");
    if (!decision.personaId) errors.push(`decision ${decision.id}: personaId missing`);
    if (!decision.status) errors.push(`decision ${decision.id}: status missing`);
  }

  for (const submission of state.marketplaceSubmissions || []) {
    if (!submission.id) errors.push("marketplace submission: id missing");
    if (!submission.manifest?.id) errors.push(`marketplace submission ${submission.id || "unknown"}: manifest.id missing`);
    if (!submission.sandbox?.checkedAt) errors.push(`marketplace submission ${submission.id || "unknown"}: sandbox.checkedAt missing`);
  }

  for (const passport of state.talentPassports || []) {
    if (!passport.passportId) errors.push("talent passport: passportId missing");
    if (!passport.workerId) errors.push(`talent passport ${passport.passportId || "unknown"}: workerId missing`);
    if (!passport.provenanceHash) errors.push(`talent passport ${passport.passportId || "unknown"}: provenanceHash missing`);
  }

  for (const certificate of state.complianceCertificates || []) {
    if (!certificate.certificateId) errors.push("compliance certificate: certificateId missing");
    if (!certificate.projectId) errors.push(`compliance certificate ${certificate.certificateId || "unknown"}: projectId missing`);
    if (!certificate.proofHash) errors.push(`compliance certificate ${certificate.certificateId || "unknown"}: proofHash missing`);
  }

  return {
    ok: errors.length === 0,
    errors,
    checkedAt: nowIso(),
    jobsChecked: jobs.length,
    decisionQueueChecked: (state.decisionQueue || []).length,
  };
}

export function getTriadCommandMetrics() {
  const jobs = listTriadJobs();
  const pipelineInMotion = jobs.filter((job) => job.lead?.status === "Won").length;
  const projectOnTrack = jobs.filter((job) => job.project?.criticalPathStatus !== "At Risk").length;
  const totalBilled = jobs.reduce((sum, job) => sum + toNumber(job.finance?.billedUsd || 0), 0);
  const totalCollected = jobs.reduce((sum, job) => sum + toNumber(job.finance?.collectedUsd || 0), 0);

  return {
    pipelineHealth: {
      inMotion: pipelineInMotion,
      totalJobs: jobs.length,
      percentInMotion: jobs.length ? Math.round((pipelineInMotion / jobs.length) * 100) : 0,
    },
    projectVelocity: {
      onTrack: projectOnTrack,
      atRisk: Math.max(0, jobs.length - projectOnTrack),
      percentOnTrack: jobs.length ? Math.round((projectOnTrack / jobs.length) * 100) : 0,
    },
    cashFlow: {
      billedUsd: totalBilled,
      collectedUsd: totalCollected,
      outstandingUsd: Math.max(0, totalBilled - totalCollected),
    },
  };
}
