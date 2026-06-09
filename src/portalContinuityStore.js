import { portalBilling as seededPortalBilling, portalMessages as seededPortalMessages } from "./systemState";
import { readWorkspaceState } from "./workspaceStateStore";

function activeProjectToken(project = {}) {
  return project?.sourceBidId || project?.id || "PRJ-A117";
}

export function readPortalMessages() {
  const state = readWorkspaceState();
  const project = state.project || {};
  const token = activeProjectToken(project);
  const projectLabel = project.id || "active project";
  const nextAction = state.workspace?.currentNextAction || "advance the active project";
  const blocker = state.auricrux?.currentBlocker || "no active blocker";

  return seededPortalMessages.map((message, index) => ({
    ...message,
    id: message.id || `MSG-${index + 1}`,
    subject:
      index === 0
        ? `${message.subject} · ${projectLabel}`
        : message.subject,
    preview:
      index === seededPortalMessages.length - 1
        ? `Auricrux is tracking ${token} and recommends ${nextAction.toLowerCase()} while ${blocker.toLowerCase()} remains visible.`
        : message.preview,
    nextAction:
      index === seededPortalMessages.length - 1
        ? `Advance ${project.id || "the active project"} through ${nextAction}`
        : message.nextAction,
    projectId: project.id,
    routeContext: `/portal/projects -> /portal/files -> /portal/billing for ${projectLabel}`,
  }));
}

export function readPortalBilling() {
  const state = readWorkspaceState();
  const project = state.project || {};
  const token = activeProjectToken(project);
  const nextAction = state.workspace?.currentNextAction || "advance billing follow-through";

  return seededPortalBilling.map((invoice, index) => ({
    ...invoice,
    id: invoice.id || `INVROW-${index + 1}`,
    customer: index === seededPortalBilling.length - 1 ? project.customer || invoice.customer : invoice.customer,
    billingBasis:
      index === seededPortalBilling.length - 1
        ? `${invoice.billingBasis} · Active project ${project.id || token}`
        : invoice.billingBasis,
    nextAction:
      index === seededPortalBilling.length - 1
        ? `${nextAction} for ${project.id || token}`
        : invoice.nextAction,
    projectId: project.id,
    routeContext: `/portal/billing anchored to ${project.id || token}`,
  }));
}
