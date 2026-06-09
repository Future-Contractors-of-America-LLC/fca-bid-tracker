import { useEffect, useMemo, useState } from "react";
import { readCustomerSession } from "../customerSession";
import {
  readWorkspaceState,
  updateWorkspaceState,
  WORKSPACE_STATE_EVENT,
} from "../workspaceStateStore";

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
      customer: session.company,
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

export default function useWorkspaceState() {
  const [state, setState] = useState(() => bindCustomerSession(readWorkspaceState()));

  useEffect(() => {
    function syncFromStorage() {
      setState(bindCustomerSession(readWorkspaceState()));
    }

    syncFromStorage();
    window.addEventListener(WORKSPACE_STATE_EVENT, syncFromStorage);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.removeEventListener(WORKSPACE_STATE_EVENT, syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const api = useMemo(
    () => ({
      state,
      refreshSyncStamp(source = "Persisted workspace state active") {
        const saved = updateWorkspaceState((prev) => ({
          ...prev,
          meta: {
            ...prev.meta,
            persistenceState: source,
            lastSyncedAt: new Date().toISOString(),
          },
        }));
        setState(bindCustomerSession(saved));
      },
    }),
    [state]
  );

  return api;
}
