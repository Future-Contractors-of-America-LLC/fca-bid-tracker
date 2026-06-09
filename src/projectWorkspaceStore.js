import { portalProjects } from "./systemState";

export const PROJECT_WORKSPACE_KEY = "fca_project_workspace_v1";

function normalizeProjectRecord(project = {}, index = 0) {
  const resolvedId = project.id || `PRJ-${index + 1}`;

  return {
    id: resolvedId,
    title: project.title || project.name || `${resolvedId} Workspace`,
    customer: project.customer || "Unassigned customer",
    sourceBidId: project.sourceBidId || null,
    stage: project.stage || "Estimating",
    nextAction: project.nextAction || "Advance project",
    owner: project.owner || "Unassigned",
    due: project.due || "TBD",
    superintendent: project.superintendent || "Pending assignment",
    permitStatus: project.permitStatus || "Permit status pending",
    siteStatus: project.siteStatus || "Site status pending",
    commercialFocus: project.commercialFocus || "Commercial focus pending",
    fileCount: Number.isFinite(project.fileCount) ? project.fileCount : 0,
    latestBriefingSummary: project.latestBriefingSummary || "No document briefing recorded yet.",
    auditSummary: project.auditSummary || "Audit spine active and awaiting the next routed action.",
    actionHistory: Array.isArray(project.actionHistory) ? project.actionHistory : [],
    lastActionAt: project.lastActionAt || null,
  };
}

function seedProjectWorkspace() {
  return portalProjects.map((project, index) => normalizeProjectRecord(project, index));
}

export function readProjectWorkspace() {
  if (typeof window === "undefined") return seedProjectWorkspace();

  try {
    const raw = window.localStorage.getItem(PROJECT_WORKSPACE_KEY);
    if (!raw) return seedProjectWorkspace();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedProjectWorkspace();
    return parsed.map((project, index) => normalizeProjectRecord(project, index));
  } catch {
    return seedProjectWorkspace();
  }
}

export function writeProjectWorkspace(projects = []) {
  const normalized = projects.map((project, index) => normalizeProjectRecord(project, index));

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PROJECT_WORKSPACE_KEY, JSON.stringify(normalized));
    } catch {
      // best-effort persistence during shell hardening phase
    }
  }

  return normalized;
}

export function updateProjectWorkspace(mutator) {
  const current = readProjectWorkspace();
  const next = typeof mutator === "function" ? mutator(current) : current;
  return writeProjectWorkspace(next);
}
