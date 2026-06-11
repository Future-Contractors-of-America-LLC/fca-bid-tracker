import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWorkflowAudit } from "../api/workflowClient";
import { projectAuditEvents } from "../systemState";

function scopeSeedAudit(events, projectId, filters = {}) {
  let items = events.filter(
    (event) =>
      !projectId ||
      !event.targetObjectId ||
      event.targetObjectId === projectId ||
      event.detail?.includes("PRJ-A117") ||
      event.reason?.includes("PRJ-A117")
  );

  if (filters.eventType && filters.eventType !== "All") {
    items = items.filter((event) => event.eventType === filters.eventType);
  }

  if (filters.actorType && filters.actorType !== "All") {
    items = items.filter((event) => event.actorType === filters.actorType);
  }

  if (filters.q) {
    const q = filters.q.toLowerCase();
    items = items.filter((event) => [event.action, event.detail, event.reason, event.discipline, event.targetObjectType, event.actorType, event.eventType].filter(Boolean).join(" ").toLowerCase().includes(q));
  }

  return items;
}

export default function useWorkflowAudit(projectId) {
  const [filters, setFilters] = useState({ eventType: "All", actorType: "All", q: "" });
  const [auditEvents, setAuditEvents] = useState(() => scopeSeedAudit(projectAuditEvents, projectId, filters));
  const [meta, setMeta] = useState({
    backingSource: "seeded-system-state",
    persistenceState: "Fallback workflow audit active",
    lastSyncedAt: null,
  });

  const hydrate = useCallback(async () => {
    try {
      const payload = await fetchWorkflowAudit({ projectId, ...filters });
      setAuditEvents(Array.isArray(payload.items) ? payload.items : []);
      setMeta({
        backingSource: "api-workflow-store",
        persistenceState: "Workflow-backed audit evidence active",
        lastSyncedAt: new Date().toISOString(),
      });
    } catch {
      setAuditEvents(scopeSeedAudit(projectAuditEvents, projectId, filters));
      setMeta({
        backingSource: "seeded-system-state",
        persistenceState: "Fallback workflow audit active",
        lastSyncedAt: null,
      });
    }
  }, [projectId, filters]);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const payload = await fetchWorkflowAudit({ projectId, ...filters });
        if (!active) return;
        setAuditEvents(Array.isArray(payload.items) ? payload.items : []);
        setMeta({
          backingSource: "api-workflow-store",
          persistenceState: "Workflow-backed audit evidence active",
          lastSyncedAt: new Date().toISOString(),
        });
      } catch {
        if (!active) return;
        setAuditEvents(scopeSeedAudit(projectAuditEvents, projectId, filters));
        setMeta({
          backingSource: "seeded-system-state",
          persistenceState: "Fallback workflow audit active",
          lastSyncedAt: null,
        });
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [projectId, filters]);

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
