import { useEffect, useMemo, useState } from "react";
import { fetchAcademyAssignments } from "../api/workflowClient";

export default function useAcademyProjectReadiness(projectId) {
  const [state, setState] = useState({
    items: [],
    readiness: null,
    meta: {
      backingSource: "fallback-shell-state",
      persistenceState: "No academy readiness loaded",
      lastSyncedAt: null,
    },
  });

  useEffect(() => {
    let active = true;

    async function hydrate() {
      if (!projectId) {
        if (!active) return;
        setState({
          items: [],
          readiness: null,
          meta: {
            backingSource: "fallback-shell-state",
            persistenceState: "No project context for academy readiness",
            lastSyncedAt: null,
          },
        });
        return;
      }

      try {
        const payload = await fetchAcademyAssignments({ projectId });
        if (!active) return;
        setState({
          items: payload.items || [],
          readiness: payload.projectReadiness || null,
          meta: {
            backingSource: payload.backingSource || "api-academy-store",
            persistenceState: "API academy readiness active",
            lastSyncedAt: new Date().toISOString(),
          },
        });
      } catch {
        if (!active) return;
        setState({
          items: [],
          readiness: null,
          meta: {
            backingSource: "fallback-shell-state",
            persistenceState: "Academy readiness unavailable",
            lastSyncedAt: null,
          },
        });
      }
    }

    hydrate();
    return () => {
      active = false;
    };
  }, [projectId]);

  return useMemo(() => state, [state]);
}
