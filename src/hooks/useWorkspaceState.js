import { useEffect, useMemo, useState } from "react";
import { defaultWorkspaceState, STORAGE_KEY } from "../systemState";

export default function useWorkspaceState() {
  const [state, setState] = useState(defaultWorkspaceState);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = {
          ...defaultWorkspaceState,
          meta: {
            ...defaultWorkspaceState.meta,
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
      setState(defaultWorkspaceState);
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
      refreshSyncStamp(source = "Persisted workspace state active") {
        setState((prev) => ({
          ...prev,
          meta: {
            ...prev.meta,
            persistenceState: source,
            lastSyncedAt: new Date().toISOString(),
          },
        }));
      },
    }),
    [state]
  );

  return api;
}
