import { currentProject, portalProjects } from "./systemState";

export const PROJECT_WORKSPACE_KEY = "fca_project_workspace_v1";
export const ACTIVE_PROJECT_KEY = "fca_active_project_v1";

function normalizeProjectId(value, fallback = "A117") {
  const source = String(value || fallback).replace(/^PRJ-?/i, "");
  const compact = source.replace(/[^A-Za-z0-9]+/g, "");
  return `PRJ-${compact || fallback}`;
}

function normalizeProjectRecord(project = {}, index = 0) {
  const projectId = normalizeProjectId(project.id, `${index + 1}`);
  const customer = project.customer || currentProject.customer || "Unassigned customer";
  const stage = project.stage || "Estimating";
  const nextAction = project.nextAction || "Advance project";
  const owner = project.owner || "Unassigned";
  const permitStatus = project.permitStatus || "Permit status pending";
  const siteStatus = project.siteStatus || "Site status pending";

  return {
    id: projectId,
    customer,
    name: project.name || `${customer} · ${projectId}`,
    projectNumber: project.projectNumber || projectId,
    opportunityId: project.opportunityId || `OPP-${projectId.replace(/^PRJ-/, "")}`,
    clientId: project.clientId || `CLIENT-${projectId.replace(/^PRJ-/, "")}`,
    siteId: project.siteId || `SITE-${projectId.replace(/^PRJ-/, "")}`,
    stage,
    nextAction,
    owner,
    due: project.due || "TBD",
    superintendent: project.superintendent || "Pending assignment",
    permitStatus,
    siteStatus,
    commercialFocus: project.commercialFocus || "Commercial focus pending",
    projectHealth: project.projectHealth || (stage.toLowerCase().includes("closeout") ? "Closeout watch" : stage.toLowerCase().includes("execution") ? "Field active" : "Preconstruction active"),
    continuityAlerts: Array.isArray(project.continuityAlerts)
      ? project.continuityAlerts
      : [permitStatus, nextAction].filter(Boolean),
    fileSetLabel: project.fileSetLabel || "18 linked files and operating artifacts",
    fileSpineStatus:
      project.fileSpineStatus ||
      `${customer} files, onboarding packets, and coordination artifacts are expected to remain attached to ${projectId}.`,
    auditLabel: project.auditLabel || "Auricrux action log active",
    auditStatus:
      project.auditStatus ||
      `Commercial, file, and operating changes for ${projectId} should remain visible in one audit spine.`,
    auricruxMode: project.auricruxMode || "Context-aware workspace guidance",
    auricruxSummary:
      project.auricruxSummary ||
      `Auricrux is preserving ${projectId} as the active project spine for ${customer}.`,
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

export function readActiveProjectId(projects = readProjectWorkspace()) {
  const fallbackId = projects[0]?.id || normalizeProjectId(currentProject.id);
  if (typeof window === "undefined") return fallbackId;

  try {
    const stored = window.localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (!stored) return fallbackId;
    return normalizeProjectId(stored, fallbackId.replace(/^PRJ-/, ""));
  } catch {
    return fallbackId;
  }
}

export function writeActiveProjectId(projectId) {
  const normalized = normalizeProjectId(projectId, currentProject.id);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(ACTIVE_PROJECT_KEY, normalized);
    } catch {
      // best-effort persistence during shell hardening phase
    }
  }

  return normalized;
}

export function readActiveProjectContext(projects = readProjectWorkspace()) {
  const activeId = readActiveProjectId(projects);
  return projects.find((project) => project.id === activeId) || projects[0] || normalizeProjectRecord(currentProject, 0);
}

export function selectActiveProject(projectId, projects = readProjectWorkspace()) {
  const normalizedId = writeActiveProjectId(projectId);
  return projects.find((project) => project.id === normalizedId) || projects[0] || normalizeProjectRecord(currentProject, 0);
}
