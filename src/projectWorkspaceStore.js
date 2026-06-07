import { portalProjects } from "./systemState";

export const PROJECT_WORKSPACE_KEY = "fca_project_workspace_v1";

function normalizeProjectRecord(project = {}, index = 0) {
  return {
    id: project.id || `PRJ-${index + 1}`,
    customer: project.customer || "Unassigned customer",
    stage: project.stage || "Estimating",
    nextAction: project.nextAction || "Advance project",
    owner: project.owner || "Unassigned",
    due: project.due || "TBD",
    superintendent: project.superintendent || "Pending assignment",
    permitStatus: project.permitStatus || "Permit status pending",
    siteStatus: project.siteStatus || "Site status pending",
    commercialFocus: project.commercialFocus || "Commercial focus pending",
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
