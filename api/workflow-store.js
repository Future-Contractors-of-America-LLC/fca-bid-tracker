import { portalBids, portalProjects, projectAuditEvents } from "../src/systemState.js";

const STORE_KEY = "__FCA_CONTRACTOR_COMMAND_WORKFLOW_STORE__";
const DEFAULT_TENANT_ID = "TEN-FCA-001";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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
    sourceBidId: project.sourceBidId || null,
    lastActionAt: project.lastActionAt || null,
    actionHistory: Array.isArray(project.actionHistory) ? project.actionHistory : [],
  };
}

function normalizeAuditEvent(event = {}, index = 0) {
  return {
    id: event.id || `AUD-${index + 1}`,
    time: event.time || new Date().toISOString(),
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
      index
    )
  );
}

function seedProjects() {
  return portalProjects.map((project, index) => normalizeProjectRecord(project, index));
}

function seedAudit() {
  return projectAuditEvents.map((event, index) => normalizeAuditEvent(event, index));
}

function seedTenantWorkflow() {
  return {
    bids: seedBids(),
    projects: seedProjects(),
    audit: seedAudit(),
    activeProjectId: seedProjects()[0]?.id || null,
    updatedAt: new Date().toISOString(),
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

function stampHistoryEntry(label, detail) {
  return {
    at: new Date().toISOString(),
    label,
    detail,
  };
}

function appendAudit(workflow, event) {
  const normalized = normalizeAuditEvent(
    {
      ...event,
      id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      time: new Date().toISOString(),
    },
    workflow.audit.length
  );

  workflow.audit = [normalized, ...workflow.audit].slice(0, 60);
  workflow.updatedAt = new Date().toISOString();
  return normalized;
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
    }))
  );
}

export function listAuditEvents(tenantId) {
  return clone(getTenantWorkflow(tenantId).audit);
}

export function getWorkflowSummary(tenantId) {
  const workflow = getTenantWorkflow(tenantId);
  return clone({
    activeProjectId: workflow.activeProjectId,
    bidCount: workflow.bids.length,
    projectCount: workflow.projects.length,
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
        lastActionAt: new Date().toISOString(),
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
        lastActionAt: new Date().toISOString(),
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
        lastActionAt: new Date().toISOString(),
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
        lastActionAt: new Date().toISOString(),
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
          lastActionAt: new Date().toISOString(),
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
        lastActionAt: new Date().toISOString(),
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
  workflow.updatedAt = new Date().toISOString();

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
        lastActionAt: new Date().toISOString(),
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
        lastActionAt: new Date().toISOString(),
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
    default:
      throw new Error(`Unsupported project action: ${action}`);
  }

  workflow.projects[projectIndex] = updatedProject;
  workflow.updatedAt = new Date().toISOString();

  return clone({
    project: updatedProject,
    activeProjectId: workflow.activeProjectId,
    summary: getWorkflowSummary(tenantId),
  });
}
