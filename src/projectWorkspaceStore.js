import { portalProjects } from "./systemState";

export const PROJECT_WORKSPACE_KEY = "fca_project_workspace_v1";
export const ACTIVE_PROJECT_KEY = "fca_active_project_v1";

function normalizeProjectRecord(project = {}, index = 0) {
  return {
    id: project.id || `PRJ-${index + 1}`,
    name: project.name || `${project.customer || "Unassigned customer"} Project Workspace`,
    customer: project.customer || "Unassigned customer",
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
    actionHistory: Array.isArray(project.actionHistory) ? project.actionHistory : [],
    lastActionAt: project.lastActionAt || null,
  };
}

function seedProjectWorkspace() {
  return portalProjects.map((project, index) => normalizeProjectRecord(project, index));
}

function resolveActiveProjectId(projects) {
  if (typeof window === "undefined") return projects[0]?.id || null;

  try {
    const savedId = window.localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (savedId && projects.some((project) => project.id === savedId)) return savedId;
  } catch {
    // best-effort read only during shell hardening phase
  }

  return projects[0]?.id || null;
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
      const activeId = resolveActiveProjectId(normalized);
      if (activeId) window.localStorage.setItem(ACTIVE_PROJECT_KEY, activeId);
    } catch {
      // best-effort persistence during shell hardening phase
    }
  }

  return normalized;
}

export function readActiveProjectId(projects = readProjectWorkspace()) {
  return resolveActiveProjectId(projects);
}

export function writeActiveProjectId(projectId, projects = readProjectWorkspace()) {
  const fallbackId = projects[0]?.id || null;
  const nextId = projects.some((project) => project.id === projectId) ? projectId : fallbackId;

  if (typeof window !== "undefined") {
    try {
      if (nextId) window.localStorage.setItem(ACTIVE_PROJECT_KEY, nextId);
    } catch {
      // best-effort persistence during shell hardening phase
    }
  }

  return nextId;
}

export function readActiveProjectWorkspace(projects = readProjectWorkspace()) {
  const activeId = resolveActiveProjectId(projects);
  return projects.find((project) => project.id === activeId) || projects[0] || null;
}

export function updateProjectWorkspace(mutator) {
  const current = readProjectWorkspace();
  const next = typeof mutator === "function" ? mutator(current) : current;
  const saved = writeProjectWorkspace(next);
  writeActiveProjectId(resolveActiveProjectId(saved), saved);
  return saved;
}
