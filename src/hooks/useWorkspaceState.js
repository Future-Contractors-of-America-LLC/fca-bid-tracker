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
    meta: {
      ...baseState.meta,
      customerSessionEmail: session.email,
      customerWorkspaceLabel: session.workspaceLabel,
      authenticatedCustomer: session.company,
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
