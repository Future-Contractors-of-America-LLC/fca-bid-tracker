import { useEffect, useMemo, useState, useCallback } from "react";
import { fetchOpportunityWorkspace } from "../api/workflowClient";

export default function useOpportunityWorkspaceDetail(opportunityId, fallbackBid) {
  const [item, setItem] = useState(null);
  const [meta, setMeta] = useState({
    backingSource: "fallback-shell-state",
    persistenceState: "Fallback opportunity shell active",
    lastSyncedAt: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      if (!opportunityId) {
        if (!active) return;
        setItem(null);
        setMeta({
          backingSource: "fallback-shell-state",
          persistenceState: "No opportunity identity resolved",
          lastSyncedAt: null,
        });
        return;
      }

      try {
        const payload = await fetchOpportunityWorkspace(opportunityId);
        if (!active) return;
        setItem(payload.item);
        setMeta({
          backingSource: payload.backingSource || "api-workflow-store",
          persistenceState: "API opportunity workspace active",
          lastSyncedAt: new Date().toISOString(),
        });
      } catch {
        if (!active) return;
        setItem(null);
        setMeta({
          backingSource: "fallback-shell-state",
          persistenceState: fallbackBid ? "Fallback opportunity shell active" : "Opportunity workspace unavailable",
          lastSyncedAt: null,
        });
      }
    }

    hydrate();
    return () => {
      active = false;
    };
  }, [opportunityId, fallbackBid, reloadKey]);

  return useMemo(() => ({ item, meta, refresh }), [item, meta, refresh]);
}
