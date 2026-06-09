import { useEffect, useMemo, useState } from "react";
import { readCustomerSession } from "../customerSession";
import { readActiveProjectWorkspace } from "../projectWorkspaceStore";
import { defaultWorkspaceState, STORAGE_KEY } from "../systemState";

function buildProjectContext(baseProject, activeProject) {
  if (!activeProject) return baseProject;

  return {
    ...baseProject,
    id: activeProject.id || baseProject.id,
    name: activeProject.name || `${activeProject.customer || baseProject.customer} Project Workspace`,
    customer: activeProject.customer || baseProject.customer,
    stage: activeProject.stage || baseProject.stage,
    nextAction: activeProject.nextAction || baseProject.nextAction,
    owner: activeProject.owner || baseProject.owner,
    due: activeProject.due || baseProject.due,
    superintendent: activeProject.superintendent || baseProject.superintendent,
    permitStatus: activeProject.permitStatus || baseProject.permitStatus,
    siteStatus: activeProject.siteStatus || baseProject.siteStatus,
    commercialFocus: activeProject.commercialFocus || baseProject.commercialFocus,
    actionHistory: activeProject.actionHistory || baseProject.actionHistory || [],
    lastActionAt: activeProject.lastActionAt || baseProject.lastActionAt || null,
    fileSetLabel:
      activeProject.fileSetLabel ||
      `${(activeProject.actionHistory || []).length} persisted project actions and workspace-linked artifacts`,
    fileSpineStatus:
      activeProject.fileSpineStatus ||
      `Files, document-control actions, and Auricrux continuity are being normalized against ${activeProject.id || baseProject.id}.`,
    auditLabel: activeProject.auditLabel || "Project continuity audit active",
    auditStatus:
      activeProject.auditStatus ||
      `Recent stage, permit, and coordination actions are preserved under ${activeProject.id || baseProject.id}.`,
    auricruxMode: activeProject.auricruxMode || "Project-aware workspace guidance",
    auricruxSummary:
      activeProject.auricruxSummary ||
      `Auricrux is reading ${activeProject.id || baseProject.id} as the active project spine for this workspace.`,
  };
}

function applyActiveProject(baseState, projectOverride = null) {
  const activeProject = projectOverride || readActiveProjectWorkspace();
  if (!activeProject) return baseState;

  const resolvedProject = buildProjectContext(baseState.project, activeProject);

  return {
    ...baseState,
    project: resolvedProject,
    workspace: {
      ...baseState.workspace,
      currentNextAction: activeProject.nextAction || baseState.workspace.currentNextAction,
      nextActionOwner: activeProject.owner || baseState.workspace.nextActionOwner,
      auditSummary:
        activeProject.auditStatus || baseState.workspace.auditSummary,
    },
    auricrux: {
      ...baseState.auricrux,
      nextRecommendedAction:
        activeProject.nextAction || baseState.auricrux.nextRecommendedAction,
      recommendationReason:
        activeProject.commercialFocus || baseState.auricrux.recommendationReason,
      currentBlocker:
        activeProject.permitStatus || baseState.auricrux.currentBlocker,
      blockerImpact:
        activeProject.siteStatus || baseState.auricrux.blockerImpact,
      lastActionResult:
        activeProject.lastActionAt
          ? `Most recent project action recorded at ${activeProject.lastActionAt}.`
          : baseState.auricrux.lastActionResult,
    },
    meta: {
      ...baseState.meta,
      activeProjectId: resolvedProject.id,
    },
  };
}

function bindCustomerSession(baseState) {
  const session = readCustomerSession();
  if (!session?.authenticated) return baseState;

  return {
    ...baseState,
    tenant: {
      ...baseState.tenant,
      name: session.company,
      roleSummary: `${session.workspaceLabel} is authenticated and running through the shared FCA workspace continuity layer.`,
    },
    meta: {
      ...baseState.meta,
      customerId: session.customerId,
      customerRole: session.role,
      customerSessionEmail: session.email,
      customerWorkspaceLabel: session.workspaceLabel,
      authenticatedCustomer: session.company,
      enabledProducts: {
        saas: session.enabledProducts?.saas !== false,
        lms: session.enabledProducts?.lms !== false,
        auricrux: session.enabledProducts?.auricrux !== false,
      },
    },
  };
}

function hydrateWorkspaceState(baseState, projectOverride = null) {
  return bindCustomerSession(applyActiveProject(baseState, projectOverride));
}

export default function useWorkspaceState() {
  const [state, setState] = useState(() => hydrateWorkspaceState(defaultWorkspaceState));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = hydrateWorkspaceState({
          ...defaultWorkspaceState,
          meta: {
            ...defaultWorkspaceState.meta,
            lastSyncedAt: new Date().toISOString(),
          },
        });
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        setState(seeded);
        return;
      }

      const parsed = JSON.parse(raw);
      setState(hydrateWorkspaceState(parsed));
    } catch {
      setState(hydrateWorkspaceState(defaultWorkspaceState));
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrateWorkspaceState(state)));
    } catch {
      // persistence best-effort only for shell hardening phase
    }
  }, [state]);

  const api = useMemo(
    () => ({
      state,
      refreshSyncStamp(source = "Persisted workspace state active") {
        setState((prev) =>
          hydrateWorkspaceState({
            ...prev,
            meta: {
              ...prev.meta,
              persistenceState: source,
              lastSyncedAt: new Date().toISOString(),
            },
          })
        );
      },
      syncActiveProject(project, source = "Active project context synchronized") {
        if (!project) return;

        setState((prev) =>
          hydrateWorkspaceState(
            {
              ...prev,
              meta: {
                ...prev.meta,
                persistenceState: source,
                lastSyncedAt: new Date().toISOString(),
              },
            },
            project
          )
        );
      },
    }),
    [state]
  );

  return api;
}
