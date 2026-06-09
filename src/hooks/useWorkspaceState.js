import { useEffect, useMemo, useState } from "react";
import { readCustomerSession } from "../customerSession";
import { readActiveProjectContext } from "../projectWorkspaceStore";
import { defaultWorkspaceState, STORAGE_KEY } from "../systemState";

function buildProjectBoundState(baseState, project) {
  if (!project) return baseState;

  return {
    ...baseState,
    project: {
      ...baseState.project,
      ...project,
    },
    workspace: {
      ...baseState.workspace,
      currentStageLabel: project.stage || baseState.workspace.currentStageLabel,
      stageSummary: `${project.id} is operating in ${project.stage || "active"} mode with files, audit, and customer continuity tied to one project spine.`,
      currentNextAction: project.nextAction || baseState.workspace.currentNextAction,
      nextActionOwner: project.owner || baseState.workspace.nextActionOwner,
      auditSummary: `${project.id} should resolve project actions, file linkage, and Auricrux activity into one continuity timeline.`,
    },
    auricrux: {
      ...baseState.auricrux,
      nextRecommendedAction: project.nextAction || baseState.auricrux.nextRecommendedAction,
      recommendationReason: `${project.id} is the active project spine and should drive the next operational move.`,
      currentBlocker: project.permitStatus || baseState.auricrux.currentBlocker,
      blockerImpact: `${project.id} cannot advance cleanly if permit, file, or owner-linked continuity is unclear.`,
      lastActionResult: `${project.id} is now the canonical project context for portal continuity.`,
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

function buildSeededState() {
  return bindCustomerSession(buildProjectBoundState(defaultWorkspaceState, readActiveProjectContext()));
}

export default function useWorkspaceState() {
  const [state, setState] = useState(buildSeededState);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = {
          ...buildSeededState(),
          meta: {
            ...buildSeededState().meta,
            lastSyncedAt: new Date().toISOString(),
          },
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        setState(seeded);
        return;
      }

      const parsed = JSON.parse(raw);
      const rebound = bindCustomerSession(buildProjectBoundState(parsed, readActiveProjectContext()));
      setState(rebound);
    } catch {
      setState(buildSeededState());
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bindCustomerSession(state)));
    } catch {
      // persistence best-effort only for shell hardening phase
    }
  }, [state]);

  const api = useMemo(
    () => ({
      state,
      refreshSyncStamp(source = "Persisted workspace state active") {
        setState((prev) =>
          bindCustomerSession({
            ...prev,
            meta: {
              ...prev.meta,
              persistenceState: source,
              lastSyncedAt: new Date().toISOString(),
            },
          })
        );
      },
      syncProjectContext(project, source = "Canonical project context active") {
        if (!project) return;
        setState((prev) =>
          bindCustomerSession({
            ...buildProjectBoundState(prev, project),
            meta: {
              ...prev.meta,
              persistenceState: source,
              lastSyncedAt: new Date().toISOString(),
              activeProjectId: project.id,
            },
          })
        );
      },
    }),
    [state]
  );

  return api;
}
