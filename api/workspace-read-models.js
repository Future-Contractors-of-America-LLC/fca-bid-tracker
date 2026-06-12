import { listBids, listProjects, listFiles, listAuditEvents } from "./workflow-store.js";
import { getLeadProject, listLeadProjects } from "./leads-store.js";
import { getProjectReadiness } from "./academy-store.js";

function countBy(items = [], selector) {
  return items.reduce((acc, item) => {
    const key = selector(item) || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function normalizeUnifiedProject(project = {}) {
  if (project.projectId) {
    return {
      id: project.projectId,
      name: project.projectName,
      customer: project.clientId || "Governed client",
      stage: project.status || "active",
      nextAction: project.nextAction || "Release startup checklist",
      owner: project.owner || "Project Coordinator",
      due: project.updatedAt || project.createdAt || null,
      superintendent: "Pending assignment",
      permitStatus: project.permitStatus || "Permit intake pending",
      siteStatus: project.siteStatus || "Startup packet ready for mobilization planning",
      commercialFocus: project.commercialFocus || `Converted from ${project.sourceOpportunityId || "governed opportunity"}.`,
      fileSetLabel: `Lead-converted project ${project.projectId} attached to the shared workspace spine`,
      fileSpineStatus: `Files, evidence, and Academy readiness should normalize against ${project.projectId}.`,
      auditLabel: "Project continuity audit active",
      auditStatus: `Lead-converted project ${project.projectId} is now visible in canonical workspace truth.`,
      auricruxMode: "Project-aware workspace guidance",
      auricruxSummary: `Auricrux is reading ${project.projectId} as part of the unified project spine.`,
      sourceBidId: project.sourceOpportunityId || null,
      sourceType: "lead-converted-project",
      lastActionAt: project.updatedAt || project.createdAt || null,
      actionHistory: [],
      isCanonical: true,
    };
  }

  return {
    ...project,
    sourceType: project.sourceType || "workflow-project",
    isCanonical: true,
  };
}

export function listUnifiedProjects(tenantId) {
  const workflowProjects = listProjects(tenantId).map((project) => normalizeUnifiedProject(project));
  const leadProjects = listLeadProjects(tenantId).map((project) => normalizeUnifiedProject(project));
  const byId = new Map();

  [...workflowProjects, ...leadProjects].forEach((project) => {
    if (!byId.has(project.id)) {
      byId.set(project.id, project);
    }
  });

  return Array.from(byId.values());
}

export function getOpportunityWorkspace(tenantId, opportunityId) {
  const bids = listBids(tenantId);
  const bid = bids.find((item) => item.id === opportunityId);

  if (!bid) {
    throw new Error(`Opportunity workspace not found: ${opportunityId}`);
  }

  const linkedProjectId = bid.linkedProjectId || null;
  const linkedFiles = linkedProjectId ? listFiles(tenantId, { projectId: linkedProjectId }) : [];

  return {
    opportunityId: bid.id,
    tenantId,
    clientId: bid.customerId || `client-${bid.id.toLowerCase()}`,
    siteId: bid.siteId || `site-${bid.id.toLowerCase()}`,
    status: bid.status,
    projectIntent: bid.scopePackage,
    serviceLine: "estimating",
    estimateSummary: {
      estimateId: `EST-${bid.id}`,
      status: bid.qualification?.status || "Discovery in progress",
      versionCount: bid.status === "Qualified" || bid.status === "Won" ? 2 : 1,
    },
    fileSummary: {
      total: linkedFiles.length,
      linked: linkedFiles.filter((file) => (file.evidenceStatus || "").toLowerCase().includes("linked")).length,
      unlinked: linkedFiles.filter((file) => !(file.evidenceStatus || "").toLowerCase().includes("linked")).length,
    },
    conversionReadiness: {
      canConvertToProject: Boolean(linkedProjectId || bid.status === "Won"),
      blockingReason: linkedProjectId || bid.status === "Won" ? null : bid.blocker,
    },
    auricruxSummary: {
      nextAction: bid.qualification?.nextGate || bid.nextCommercialMove,
    },
  };
}

export function getProjectWorkspace(tenantId, projectId) {
  const unifiedProjects = listUnifiedProjects(tenantId);
  const project = unifiedProjects.find((item) => item.id === projectId);

  if (!project) {
    throw new Error(`Project workspace not found: ${projectId}`);
  }

  const files = listFiles(tenantId, { projectId });
  const auditEvents = listAuditEvents(tenantId, { projectId });
  const academyReadiness = getProjectReadiness(tenantId, projectId);

  return {
    projectId: project.id,
    tenantId,
    sourceOpportunityId: project.sourceBidId || null,
    projectName: project.name,
    projectNumber: project.id,
    status: project.stage,
    stage: project.stage,
    owner: project.owner,
    permitStatus: project.permitStatus,
    siteStatus: project.siteStatus,
    sourceType: project.sourceType || "workflow-project",
    fileSummary: {
      total: files.length,
      briefingsReady: files.filter((file) => `${file.status || ""} ${file.evidenceStatus || ""}`.toLowerCase().includes("briefing")).length,
      byStatus: countBy(files, (file) => file.status || "Active"),
      byCategory: countBy(files, (file) => file.category || "Document"),
    },
    auditSummary: {
      total: auditEvents.length,
      recentEventTypes: countBy(auditEvents.slice(0, 10), (event) => event.eventType || "workflow-event"),
    },
    academyReadiness,
    auricruxSummary: {
      nextAction: academyReadiness.nextAcademyAction || project.nextAction,
    },
  };
}

export function getFileSummary(tenantId, ownerObjectType = "Project", ownerObjectId) {
  if (!ownerObjectId) {
    throw new Error("ownerObjectId is required for file summary.");
  }

  const items = ownerObjectType === "Project"
    ? listFiles(tenantId, { projectId: ownerObjectId })
    : listFiles(tenantId).filter((file) => file.ownerObjectType === ownerObjectType && file.ownerObjectId === ownerObjectId);

  return {
    ownerObjectType,
    ownerObjectId,
    total: items.length,
    linked: items.filter((file) => (file.evidenceStatus || "").toLowerCase().includes("linked")).length,
    unlinked: items.filter((file) => !(file.evidenceStatus || "").toLowerCase().includes("linked")).length,
    briefingsReady: items.filter((file) => `${file.status || ""} ${file.evidenceStatus || ""}`.toLowerCase().includes("briefing")).length,
    byStatus: countBy(items, (file) => file.status || "Active"),
    byCategory: countBy(items, (file) => file.category || "Document"),
  };
}

export function getAuditSummary(tenantId, relatedObjectType = "Project", relatedObjectId) {
  if (!relatedObjectId) {
    throw new Error("relatedObjectId is required for audit summary.");
  }

  const items = relatedObjectType === "Project"
    ? listAuditEvents(tenantId, { projectId: relatedObjectId })
    : listAuditEvents(tenantId).filter((event) => event.targetObjectType === relatedObjectType && event.targetObjectId === relatedObjectId);

  return {
    relatedObjectType,
    relatedObjectId,
    total: items.length,
    byEventType: countBy(items, (event) => event.eventType || "workflow-event"),
    byActorType: countBy(items, (event) => event.actorType || "system"),
    mostRecent: items.slice(0, 5).map((event) => ({
      auditEventId: event.id,
      eventType: event.eventType,
      summary: event.action,
      createdAt: event.time,
    })),
  };
}
