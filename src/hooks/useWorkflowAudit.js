import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWorkflowAudit } from "../api/workflowClient";

export default function useWorkflowAudit(projectId) {
  const [filters, setFilters] = useState({ eventType: "All", actorType: "All", q: "" });
  const [auditEvents, setAuditEvents] = useState([]);
  const [meta, setMeta] = useState({
    backingSource: "loading",
    persistenceState: "Loading workflow audit from FCA Contractor Command…",
    loadError: "",
    lastSyncedAt: null,
  });

  const hydrate = useCallback(async () => {
    setMeta((current) => ({
      ...current,
      backingSource: "loading",
      persistenceState: "Loading workflow audit from FCA Contractor Command…",
      loadError: "",
    }));
    try {
      const payload = await fetchWorkflowAudit({ projectId, ...filters });
      setAuditEvents(Array.isArray(payload.items) ? payload.items : []);
      setMeta({
        backingSource: "api-workflow-store",
        persistenceState: "Workflow-backed audit evidence active",
        loadError: "",
        lastSyncedAt: new Date().toISOString(),
      });
      return payload.items || [];
    } catch (err) {
      setAuditEvents([]);
      setMeta({
        backingSource: "api-error",
        persistenceState: "Unable to load workflow audit",
        loadError: err?.message || "Unable to load workflow audit state.",
        lastSyncedAt: null,
      });
      return [];
    }
  }, [projectId, filters]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const summary = useMemo(() => {
    const byEventType = auditEvents.reduce((acc, event) => {
      const key = event.eventType || "workflow-event";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const byActorType = auditEvents.reduce((acc, event) => {
      const key = event.actorType || "system";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      total: auditEvents.length,
      byEventType,
      byActorType,
    };
  }, [auditEvents]);

  return useMemo(
    () => ({
      auditEvents,
      meta,
      filters,
      setFilters,
      summary,
      refreshAudit: hydrate,
    }),
    [auditEvents, filters, hydrate, meta, summary]
  );
}
