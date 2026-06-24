import { portalBids, portalProjects, portalFiles, projectAuditEvents } from "../src/systemState.js";
import {
  ensureWorkflowHydrated,
  scheduleTenantPersist,
  persistenceEnabled,
} from "./_lib/persistence/azureTablePersistence.js";

const STORE_KEY = "__FCA_CONTRACTOR_COMMAND_WORKFLOW_STORE__";
const DEFAULT_TENANT_ID = "TEN-FCA-001";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeQualification(qualification = {}, bid = {}) {
  return {
    score: qualification.score || "62/100",
    status: qualification.status || "Discovery in progress",
    budgetFit: qualification.budgetFit || "Budget needs confirmation",
    scopeFit: qualification.scopeFit || bid.scopePackage || "Scope needs validation",
    jurisdiction: qualification.jurisdiction || "License and permit review pending",
    travel: qualification.travel || "Travel zone review pending",
    evidence: qualification.evidence || "Customer documents pending",
    nextGate: qualification.nextGate || "Complete qualification command review",
  };
}

function normalizeBidRecord(bid = {}, index = 0) {
  return {
    id: bid.id || `BID-${index + 1}`,
    package: bid.package || `Package-${index + 1}`,
    value: bid.value || "$0",
    status: bid.status || "Quoted",
    blocker: bid.blocker || "No blocker recorded",
    estimator: bid.estimator || "Unassigned",
    scopePackage: bid.scopePackage || "Scope pending",
    dueDate: bid.dueDate || "TBD",
    tradeCoverage: bid.tradeCoverage || "Coverage pending",
    nextCommercialMove: bid.nextCommercialMove || "Advance commercial review",
    qualification: normalizeQualification(bid.qualification, bid),
    linkedProjectId: bid.linkedProjectId || null,
    lastActionAt: bid.lastActionAt || null,
    actionHistory: Array.isArray(bid.actionHistory) ? bid.actionHistory : [],
  };
}

function normalizeProjectRecord(project = {}, index = 0) {
  const customer = project.customer || project.company || "Unassigned customer";
  return {
    id: project.id || `PRJ-${index + 1}`,
    name: project.name || `${customer} Project Workspace`,
    customer,
    stage: project.stage || "Estimating",
    nextAction: project.nextAction || "Advance project",
    owner: project.owner || "Unassigned",
    due: project.due || "TBD",
    superintendent: project.superintendent || "Pending assignment",
    permitStatus: project.permitStatus || "Permit status pending",
    siteStatus: project.siteStatus || "Site status pending",
    commercialFocus: project.commercialFocus || "Commercial focus pending",
    fileSetLabel: project.fileSetLabel || "Project file spine readiness pending",
    fileSpineStatus:
      project.fileSpineStatus ||
      "File, audit, and Auricrux continuity should attach to this same project root.",
    auditLabel: project.auditLabel || "Project continuity audit active",
    auditStatus:
      project.auditStatus ||
      "Recent project-stage changes, file linkage, and Auricrux actions should resolve into the same audit spine.",
    auricruxMode: project.auricruxMode || "Project-aware workspace guidance",
    auricruxSummary:
      project.auricruxSummary ||
      "Auricrux is reading this project as an active operating context inside the shared FCA workspace.",
    ownerNote: project.ownerNote || "",
    customerMilestone: project.customerMilestone || "",
    sourceBidId: project.sourceBidId || null,
    lastActionAt: project.lastActionAt || null,
    actionHistory: Array.isArray(project.actionHistory) ? project.actionHistory : [],
  };
}

function normalizeFileRecord(file = {}, index = 0) {
  return {
    fileId: file.fileId || `FILE-${index + 1}`,
    ownerObjectType: file.ownerObjectType || "Project",
    ownerObjectId: file.ownerObjectId || "PRJ-A117",
    linkedEvidenceTarget: file.linkedEvidenceTarget || "Project continuity record",
    evidenceStatus: file.evidenceStatus || "Evidence linked",
    versionLabel: file.versionLabel || "Rev 1",
    name: file.name || `Workflow file ${index + 1}`,
    category: file.category || "Document",
    updated: file.updated || nowIso(),
    action: file.action || "Review",
    discipline: file.discipline || "Operations",
    status: file.status || "Active",
    owner: file.owner || "Unassigned",
    note: file.note || "Workflow-backed file record active.",
  };
}

function normalizeAuditEvent(event = {}, index = 0) {
  return {
    id: event.id || `AUD-${index + 1}`,
    time: event.time || nowIso(),
    eventType: event.eventType || "workflow-event",
    actorType: event.actorType || "auricrux",
    targetObjectType: event.targetObjectType || "WorkflowObject",
    targetObjectId: event.targetObjectId || null,
    action: event.action || "Workflow event recorded",
    detail: event.detail || "Auricrux recorded a workflow mutation.",
    reason: event.reason || "Continuity event captured.",
    discipline: event.discipline || "Operations",
  };
}

function normalizeTakeoffRecord(item = {}, index = 0) {
  return {
    takeoffId: item.takeoffId || `TKO-${index + 1}`,
    projectId: item.projectId,
    drawingSetId: item.drawingSetId || null,
    sheetId: item.sheetId || null,
    detailRef: item.detailRef || null,
    zoneRef: item.zoneRef || null,
    assemblyCode: item.assemblyCode || null,
    description: item.description || `Takeoff item ${index + 1}`,
    quantity: item.quantity || 0,
    unit: item.unit || "EA",
    wasteFactorPct: item.wasteFactorPct ?? 0,
    productionRate: item.productionRate ?? null,
    fileIds: Array.isArray(item.fileIds) ? item.fileIds : [],
    sourceObjectIds: Array.isArray(item.sourceObjectIds) ? item.sourceObjectIds : [],
    status: item.status || "open",
    note: item.note || "Governed takeoff continuity record active.",
    updatedAt: item.updatedAt || nowIso(),
  };
}

