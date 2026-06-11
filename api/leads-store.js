const STORE_KEY = "__FCA_CONTRACTOR_COMMAND_LEADS_STORE__";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = {
      tenants: {},
    };
  }

  return globalThis[STORE_KEY];
}

function getTenantStore(tenantId = "TEN-FCA-001") {
  const store = getStore();
  if (!store.tenants[tenantId]) {
    store.tenants[tenantId] = {
      leads: [],
      opportunities: [],
      projects: [],
    };
  }
  return store.tenants[tenantId];
}

function now() {
  return new Date().toISOString();
}

function makeAuditEvent({ tenantId, eventType, targetObjectType, targetObjectId, relatedObjectType = null, relatedObjectId = null, actorType = "system", actorId = "system", summary, reason, sourceRoute, beforeSnapshot = null, afterSnapshot = null }) {
  return {
    auditEventId: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    tenantId,
    eventType,
    targetObjectType,
    targetObjectId,
    relatedObjectType,
    relatedObjectId,
    actorType,
    actorId,
    summary,
    reason,
    sourceRoute,
    correlationId: `corr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    beforeSnapshot,
    afterSnapshot,
    createdAt: now(),
  };
}

export function listLeads(tenantId) {
  return clone(getTenantStore(tenantId).leads);
}

export function getLead(tenantId, leadId) {
  const lead = getTenantStore(tenantId).leads.find((item) => item.leadId === leadId);
  if (!lead) throw new Error(`Lead not found: ${leadId}`);
  return clone(lead);
}

export function createLead(tenantId, payload = {}) {
  const tenant = getTenantStore(tenantId);
  const leadId = payload.leadId || `lead_${Date.now()}`;
  const clientId = payload.client?.clientId || `client_${Date.now()}`;
  const siteId = payload.site?.siteId || `site_${Date.now()}`;

  const lead = {
    leadId,
    tenantId,
    clientId,
    siteId,
    sourceChannel: payload.sourceChannel || "website",
    status: "new",
    budgetStatus: payload.budgetSignal === "confirmed" ? "confirmed" : "pending",
    jurisdictionStatus: payload.site?.jurisdiction ? "pending" : "unknown",
    ownershipStatus: "pending",
    intakeFormStatus: "issued",
    feeStatus: "not-required",
    serviceLine: payload.serviceLine || "estimating",
    projectIntent: payload.projectIntent || "unspecified",
    client: payload.client || {},
    site: payload.site || {},
    notes: payload.notes || "",
    createdAt: now(),
    updatedAt: now(),
  };

  const auditEvent = makeAuditEvent({
    tenantId,
    eventType: "lead-created",
    targetObjectType: "Lead",
    targetObjectId: leadId,
    actorType: "user",
    actorId: payload.createdBy || "website-intake",
    summary: "Lead created from governed intake path",
    reason: "Intake must create a durable governed object before qualification can occur.",
    sourceRoute: payload.sourceRoute || "/contact",
    afterSnapshot: {
      status: lead.status,
      sourceChannel: lead.sourceChannel,
      serviceLine: lead.serviceLine,
    },
  });

  lead.auditEvents = [auditEvent];
  tenant.leads.unshift(lead);

  return clone({
    item: lead,
    auditEvent,
  });
}

export function updateLead(tenantId, leadId, updates = {}) {
  const tenant = getTenantStore(tenantId);
  const index = tenant.leads.findIndex((item) => item.leadId === leadId);
  if (index === -1) throw new Error(`Lead not found: ${leadId}`);

  const current = tenant.leads[index];
  const nextStatus = updates.status || current.status;
  const updated = {
    ...current,
    ...updates,
    status: nextStatus,
    updatedAt: now(),
  };

  const auditEvent = makeAuditEvent({
    tenantId,
    eventType: "lead-updated",
    targetObjectType: "Lead",
    targetObjectId: leadId,
    actorType: "user",
    actorId: updates.updatedBy || "system",
    summary: "Lead updated",
    reason: updates.reason || "Lead record changed through governed intake workflow.",
    sourceRoute: updates.sourceRoute || "/contact",
    beforeSnapshot: { status: current.status },
    afterSnapshot: { status: updated.status },
  });

  updated.auditEvents = [auditEvent, ...(current.auditEvents || [])];
  tenant.leads[index] = updated;

  return clone({ item: updated, auditEvent });
}

export function qualifyLead(tenantId, leadId, payload = {}) {
  const tenant = getTenantStore(tenantId);
  const index = tenant.leads.findIndex((item) => item.leadId === leadId);
  if (index === -1) throw new Error(`Lead not found: ${leadId}`);

  const current = tenant.leads[index];
  if (!["new", "under-review"].includes(current.status)) {
    throw new Error(`Lead cannot be qualified from status: ${current.status}`);
  }

  const opportunityId = payload.opportunityId || `opp_${leadId}`;
  const qualifiedLead = {
    ...current,
    status: "qualified",
    budgetStatus: payload.budgetStatus || current.budgetStatus || "confirmed",
    jurisdictionStatus: payload.jurisdictionStatus || current.jurisdictionStatus || "validated",
    ownershipStatus: payload.ownershipStatus || current.ownershipStatus || "verified",
    qualificationNotes: payload.reason || "Lead qualified through governed intake review.",
    updatedAt: now(),
  };

  const opportunity = {
    opportunityId,
    tenantId,
    clientId: qualifiedLead.clientId,
    siteId: qualifiedLead.siteId,
    sourceLeadId: leadId,
    status: "qualified",
    serviceLine: qualifiedLead.serviceLine,
    projectIntent: qualifiedLead.projectIntent,
    estimateSummary: {
      estimateId: `estimate_${opportunityId}`,
      status: "not-started",
      versionCount: 0,
    },
    fileSummary: {
      total: 0,
      linked: 0,
      unlinked: 0,
    },
    conversionReadiness: {
      canConvertToProject: false,
      blockingReason: "estimate approval pending",
    },
    auricruxSummary: {
      nextAction: "Begin qualification-to-estimate handoff",
    },
    createdAt: now(),
    updatedAt: now(),
  };

  const leadAudit = makeAuditEvent({
    tenantId,
    eventType: "lead-qualified",
    targetObjectType: "Lead",
    targetObjectId: leadId,
    relatedObjectType: "Opportunity",
    relatedObjectId: opportunityId,
    actorType: "auricrux",
    actorId: payload.qualifiedBy || "auricrux",
    summary: "Lead qualified into governed opportunity",
    reason: payload.reason || "Lead satisfied intake qualification requirements.",
    sourceRoute: payload.sourceRoute || "/contact",
    beforeSnapshot: { status: current.status },
    afterSnapshot: { status: "qualified" },
  });

  const opportunityAudit = makeAuditEvent({
    tenantId,
    eventType: "opportunity-created",
    targetObjectType: "Opportunity",
    targetObjectId: opportunityId,
    relatedObjectType: "Lead",
    relatedObjectId: leadId,
    actorType: "auricrux",
    actorId: payload.qualifiedBy || "auricrux",
    summary: "Qualified opportunity created",
    reason: "Lead intake phase requires qualified opportunity output.",
    sourceRoute: payload.sourceRoute || "/contact",
    afterSnapshot: { status: "qualified" },
  });

  qualifiedLead.auditEvents = [leadAudit, opportunityAudit, ...(current.auditEvents || [])];
  tenant.leads[index] = qualifiedLead;
  tenant.opportunities.unshift(opportunity);

  return clone({
    lead: qualifiedLead,
    opportunity,
    auditEvents: [leadAudit, opportunityAudit],
  });
}

export function getOpportunity(tenantId, opportunityId) {
  const opportunity = getTenantStore(tenantId).opportunities.find((item) => item.opportunityId === opportunityId);
  if (!opportunity) throw new Error(`Opportunity not found: ${opportunityId}`);
  return clone(opportunity);
}

export function convertOpportunityToProject(tenantId, opportunityId, payload = {}) {
  const tenant = getTenantStore(tenantId);
  const opportunityIndex = tenant.opportunities.findIndex((item) => item.opportunityId === opportunityId);
  if (opportunityIndex === -1) throw new Error(`Opportunity not found: ${opportunityId}`);

  const opportunity = tenant.opportunities[opportunityIndex];
  const projectId = payload.project?.projectId || `project_${opportunityId}`;
  const projectNumber = payload.project?.projectNumber || `FCA-${new Date().getUTCFullYear()}-${String(tenant.projects.length + 1).padStart(3, "0")}`;

  const project = {
    projectId,
    tenantId,
    clientId: opportunity.clientId,
    siteId: opportunity.siteId,
    sourceOpportunityId: opportunityId,
    sourceEstimateId: opportunity.estimateSummary?.estimateId || null,
    projectName: payload.project?.projectName || `${opportunity.projectIntent || "Project"} Workspace`,
    projectNumber,
    projectType: payload.project?.projectType || opportunity.projectIntent || "unspecified",
    deliveryMode: payload.project?.deliveryMode || "bid-build",
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  };

  const conversionAudit = makeAuditEvent({
    tenantId,
    eventType: "opportunity-converted",
    targetObjectType: "Opportunity",
    targetObjectId: opportunityId,
    relatedObjectType: "Project",
    relatedObjectId: projectId,
    actorType: "auricrux",
    actorId: payload.convertedBy || "auricrux",
    summary: "Opportunity converted to project",
    reason: payload.reason || "Qualified opportunity approved for project activation.",
    sourceRoute: payload.sourceRoute || "/portal/opportunities",
    beforeSnapshot: { status: opportunity.status },
    afterSnapshot: { status: "converted" },
  });

  const projectAudit = makeAuditEvent({
    tenantId,
    eventType: "project-created",
    targetObjectType: "Project",
    targetObjectId: projectId,
    relatedObjectType: "Opportunity",
    relatedObjectId: opportunityId,
    actorType: "auricrux",
    actorId: payload.convertedBy || "auricrux",
    summary: "Project created from qualified opportunity",
    reason: "Project/job continuity must anchor downstream execution.",
    sourceRoute: payload.sourceRoute || "/portal/opportunities",
    afterSnapshot: { status: "active", projectNumber },
  });

  tenant.opportunities[opportunityIndex] = {
    ...opportunity,
    status: "converted",
    conversionReadiness: {
      canConvertToProject: true,
      blockingReason: null,
    },
    convertedProjectId: projectId,
    updatedAt: now(),
  };
  tenant.projects.unshift(project);

  return clone({
    item: project,
    auditEvents: [conversionAudit, projectAudit],
  });
}
