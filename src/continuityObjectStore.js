import { appendAutomationLog } from "./sessionAutomationLog";
import { appendCommercialLog } from "./sessionCommercialLog";
import { portalContinuityObjects } from "./systemState";

export const CONTINUITY_OBJECT_WORKSPACE_KEY = "fca_continuity_object_workspace_v1";

function stampHistoryEntry(label, detail) {
  return {
    at: new Date().toISOString(),
    label,
    detail,
  };
}

function normalizeContinuityObject(item = {}, index = 0) {
  return {
    id: item.id || `COBJ-${index + 1}`,
    type: item.type || "Unclassified",
    projectId: item.projectId || "PRJ-UNASSIGNED",
    fileId: item.fileId || null,
    title: item.title || `Continuity object ${index + 1}`,
    status: item.status || "Open",
    owner: item.owner || "Unassigned",
    nextAction: item.nextAction || "Review continuity object",
    auditImpact: item.auditImpact || "Audit impact pending classification.",
    billingStatus: item.billingStatus || "Not linked",
    actionHistory: Array.isArray(item.actionHistory) ? item.actionHistory : [],
    lastActionAt: item.lastActionAt || null,
  };
}

function seedContinuityObjects() {
  return portalContinuityObjects.map((item, index) => normalizeContinuityObject(item, index));
}

export function readContinuityObjects() {
  if (typeof window === "undefined") return seedContinuityObjects();

  try {
    const raw = window.localStorage.getItem(CONTINUITY_OBJECT_WORKSPACE_KEY);
    if (!raw) return seedContinuityObjects();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedContinuityObjects();
    return parsed.map((item, index) => normalizeContinuityObject(item, index));
  } catch {
    return seedContinuityObjects();
  }
}

export function writeContinuityObjects(items = []) {
  const normalized = items.map((item, index) => normalizeContinuityObject(item, index));

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONTINUITY_OBJECT_WORKSPACE_KEY, JSON.stringify(normalized));
    } catch {
      // best-effort persistence during shell hardening phase
    }
  }

  return normalized;
}

export function readContinuityObjectsForProject(projectId, items = readContinuityObjects()) {
  return items.filter((item) => item.projectId === projectId);
}

export function createContinuityObject(input = {}) {
  const current = readContinuityObjects();
  return writeContinuityObjects([
    normalizeContinuityObject({
      ...input,
      id: input.id || `COBJ-${Date.now()}`,
      lastActionAt: new Date().toISOString(),
      actionHistory: [stampHistoryEntry("Continuity object created", input.nextAction || "Continuity object entered into workspace")],
    }),
    ...current,
  ]);
}

export function updateContinuityObject(objectId, updates = {}, logDetail = "Continuity object updated") {
  const current = readContinuityObjects();
  const next = current.map((item, index) => {
    if (item.id !== objectId) return normalizeContinuityObject(item, index);

    const merged = normalizeContinuityObject(
      {
        ...item,
        ...updates,
        id: objectId,
        lastActionAt: new Date().toISOString(),
        actionHistory: [
          stampHistoryEntry(updates.historyLabel || "Continuity object updated", logDetail),
          ...(Array.isArray(item.actionHistory) ? item.actionHistory : []),
        ].slice(0, 12),
      },
      index
    );

    appendAutomationLog({
      type: "continuity-object",
      title: `${merged.id} updated`,
      detail: logDetail,
      route: "/portal/audit",
    });

    appendCommercialLog({
      type: "continuity-object",
      title: `${merged.id} continuity moved`,
      detail: logDetail,
      route: "/portal/audit",
    });

    return merged;
  });

  return writeContinuityObjects(next);
}

export function markContinuityObjectBillingReady(objectId) {
  return updateContinuityObject(
    objectId,
    {
      status: "Billing Ready",
      billingStatus: "Ready to invoice / change billing linkage active",
      nextAction: "Move change value into billing review queue",
      historyLabel: "Billing linkage activated",
    },
    "Continuity object linked to billing follow-through and queued for commercial review."
  );
}

export function completeQcPunch(objectId) {
  return updateContinuityObject(
    objectId,
    {
      status: "Closed",
      billingStatus: "Closeout / retainage release ready",
      nextAction: "Finalize closeout and release retainage follow-through",
      historyLabel: "QC / punch completed",
    },
    "QC or punch object completed and moved toward closeout and retainage follow-through."
  );
}
