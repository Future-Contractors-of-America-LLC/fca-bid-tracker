import { useEffect, useMemo, useState } from "react";
import { readCustomerSession } from "../customerSession";
import { defaultWorkspaceState, STORAGE_KEY } from "../systemState";

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
    project: {
      ...baseState.project,
      id: `PRJ-${String(session.projectAccess?.primaryProjectId || "A117").replace(/[^A-Za-z0-9]/g, "")}`,
      customer: session.company,
      name: `${session.company} Active Contractor Command Workspace`,
      auditStatus: `Authenticated project/file continuity is bound to ${session.projectAccess?.primaryProjectId || "A-117"}.`,
    },
    workspace: {
      ...baseState.workspace,
      stageSummary: `${baseState.workspace.stageSummary} Customer ownership is currently bound to ${session.projectAccess?.projectIds?.join(", ") || "A-117"}.`,
      auditSummary: `Auricrux, customer-facing actions, and workspace transitions should resolve into one audit spine for ${session.projectAccess?.primaryProjectId || "A-117"}.`,
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
      primaryProjectId: session.projectAccess?.primaryProjectId || "A-117",
      projectIds: session.projectAccess?.projectIds || ["A-117"],
      fileScope: session.projectAccess?.fileScope || "project-owned",
    },
  };
}

export default function useWorkspaceState() {
  const [state, setState] = useState(bindCustomerSession(defaultWorkspaceState));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = bindCustomerSession({
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
      setState(bindCustomerSession(parsed));
    } catch {
      setState(bindCustomerSession(defaultWorkspaceState));
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
    }),
    [state]
  );

  return api;
}
