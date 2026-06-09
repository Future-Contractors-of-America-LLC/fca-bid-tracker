import { portalContinuityObjects } from "./systemState";

export const CONTINUITY_OBJECT_WORKSPACE_KEY = "fca_continuity_object_workspace_v1";

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
    }),
    ...current,
  ]);
}
