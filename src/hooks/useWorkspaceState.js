import { useEffect, useMemo, useState } from "react";
import { auricruxRail, currentProject, portalTenant, workspaceContext } from "../workspaceState";

const STORAGE_KEY = "fca_workspace_state_v1";

const defaultState = {
  tenant: portalTenant,
  project: currentProject,
  workspace: workspaceContext,
  auricrux: auricruxRail,
  meta: {
    backingSource: "localStorage",
    persistenceState: "Seeded from canonical shell state",
    lastSyncedAt: null,
  },
};

export default function useWorkspaceState() {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = {
          ...defaultState,
          meta: {
            ...defaultState.meta,
            lastSyncedAt: new Date().toISOString(),
          },
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        setState(seeded);
        return;
      }

      const parsed = JSON.parse(raw);
      setState(parsed);
    } catch {
      setState(defaultState);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // persistence best-effort only for shell hardening phase
    }
  }, [state]);

  const api = useMemo(
    () => ({
      state,
      refreshSyncStamp() {
        setState((prev) => ({
          ...prev,
          meta: {
            ...prev.meta,
            persistenceState: "Persisted workspace state active",
            lastSyncedAt: new Date().toISOString(),
          },
        }));
      },
    }),
    [state]
  );

  return api;
}