function normalizeRfiRecord(item = {}, index = 0) {
  return {
    rfiId: item.rfiId || `RFI-${index + 1}`,
    projectId: item.projectId,
    number: item.number || null,
    drawingSetId: item.drawingSetId || null,
    sheetId: item.sheetId || null,
    redlineId: item.redlineId || null,
    question: item.question || `RFI item ${index + 1}`,
    suggestedResponse: item.suggestedResponse || null,
    dueAt: item.dueAt || null,
    fileIds: Array.isArray(item.fileIds) ? item.fileIds : [],
    sourceObjectIds: Array.isArray(item.sourceObjectIds) ? item.sourceObjectIds : [],
    status: item.status || "open",
    note: item.note || "Governed RFI continuity record active.",
    updatedAt: item.updatedAt || nowIso(),
  };
}

function seedBids() {
  return portalBids.map((bid, index) =>
    normalizeBidRecord(
      {
        ...bid,
        id: `BID-${index + 1}`,
        qualification: {
          score: index === 0 ? "84/100" : index === 1 ? "71/100" : "63/100",
          status: index === 0 ? "Ready for estimate" : index === 1 ? "Budget review" : "Discovery in progress",
          budgetFit: index === 0 ? "Confirmed" : index === 1 ? "Pending buyer confirmation" : "Budget not verified",
          scopeFit: bid.scopePackage,
          jurisdiction: index === 0 ? "Licensed coverage verified" : "Municipal review pending",
          travel: index === 0 ? "Inside standard travel zone" : "Travel premium review pending",
          evidence: index === 0 ? "Plans, photos, and buyer notes attached" : "Awaiting full evidence packet",
          nextGate: index === 0 ? "Route to estimator handoff" : "Complete qualification command review",
        },
      },
      index,
    ),
  );
}

function seedProjects() {
  return portalProjects.map((project, index) => normalizeProjectRecord(project, index));
}

function seedFiles() {
  return portalFiles.map((file, index) => normalizeFileRecord(file, index));
}

function seedAudit() {
  return projectAuditEvents.map((event, index) => normalizeAuditEvent(event, index));
}

function seedTakeoffs(projects) {
  const primaryProjectId = projects[0]?.id || "PRJ-1";
  return [
    normalizeTakeoffRecord(
      {
        takeoffId: "TKO-A-117-01",
        projectId: primaryProjectId,
        drawingSetId: "DS-A-117",
        sheetId: "A1.1",
        detailRef: "Lobby power plan",
        zoneRef: "Level 1",
        assemblyCode: "ELEC-LP-01",
        description: "Lobby lighting circuit quantity",
        quantity: 24,
        unit: "EA",
        wasteFactorPct: 5,
        productionRate: 8,
        sourceObjectIds: ["BID-1"],
        status: "in_review",
      },
      0,
    ),
  ];
}

function seedRfis(projects) {
  const primaryProjectId = projects[0]?.id || "PRJ-1";
  return [
    normalizeRfiRecord(
      {
        rfiId: "RFI-A-117-01",
        projectId: primaryProjectId,
        number: "RFI-001",
        drawingSetId: "DS-A-117",
        sheetId: "A3.2",
        redlineId: "RED-001",
        question: "Confirm access-control hardware scope at lobby entry revisions.",
        suggestedResponse: "Awaiting architect confirmation on revised device count.",
        dueAt: nowIso(),
        sourceObjectIds: ["TKO-A-117-01"],
        status: "open",
      },
      0,
    ),
  ];
}

function seedTenantWorkflow() {
  const projects = seedProjects();
  const activeProjectId = projects[0]?.id || null;
  return {
    bids: seedBids(),
    projects,
    files: seedFiles().map((file, index) => ({
      ...file,
      fileId: file.fileId || `${activeProjectId || "PRJ-A117"}-FILE-${index + 1}`,
      ownerObjectId: file.ownerObjectId || activeProjectId || "PRJ-A117",
    })),
    takeoffs: seedTakeoffs(projects),
    rfis: seedRfis(projects),
    audit: seedAudit(),
    activeProjectId,
    updatedAt: nowIso(),
  };
}

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = {
      tenants: {
        [DEFAULT_TENANT_ID]: seedTenantWorkflow(),
      },
    };
  }

  return globalThis[STORE_KEY];
}

function resolveTenantId(tenantId = DEFAULT_TENANT_ID) {
  return tenantId || DEFAULT_TENANT_ID;
}

function getTenantWorkflow(tenantId = DEFAULT_TENANT_ID) {
  const store = getStore();
  const resolvedTenantId = resolveTenantId(tenantId);

  if (!store.tenants[resolvedTenantId]) {
    store.tenants[resolvedTenantId] = seedTenantWorkflow();
  }

  return store.tenants[resolvedTenantId];
}

export async function ensureWorkflowReady(tenantId = DEFAULT_TENANT_ID) {
  const resolvedTenantId = resolveTenantId(tenantId);
  await ensureWorkflowHydrated(resolvedTenantId, (id, workflow) => {
    getStore().tenants[id] = workflow;
  });
  if (!getStore().tenants[resolvedTenantId]) {
    getStore().tenants[resolvedTenantId] = seedTenantWorkflow();
  }
}

