import { useEffect, useMemo, useState } from "react";
import { readCustomerSession } from "../customerSession";
import { readActiveProjectWorkspace } from "../projectWorkspaceStore";
import { allowDemoFallbacks } from "../config/productionMode";
import { defaultWorkspaceState, STORAGE_KEY } from "../systemState";

const LIVE_EMPTY_PROJECT = {
  id: null,
  name: "No active project",
  customer: "Select a live project",
  stage: "Awaiting project context",
  fileSetLabel: "No files until a live project is selected",
  fileSpineStatus: "File, audit, and Auricrux continuity attach after you select a live project root.",
  auditLabel: "Audit spine idle",
  auditStatus: "Project-stage changes will write here once a live project is active.",
  auricruxMode: "Waiting for project context",
  auricruxSummary: "Auricrux will bind guidance to the active live project once one is selected.",
  nextAction: "Open Founder Proof Path and select PRJ-BID-1",
  owner: "Unassigned",
  due: "—",
  superintendent: "—",
  permitStatus: "No permit context",
  siteStatus: "No site context",
  commercialFocus: "Select live project spine",
  actionHistory: [],
  lastActionAt: null,
};

function productionSafeBaseState() {
  if (allowDemoFallbacks()) return defaultWorkspaceState;
  return {
    ...defaultWorkspaceState,
    project: LIVE_EMPTY_PROJECT,
    workspace: {
      ...defaultWorkspaceState.workspace,
      currentNextAction: "Select live project PRJ-BID-1 and walk the Founder Proof Path",
      nextActionOwner: "Workspace operator",
      auditSummary: "No seeded project narrative on production — live API spine only.",
    },
    auricrux: {
      ...defaultWorkspaceState.auricrux,
      nextRecommendedAction: "Open /portal/proof and bind PRJ-BID-1",
      recommendationReason: "Production must not present Package A-117 as localStorage theater.",
      currentBlocker: "No active live project selected",
      blockerImpact: "Files, takeoff, RFI, and invoice lanes stay empty until a live project is bound.",
      lastActionResult: "Demo fallbacks disabled on this host.",
    },
  };
}

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
      `Files, document control, and Auricrux guidance are synced to ${activeProject.id || baseProject.id}.`,
    auditLabel: activeProject.auditLabel || "Project audit trail active",
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
  if (!activeProject?.id) {
    return allowDemoFallbacks() ? baseState : { ...baseState, project: LIVE_EMPTY_PROJECT };
  }

  const resolvedProject = buildProjectContext(baseState.project, activeProject);

  return {
    ...baseState,
    project: resolvedProject,
    workspace: {
      ...baseState.workspace,
      currentNextAction: activeProject.nextAction || baseState.workspace.currentNextAction,
      nextActionOwner: activeProject.owner || baseState.workspace.nextActionOwner,
      auditSummary: activeProject.auditStatus || baseState.workspace.auditSummary,
    },
    auricrux: {
      ...baseState.auricrux,
      nextRecommendedAction: activeProject.nextAction || baseState.auricrux.nextRecommendedAction,
      recommendationReason: activeProject.commercialFocus || baseState.auricrux.recommendationReason,
      currentBlocker: activeProject.permitStatus || baseState.auricrux.currentBlocker,
      blockerImpact: activeProject.siteStatus || baseState.auricrux.blockerImpact,
      lastActionResult: activeProject.lastActionAt
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
      roleSummary: `${session.workspaceLabel} is signed in to the shared FCA workspace.`,
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

function readStoredWorkspaceState() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return parsed;
  } catch {
    return null;
  }
}

export default function useWorkspaceState() {
  const [state, setState] = useState(() => hydrateWorkspaceState(productionSafeBaseState()));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = readStoredWorkspaceState();
    const base = productionSafeBaseState();

    if (!stored || (!allowDemoFallbacks() && stored?.project?.id === "PRJ-A117" && !readActiveProjectWorkspace()?.id)) {
      const seeded = hydrateWorkspaceState({
        ...base,
        meta: {
          ...base.meta,
          lastSyncedAt: new Date().toISOString(),
          persistenceState: allowDemoFallbacks()
            ? "Persisted workspace state active"
            : "Live workspace — seeded project narrative suppressed",
        },
      });

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      } catch {
        // persistence best-effort only for shell hardening phase
      }

      setState(seeded);
      return;
    }

    setState(hydrateWorkspaceState(stored));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

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
          }),
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
            project,
          ),
        );
      },
    }),
    [state],
  );

  return api;
}
