import { currentProject, defaultWorkspaceState, STORAGE_KEY } from "./systemState";
import { readProjectWorkspace } from "./projectWorkspaceStore";

export const WORKSPACE_STATE_EVENT = "fca:workspace-state-updated";

function dispatchWorkspaceStateEvent() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(WORKSPACE_STATE_EVENT));
}

function buildProjectShell(project = {}) {
  return {
    ...currentProject,
    id: project.id || currentProject.id,
    name: project.title || project.name || currentProject.name,
    customer: project.customer || currentProject.customer,
    stage: project.stage || currentProject.stage,
    fileSetLabel: `${project.fileCount || 0} linked files and project artifacts`,
    fileSpineStatus: project.latestBriefingSummary || currentProject.fileSpineStatus,
    auditLabel: "Auricrux action log active",
    auditStatus: project.auditSummary || currentProject.auditStatus,
    auricruxMode: "Context-aware workspace guidance",
    auricruxSummary:
      project.sourceBidId
        ? `Auricrux is preserving bid ${project.sourceBidId} -> ${project.id} continuity while keeping files, audit events, and next actions on one shared project spine.`
        : currentProject.auricruxSummary,
    sourceBidId: project.sourceBidId || null,
    nextAction: project.nextAction || currentProject.nextAction,
    due: project.due || currentProject.due || "TBD",
    owner: project.owner || "Unassigned",
    fileCount: project.fileCount || 0,
    latestBriefingSummary: project.latestBriefingSummary || "No document briefing recorded yet.",
    auditSummary: project.auditSummary || currentProject.auditStatus,
  };
}

function resolveActiveProject(baseState) {
  const projects = readProjectWorkspace();
  const activeProjectId = baseState?.meta?.activeProjectId || baseState?.project?.id || currentProject.id;
  const matchedProject = projects.find((project) => project.id === activeProjectId) || projects[0];

  if (!matchedProject) {
    return {
      project: baseState?.project || currentProject,
      meta: {
        ...baseState?.meta,
        activeProjectId: baseState?.project?.id || currentProject.id,
      },
    };
  }

  return {
    project: buildProjectShell(matchedProject),
    meta: {
      ...baseState?.meta,
      activeProjectId: matchedProject.id,
      activeSourceBidId: matchedProject.sourceBidId || null,
      activeProjectLastActionAt: matchedProject.lastActionAt || null,
    },
  };
}

export function hydrateWorkspaceState(baseState = defaultWorkspaceState) {
  const resolved = resolveActiveProject(baseState);
  return {
    ...defaultWorkspaceState,
    ...baseState,
    project: resolved.project,
    meta: {
      ...defaultWorkspaceState.meta,
      ...baseState.meta,
      ...resolved.meta,
    },
  };
}

export function readWorkspaceState() {
  if (typeof window === "undefined") return hydrateWorkspaceState(defaultWorkspaceState);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return hydrateWorkspaceState(defaultWorkspaceState);
    const parsed = JSON.parse(raw);
    return hydrateWorkspaceState(parsed);
  } catch {
    return hydrateWorkspaceState(defaultWorkspaceState);
  }
}

export function writeWorkspaceState(state = defaultWorkspaceState) {
  const hydrated = hydrateWorkspaceState(state);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrated));
    } catch {
      // best-effort persistence during shell hardening phase
    }
    dispatchWorkspaceStateEvent();
  }

  return hydrated;
}

export function updateWorkspaceState(mutator) {
  const current = readWorkspaceState();
  const next = typeof mutator === "function" ? mutator(current) : current;
  return writeWorkspaceState(next);
}

export function setActiveWorkspaceProject(projectId, detail = "Active project context updated.") {
  const projects = readProjectWorkspace();
  const matched = projects.find((project) => project.id === projectId);
  if (!matched) return readWorkspaceState();

  return updateWorkspaceState((current) => ({
    ...current,
    project: buildProjectShell(matched),
    workspace: {
      ...current.workspace,
      currentStageLabel: matched.stage,
      stageSummary: `${matched.id} is active with ${matched.stage} stage ownership and ${matched.nextAction} as the next action.`,
      currentNextAction: matched.nextAction,
      nextActionOwner: matched.owner || current.workspace.nextActionOwner,
      auditSummary: matched.auditSummary || current.workspace.auditSummary,
    },
    auricrux: {
      ...current.auricrux,
      nextRecommendedAction: matched.nextAction || current.auricrux.nextRecommendedAction,
      currentBlocker: matched.permitStatus || current.auricrux.currentBlocker,
      lastAction: detail,
      lastActionResult: `${matched.id} is now the active workspace project spine.`,
    },
    meta: {
      ...current.meta,
      activeProjectId: matched.id,
      activeSourceBidId: matched.sourceBidId || null,
      persistenceState: detail,
      lastSyncedAt: new Date().toISOString(),
    },
  }));
}