function persistTenant(tenantId = DEFAULT_TENANT_ID) {
  const resolvedTenantId = resolveTenantId(tenantId);
  scheduleTenantPersist(resolvedTenantId, () => getTenantWorkflow(resolvedTenantId));
}

export function workflowBackingSource() {
  return persistenceEnabled() ? "api-workflow-store-table" : "api-workflow-store";
}

function stampHistoryEntry(label, detail) {
  return {
    at: nowIso(),
    label,
    detail,
  };
}

function appendAudit(workflow, event) {
  const normalized = normalizeAuditEvent(
    {
      ...event,
      id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      time: nowIso(),
    },
    workflow.audit.length,
  );

  workflow.audit = [normalized, ...workflow.audit].slice(0, 120);
  workflow.updatedAt = nowIso();
  return normalized;
}

function touchProjectForFileMutation(workflow, projectId, detail) {
  const projectIndex = workflow.projects.findIndex((project) => project.id === projectId);
  if (projectIndex === -1) return null;

  const currentProject = workflow.projects[projectIndex];
  const fileCount = workflow.files.filter((file) => file.ownerObjectId === projectId).length;
  const updatedProject = normalizeProjectRecord(
    {
      ...currentProject,
      fileSetLabel: `${fileCount} workflow-backed file records linked to ${projectId}`,
      fileSpineStatus: detail || currentProject.fileSpineStatus,
      auditStatus: `Recent file and audit continuity actions are preserved under ${projectId}.`,
      lastActionAt: nowIso(),
      actionHistory: [stampHistoryEntry("File spine updated", detail || `Workflow-backed file continuity updated for ${projectId}.`), ...currentProject.actionHistory].slice(0, 12),
    },
    projectIndex,
  );

  workflow.projects[projectIndex] = updatedProject;
  return updatedProject;
}

function touchProjectForTakeoffMutation(workflow, projectId, detail) {
  const projectIndex = workflow.projects.findIndex((project) => project.id === projectId);
  if (projectIndex === -1) return null;
  const currentProject = workflow.projects[projectIndex];
  const updatedProject = normalizeProjectRecord(
    {
      ...currentProject,
      nextAction: detail || currentProject.nextAction,
      auditStatus: `Takeoff continuity preserved under ${projectId}.`,
      lastActionAt: nowIso(),
      actionHistory: [stampHistoryEntry("Takeoff continuity updated", detail || `Takeoff continuity updated for ${projectId}.`), ...currentProject.actionHistory].slice(0, 12),
    },
    projectIndex,
  );
  workflow.projects[projectIndex] = updatedProject;
  return updatedProject;
}

function touchProjectForRfiMutation(workflow, projectId, detail) {
  const projectIndex = workflow.projects.findIndex((project) => project.id === projectId);
  if (projectIndex === -1) return null;
  const currentProject = workflow.projects[projectIndex];
  const updatedProject = normalizeProjectRecord(
    {
      ...currentProject,
      nextAction: detail || currentProject.nextAction,
      auditStatus: `RFI continuity preserved under ${projectId}.`,
      lastActionAt: nowIso(),
      actionHistory: [stampHistoryEntry("RFI continuity updated", detail || `RFI continuity updated for ${projectId}.`), ...currentProject.actionHistory].slice(0, 12),
    },
    projectIndex,
  );
  workflow.projects[projectIndex] = updatedProject;
  return updatedProject;
}

export function listBids(tenantId) {
  return clone(getTenantWorkflow(tenantId).bids);
}

export function listProjects(tenantId) {
  const workflow = getTenantWorkflow(tenantId);
  return clone(
    workflow.projects.map((project) => ({
      ...project,
      isActive: project.id === workflow.activeProjectId,
    })),
  );
}

export function getProjectById(tenantId, projectId) {
  const workflow = getTenantWorkflow(tenantId);
  const item = workflow.projects.find((project) => project.id === projectId);
  if (!item) {
    throw new Error(`Project not found: ${projectId}`);
  }
  return clone({ ...item, isActive: item.id === workflow.activeProjectId });
}

export function createProject(tenantId, payload = {}) {
  const workflow = getTenantWorkflow(tenantId);
  const projectId = payload.code || payload.projectId || `PRJ-${Date.now()}`;
  const existing = workflow.projects.find((project) => project.id === projectId);
  if (existing) {
    throw new Error(`Project already exists: ${projectId}`);
  }

  const createdProject = normalizeProjectRecord(
    {
      id: projectId,
      name: payload.name,
      customer: payload.customerName || payload.customerId || "Unassigned customer",
      stage: "Lead",
      nextAction: payload.description || "Complete project qualification and setup.",
      owner: "Auricrux",
      due: "TBD",
      superintendent: "Pending assignment",
      permitStatus: "Permit review pending",
      siteStatus: payload.siteAddress || "Site not yet verified",
      commercialFocus: payload.description || "Project record created from canonical project route.",
      auricruxSummary: `Auricrux created ${projectId} through the canonical project spine.`,
      sourceBidId: payload.opportunityId || null,
      lastActionAt: nowIso(),
      actionHistory: [stampHistoryEntry("Project created", `Canonical project route created ${projectId}.`)],
    },
    workflow.projects.length,
  );

  workflow.projects.unshift(createdProject);
  workflow.activeProjectId = createdProject.id;
  appendAudit(workflow, {
    eventType: "project-created",
    actorType: "auricrux",
    targetObjectType: "Project",
    targetObjectId: createdProject.id,
    action: `${createdProject.id} created from canonical route`,
    detail: `Canonical project spine created ${createdProject.name}.`,
    reason: "Project root must be durable and non-stub for 60A readiness.",
    discipline: "Project Setup",
  });

  persistTenant(tenantId);
  return clone({ project: createdProject, summary: getWorkflowSummary(tenantId) });
}

export function listFiles(tenantId, options = {}) {
  const workflow = getTenantWorkflow(tenantId);
  const projectId = options?.projectId || workflow.activeProjectId || null;
  const normalizedCategory = options?.category && options.category !== "All" ? options.category.toLowerCase() : null;
  const normalizedStatus = options?.status && options.status !== "All" ? options.status.toLowerCase() : null;
  const normalizedQuery = options?.q ? options.q.trim().toLowerCase() : null;

  let items = projectId ? workflow.files.filter((file) => file.ownerObjectId === projectId) : workflow.files;

  if (normalizedCategory) {
    items = items.filter((file) => (file.category || "").toLowerCase() === normalizedCategory);
  }

  if (normalizedStatus) {
    items = items.filter((file) => (file.status || "").toLowerCase() === normalizedStatus);
  }

  if (normalizedQuery) {
    items = items.filter((file) => {
      const haystack = [file.name, file.category, file.status, file.owner, file.discipline, file.linkedEvidenceTarget, file.note]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }

  return clone(items.map((file, index) => normalizeFileRecord(file, index)));
}

export function listAuditEvents(tenantId, options = {}) {
  const workflow = getTenantWorkflow(tenantId);
  const projectId = options?.projectId || workflow.activeProjectId || null;
  const normalizedEventType = options?.eventType && options.eventType !== "All" ? options.eventType.toLowerCase() : null;
  const normalizedActorType = options?.actorType && options.actorType !== "All" ? options.actorType.toLowerCase() : null;
  const normalizedQuery = options?.q ? options.q.trim().toLowerCase() : null;

  let items = projectId
    ? workflow.audit.filter(
        (event) =>
          !event.targetObjectId ||
          event.targetObjectId === projectId ||
          event.detail?.includes(projectId) ||
          event.reason?.includes(projectId),
      )
    : workflow.audit;

  if (normalizedEventType) {
    items = items.filter((event) => (event.eventType || "").toLowerCase() === normalizedEventType);
  }

  if (normalizedActorType) {
    items = items.filter((event) => (event.actorType || "").toLowerCase() === normalizedActorType);
  }

  if (normalizedQuery) {
    items = items.filter((event) => {
      const haystack = [event.action, event.detail, event.reason, event.discipline, event.targetObjectType, event.actorType, event.eventType]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }

  return clone(items.map((event, index) => normalizeAuditEvent(event, index)));
}

export function listTakeoffs(tenantId, projectId) {
  const workflow = getTenantWorkflow(tenantId);
  const items = workflow.takeoffs.filter((item) => item.projectId === projectId);
  return clone(items.map((item, index) => normalizeTakeoffRecord(item, index)));
}

export function createTakeoff(tenantId, payload = {}) {
  const workflow = getTenantWorkflow(tenantId);
  const created = normalizeTakeoffRecord(
    {
      takeoffId: `TKO-${Date.now()}`,
      projectId: payload.projectId,
      drawingSetId: payload.drawingSetId,
      sheetId: payload.sheetId,
      detailRef: payload.detailRef,
      zoneRef: payload.zoneRef,
      assemblyCode: payload.assemblyCode,
      description: payload.description,
      quantity: payload.quantity,
      unit: payload.unit,
      wasteFactorPct: payload.wasteFactorPct,
      productionRate: payload.productionRate,
      fileIds: payload.fileIds,
      sourceObjectIds: payload.sourceObjectIds,
      status: "open",
      note: "Canonical takeoff route created governed takeoff continuity.",
      updatedAt: nowIso(),
    },
    workflow.takeoffs.length,
  );
  workflow.takeoffs.unshift(created);
  touchProjectForTakeoffMutation(workflow, payload.projectId, `Takeoff ${created.takeoffId} added to ${payload.projectId}.`);
  appendAudit(workflow, {
    eventType: "takeoff-created",
    actorType: "auricrux",
    targetObjectType: "Project",
    targetObjectId: payload.projectId,
    action: `${created.takeoffId} created`,
    detail: `Canonical takeoff route created ${created.description}.`,
    reason: "Takeoff continuity must be project-linked and non-stub for 60A readiness.",
    discipline: "Estimating",
  });
  persistTenant(tenantId);
  return clone({ takeoff: created, summary: getWorkflowSummary(tenantId) });
}

export function updateTakeoff(tenantId, payload = {}) {
  const workflow = getTenantWorkflow(tenantId);
  const index = workflow.takeoffs.findIndex((item) => item.takeoffId === payload.takeoffId && item.projectId === payload.projectId);
  if (index === -1) {
    throw new Error(`Takeoff not found: ${payload.takeoffId}`);
  }
  const current = workflow.takeoffs[index];
  const updated = normalizeTakeoffRecord(
    {
      ...current,
      status: payload.status || current.status,
      description: payload.description || current.description,
      quantity: payload.quantity ?? current.quantity,
      unit: payload.unit || current.unit,
      note: payload.note || current.note,
      updatedAt: nowIso(),
    },
    index,
  );
  workflow.takeoffs[index] = updated;
  touchProjectForTakeoffMutation(workflow, payload.projectId, `Takeoff ${updated.takeoffId} updated for ${payload.projectId}.`);
  appendAudit(workflow, {
    eventType: "takeoff-updated",
    actorType: "auricrux",
    targetObjectType: "Project",
    targetObjectId: payload.projectId,
    action: `${updated.takeoffId} updated`,
    detail: payload.note || `Canonical takeoff route updated ${updated.description}.`,
    reason: "Takeoff lifecycle changes must remain durable and auditable.",
    discipline: "Estimating",
  });
  persistTenant(tenantId);
  return clone({ takeoff: updated, summary: getWorkflowSummary(tenantId) });
}

export function listRfis(tenantId, projectId) {
  const workflow = getTenantWorkflow(tenantId);
  const items = workflow.rfis.filter((item) => item.projectId === projectId);
  return clone(items.map((item, index) => normalizeRfiRecord(item, index)));
}

export function createRfi(tenantId, payload = {}) {
  const workflow = getTenantWorkflow(tenantId);
  const created = normalizeRfiRecord(
    {
      rfiId: `RFI-${Date.now()}`,
      projectId: payload.projectId,
      number: payload.number,
      drawingSetId: payload.drawingSetId,
      sheetId: payload.sheetId,
      redlineId: payload.redlineId,
      question: payload.question,
      suggestedResponse: payload.suggestedResponse,
      dueAt: payload.dueAt,
      fileIds: payload.fileIds,
      sourceObjectIds: payload.sourceObjectIds,
      status: "open",
      note: "Canonical RFI route created governed RFI continuity.",
      updatedAt: nowIso(),
    },
    workflow.rfis.length,
  );
  workflow.rfis.unshift(created);
  touchProjectForRfiMutation(workflow, payload.projectId, `RFI ${created.rfiId} added to ${payload.projectId}.`);
  appendAudit(workflow, {
    eventType: "rfi-created",
    actorType: "auricrux",
    targetObjectType: "Project",
    targetObjectId: payload.projectId,
    action: `${created.rfiId} created`,
    detail: `Canonical RFI route created ${created.question}.`,
    reason: "RFI continuity must be project-linked and non-stub for 60A readiness.",
    discipline: "Project Controls",
  });
  persistTenant(tenantId);
  return clone({ rfi: created, summary: getWorkflowSummary(tenantId) });
}

export function updateRfi(tenantId, payload = {}) {
  const workflow = getTenantWorkflow(tenantId);
  const index = workflow.rfis.findIndex((item) => item.rfiId === payload.rfiId && item.projectId === payload.projectId);
  if (index === -1) {
    throw new Error(`RFI not found: ${payload.rfiId}`);
  }
  const current = workflow.rfis[index];
  const updated = normalizeRfiRecord(
    {
      ...current,
      status: payload.status || current.status,
      question: payload.question || current.question,
      suggestedResponse: payload.suggestedResponse || current.suggestedResponse,
      dueAt: payload.dueAt || current.dueAt,
      note: payload.note || current.note,
      updatedAt: nowIso(),
    },
    index,
  );
  workflow.rfis[index] = updated;
  touchProjectForRfiMutation(workflow, payload.projectId, `RFI ${updated.rfiId} updated for ${payload.projectId}.`);
  appendAudit(workflow, {
    eventType: "rfi-updated",
    actorType: "auricrux",
    targetObjectType: "Project",
    targetObjectId: payload.projectId,
    action: `${updated.rfiId} updated`,
    detail: payload.note || `Canonical RFI route updated ${updated.question}.`,
    reason: "RFI lifecycle changes must remain durable and auditable.",
    discipline: "Project Controls",
  });
  persistTenant(tenantId);
  return clone({ rfi: updated, summary: getWorkflowSummary(tenantId) });
}

export function getWorkflowSummary(tenantId) {
  const workflow = getTenantWorkflow(tenantId);
  return clone({
    activeProjectId: workflow.activeProjectId,
    bidCount: workflow.bids.length,
    projectCount: workflow.projects.length,
    fileCount: workflow.files.length,
    takeoffCount: workflow.takeoffs.length,
    rfiCount: workflow.rfis.length,
    auditCount: workflow.audit.length,
    updatedAt: workflow.updatedAt,
  });
}

export function mutateBid(tenantId, action, payload = {}) {
  const workflow = getTenantWorkflow(tenantId);
  const bidIndex = workflow.bids.findIndex((bid) => bid.id === payload.bidId);
  if (bidIndex === -1) {
    throw new Error(`Bid not found: ${payload.bidId}`);
  }

  const currentBid = workflow.bids[bidIndex];
  let updatedBid = currentBid;
  let createdProject = null;

  switch (action) {
    case "update-status": {
      updatedBid = normalizeBidRecord({
        ...currentBid,
        status: payload.status || currentBid.status,
        blocker: payload.status === "Won" ? "Conversion cleared" : currentBid.blocker,
        nextCommercialMove: payload.detail || currentBid.nextCommercialMove,
        lastActionAt: nowIso(),
        actionHistory: [
          stampHistoryEntry(`Status changed to ${payload.status || currentBid.status}`, payload.detail || `Auricrux moved ${currentBid.package} into ${payload.status || currentBid.status}.`),
          ...currentBid.actionHistory,
        ].slice(0, 12),
      }, bidIndex);

      appendAudit(workflow, {
        eventType: "bid-status",
        actorType: "auricrux",
        targetObjectType: "Bid",
        targetObjectId: currentBid.id,
        action: `${currentBid.package} moved to ${payload.status || currentBid.status}`,
        detail: payload.detail || `Auricrux changed ${currentBid.package} to ${payload.status || currentBid.status}.`,
        reason: "Bid-state mutation recorded through the Contractor Command workflow spine.",
        discipline: "Preconstruction",
      });
      break;
    }
    case "clear-blocker": {
      updatedBid = normalizeBidRecord({
        ...currentBid,
        blocker: "No active blocker",
        nextCommercialMove: payload.detail || "Approval blocker cleared and package ready for next commercial move.",
        lastActionAt: nowIso(),
        actionHistory: [
          stampHistoryEntry("Blocker cleared", payload.detail || "Approval blocker cleared and package ready for next commercial move."),
          ...currentBid.actionHistory,
        ].slice(0, 12),
      }, bidIndex);

      appendAudit(workflow, {
        eventType: "bid-repair",
        actorType: "auricrux",
        targetObjectType: "Bid",
        targetObjectId: currentBid.id,
        action: `${currentBid.package} blocker cleared`,
        detail: payload.detail || "Auricrux cleared the approval blocker.",
        reason: "Commercial continuity required blocker removal before next workflow move.",
        discipline: "Preconstruction",
      });
      break;
    }
    case "update-qualification": {
      updatedBid = normalizeBidRecord({
        ...currentBid,
        qualification: {
          ...currentBid.qualification,
          ...(payload.updates || {}),
        },
        nextCommercialMove: payload.updates?.nextGate || payload.detail || currentBid.nextCommercialMove,
        lastActionAt: nowIso(),
        actionHistory: [
          stampHistoryEntry("Qualification command updated", payload.detail || "Qualification command surface updated."),
          ...currentBid.actionHistory,
        ].slice(0, 12),
      }, bidIndex);

      appendAudit(workflow, {
        eventType: "bid-qualification",
        actorType: "auricrux",
        targetObjectType: "Bid",
        targetObjectId: currentBid.id,
        action: `${currentBid.package} qualification updated`,
        detail: payload.detail || "Auricrux updated qualification posture.",
        reason: "Qualification progression must be durable across bid and project flow surfaces.",
        discipline: "Preconstruction",
      });
      break;
    }
    case "route-to-estimate": {
      updatedBid = normalizeBidRecord({
        ...currentBid,
        status: "Qualified",
        blocker: "No active blocker",
        nextCommercialMove: payload.detail || "Qualified opportunity routed into estimate production.",
        qualification: {
          ...currentBid.qualification,
          status: "Ready for estimate",
          evidence: "Qualification packet verified",
          nextGate: "Estimator handoff active",
        },
        lastActionAt: nowIso(),
        actionHistory: [
          stampHistoryEntry("Routed to estimate", payload.detail || "Qualified opportunity routed into estimate production."),
          ...currentBid.actionHistory,
        ].slice(0, 12),
      }, bidIndex);

      appendAudit(workflow, {
        eventType: "bid-estimate-handoff",
        actorType: "auricrux",
        targetObjectType: "Bid",
        targetObjectId: currentBid.id,
        action: `${currentBid.package} routed to estimate`,
        detail: payload.detail || "Auricrux routed qualified opportunity into estimate production.",
        reason: "Qualified bid state must hand off cleanly into estimate production.",
        discipline: "Estimating",
      });
      break;
    }
    case "mark-won-create-project": {
      const projectId = payload.projectId || `PRJ-${currentBid.id.replace(/^BID-/, "")}`;
      const existingProject = workflow.projects.find((project) => project.sourceBidId === currentBid.id || project.id === projectId);
      if (!existingProject) {
        createdProject = normalizeProjectRecord({
          id: projectId,
          sourceBidId: currentBid.id,
          customer: payload.customer || currentBid.customer || "FCA Customer",
          name: `${payload.customer || currentBid.customer || currentBid.package} Project Workspace`,
          stage: "Job Setup",
          nextAction: payload.projectNextAction || "Release baseline kickoff checklist",
          owner: payload.projectOwner || currentBid.estimator || "Project Coordinator",
          due: payload.projectDue || currentBid.dueDate || "TBD",
          superintendent: "Pending assignment",
          permitStatus: "Permit intake pending",
          siteStatus: "Startup packet ready for mobilization planning",
          commercialFocus: payload.projectCommercialFocus || `Converted from ${currentBid.package} commercial approval.`,
          auditStatus: `Project ${projectId} was auto-created from won bid ${currentBid.id}.`,
          auricruxSummary: `Auricrux created ${projectId} from ${currentBid.package} and attached it to the Contractor Command project spine.`,
          actionHistory: [
            stampHistoryEntry("Project auto-created from won bid", payload.detail || `Auricrux converted ${currentBid.package} into ${projectId}.`),
          ],
          lastActionAt: nowIso(),
        }, workflow.projects.length);
        workflow.projects.unshift(createdProject);
      } else {
        createdProject = existingProject;
      }

      workflow.activeProjectId = createdProject.id;
      updatedBid = normalizeBidRecord({
        ...currentBid,
        status: "Won",
        blocker: "Conversion cleared",
        linkedProjectId: createdProject.id,
        nextCommercialMove: payload.detail || `Won work converted into project ${createdProject.id}.`,
        qualification: {
          ...currentBid.qualification,
          status: "Awarded",
          nextGate: `Project ${createdProject.id} active`,
        },
        lastActionAt: nowIso(),
        actionHistory: [
          stampHistoryEntry("Marked won and converted to project", payload.detail || `Auricrux converted ${currentBid.package} into ${createdProject.id}.`),
          ...currentBid.actionHistory,
        ].slice(0, 12),
      }, bidIndex);

      appendAudit(workflow, {
        eventType: "bid-awarded",
        actorType: "auricrux",
        targetObjectType: "Bid",
        targetObjectId: currentBid.id,
        action: `${currentBid.package} marked won`,
        detail: payload.detail || `Auricrux converted ${currentBid.package} into ${createdProject.id}.`,
        reason: "Awarded work must create a project root instead of stopping at commercial status.",
        discipline: "Sales-to-Operations",
      });

      appendAudit(workflow, {
        eventType: "project-created",
        actorType: "auricrux",
        targetObjectType: "Project",
        targetObjectId: createdProject.id,
        action: `${createdProject.id} created from ${currentBid.id}`,
        detail: `Project ${createdProject.id} now anchors job setup continuity for ${currentBid.package}.`,
        reason: "Contractor Command requires a durable project/job root after award.",
        discipline: "Project Setup",
      });
      break;
    }
    default:
      throw new Error(`Unsupported bid action: ${action}`);
  }

  workflow.bids[bidIndex] = updatedBid;
  workflow.updatedAt = nowIso();

  persistTenant(tenantId);
  return clone({
    bid: updatedBid,
    createdProject,
    summary: getWorkflowSummary(tenantId),
  });
}

export function mutateProject(tenantId, action, payload = {}) {
  const workflow = getTenantWorkflow(tenantId);
  const projectIndex = workflow.projects.findIndex((project) => project.id === payload.projectId);
  if (projectIndex === -1) {
    throw new Error(`Project not found: ${payload.projectId}`);
  }

  const currentProject = workflow.projects[projectIndex];
  let updatedProject = currentProject;

  switch (action) {
    case "select-active": {
      workflow.activeProjectId = currentProject.id;
      appendAudit(workflow, {
        eventType: "project-context",
        actorType: "user",
        targetObjectType: "Project",
        targetObjectId: currentProject.id,
        action: `${currentProject.id} selected as active project`,
        detail: payload.detail || `${currentProject.id} selected as active project root.`,
        reason: "Customer-facing portal needs one durable project context at a time.",
        discipline: "Operations",
      });
      break;
    }
    case "advance-stage": {
      updatedProject = normalizeProjectRecord({
        ...currentProject,
        stage: payload.stage || currentProject.stage,
        nextAction: payload.detail || currentProject.nextAction,
        lastActionAt: nowIso(),
        actionHistory: [
          stampHistoryEntry(`Stage moved to ${payload.stage || currentProject.stage}`, payload.detail || `Auricrux moved ${currentProject.id} into ${payload.stage || currentProject.stage}.`),
          ...currentProject.actionHistory,
        ].slice(0, 12),
      }, projectIndex);

      appendAudit(workflow, {
        eventType: "project-stage",
        actorType: "auricrux",
        targetObjectType: "Project",
        targetObjectId: currentProject.id,
        action: `${currentProject.id} moved to ${payload.stage || currentProject.stage}`,
        detail: payload.detail || `Auricrux advanced ${currentProject.id} to ${payload.stage || currentProject.stage}.`,
        reason: "Execution-stage transitions must be durable and auditable.",
        discipline: "Operations",
      });
      break;
    }
    case "clear-permit-blocker": {
      updatedProject = normalizeProjectRecord({
        ...currentProject,
        permitStatus: "Permit cleared for next move",
        siteStatus: "Ready for mobilization planning",
        nextAction: payload.detail || "Permit dependency cleared and project routed toward mobilization.",
        lastActionAt: nowIso(),
        actionHistory: [
          stampHistoryEntry("Permit blocker cleared", payload.detail || "Permit dependency cleared and project routed toward mobilization."),
          ...currentProject.actionHistory,
        ].slice(0, 12),
      }, projectIndex);

      appendAudit(workflow, {
        eventType: "project-repair",
        actorType: "auricrux",
        targetObjectType: "Project",
        targetObjectId: currentProject.id,
        action: `${currentProject.id} permit blocker cleared`,
        detail: payload.detail || "Auricrux cleared the permit blocker.",
        reason: "Project mobility requires permit-path continuity.",
        discipline: "Project Setup",
      });
      break;
    }
    case "update-command-notes": {
      updatedProject = normalizeProjectRecord({
        ...currentProject,
        ownerNote: payload.ownerNote ?? currentProject.ownerNote ?? "",
        customerMilestone: payload.customerMilestone ?? currentProject.customerMilestone ?? "",
        nextAction: payload.detail || currentProject.nextAction,
        lastActionAt: nowIso(),
        actionHistory: [
          stampHistoryEntry("Project command notes saved", payload.detail || "Owner note and customer milestone updated."),
          ...currentProject.actionHistory,
        ].slice(0, 12),
      }, projectIndex);

      appendAudit(workflow, {
        eventType: "project-context",
        actorType: "user",
        targetObjectType: "Project",
        targetObjectId: currentProject.id,
        action: `${currentProject.id} command notes updated`,
        detail: payload.detail || "Project owner note and customer milestone saved.",
        reason: "Delivery teams need durable project command context.",
        discipline: "Operations",
      });
      break;
    }
    default:
      throw new Error(`Unsupported project action: ${action}`);
  }

  workflow.projects[projectIndex] = updatedProject;
  workflow.updatedAt = nowIso();

  persistTenant(tenantId);
  return clone({
    project: updatedProject,
    activeProjectId: workflow.activeProjectId,
    summary: getWorkflowSummary(tenantId),
  });
}

export function mutateFile(tenantId, action, payload = {}) {
  const workflow = getTenantWorkflow(tenantId);
  const detail = payload.detail || "Workflow-backed file mutation recorded.";

  if (action === "create-file-record") {
    const projectId = payload.projectId || workflow.activeProjectId;
    if (!projectId) {
      throw new Error("Project context is required to create a file record.");
    }

    const fileId = payload.fileId || `${projectId}-FILE-${Date.now()}`;
    const createdFile = normalizeFileRecord({
      fileId,
      ownerObjectType: payload.ownerObjectType || "Project",
      ownerObjectId: payload.ownerObjectId || projectId,
      linkedEvidenceTarget: payload.linkedEvidenceTarget || `${projectId} governed evidence chain`,
      evidenceStatus: payload.evidenceStatus || "Pending review",
      versionLabel: payload.versionLabel || "Rev 1",
      name: payload.name || `New file record ${workflow.files.length + 1}`,
      category: payload.category || "Document",
      updated: nowIso(),
      action: payload.actionLabel || "Review",
      discipline: payload.discipline || "Document Control",
      status: payload.status || "Registered",
      owner: payload.owner || "Project Coordinator",
      note: detail,
    }, workflow.files.length);

    workflow.files.unshift(createdFile);
    touchProjectForFileMutation(workflow, projectId, `File register expanded for ${projectId}.`);

    appendAudit(workflow, {
      eventType: "file-created",
      actorType: "auricrux",
      targetObjectType: "FileAsset",
      targetObjectId: projectId,
      action: `${createdFile.name} created in governed file register`,
      detail,
      reason: "Every new file record must attach to a governed project root and emit continuity evidence.",
      discipline: createdFile.discipline,
    });

    workflow.updatedAt = nowIso();

    persistTenant(tenantId);
    return clone({
      file: createdFile,
      summary: getWorkflowSummary(tenantId),
    });
  }

  const fileIndex = workflow.files.findIndex((file) => file.fileId === payload.fileId);
  if (fileIndex === -1) {
    throw new Error(`File not found: ${payload.fileId}`);
  }

  const currentFile = workflow.files[fileIndex];
  let updatedFile = currentFile;

  switch (action) {
    case "register-review": {
      updatedFile = normalizeFileRecord({
        ...currentFile,
        status: "In review",
        action: "Review queued",
        updated: nowIso(),
        note: detail,
      }, fileIndex);

      appendAudit(workflow, {
        eventType: "file-review",
        actorType: "user",
        targetObjectType: "FileAsset",
        targetObjectId: currentFile.ownerObjectId,
        action: `${currentFile.name} queued for review`,
        detail,
        reason: "Document review state must stay attached to the active project spine.",
        discipline: currentFile.discipline || "Document Control",
      });
      break;
    }
    case "classify-file": {
      updatedFile = normalizeFileRecord({
        ...currentFile,
        evidenceStatus: payload.evidenceStatus || "Classification complete",
        status: payload.status || "Classified",
        action: payload.actionLabel || "Classification saved",
        category: payload.category || currentFile.category,
        updated: nowIso(),
        note: detail,
      }, fileIndex);

      appendAudit(workflow, {
        eventType: "file-classified",
        actorType: "auricrux",
        targetObjectType: "FileAsset",
        targetObjectId: currentFile.ownerObjectId,
        action: `${currentFile.name} classified`,
        detail,
        reason: "File categorization and evidence status must be durable and auditable.",
        discipline: currentFile.discipline || "Document Control",
      });
      break;
    }
    case "link-evidence": {
      updatedFile = normalizeFileRecord({
        ...currentFile,
        linkedEvidenceTarget: payload.linkedEvidenceTarget || currentFile.linkedEvidenceTarget,
        evidenceStatus: payload.evidenceStatus || "Evidence linked",
        status: payload.status || "Linked to governed object",
        action: payload.actionLabel || "Evidence linked",
        updated: nowIso(),
        note: detail,
      }, fileIndex);

      appendAudit(workflow, {
        eventType: "file-linked",
        actorType: "auricrux",
        targetObjectType: "FileAsset",
        targetObjectId: currentFile.ownerObjectId,
        action: `${currentFile.name} linked to evidence target`,
        detail,
        reason: "Contractor Command requires file-to-evidence continuity on governed objects.",
        discipline: currentFile.discipline || "Document Control",
      });
      break;
    }
    case "create-briefing": {
      updatedFile = normalizeFileRecord({
        ...currentFile,
        evidenceStatus: payload.evidenceStatus || "Briefing generated",
        status: payload.status || "Auricrux briefing ready",
        action: payload.actionLabel || "Open briefing",
        updated: nowIso(),
        note: detail,
      }, fileIndex);

      appendAudit(workflow, {
        eventType: "file-briefing",
        actorType: "auricrux",
        targetObjectType: "FileAsset",
        targetObjectId: currentFile.ownerObjectId,
        action: `${currentFile.name} briefing generated`,
        detail,
        reason: "Auricrux briefing output must be visible as a durable project-linked artifact.",
        discipline: currentFile.discipline || "Document Control",
      });
      break;
    }
    default:
      throw new Error(`Unsupported file action: ${action}`);
  }

  workflow.files[fileIndex] = updatedFile;
  touchProjectForFileMutation(workflow, currentFile.ownerObjectId, `File continuity updated for ${currentFile.ownerObjectId}.`);
  workflow.updatedAt = nowIso();

  persistTenant(tenantId);
  return clone({
    file: updatedFile,
    summary: getWorkflowSummary(tenantId),
  });
}
