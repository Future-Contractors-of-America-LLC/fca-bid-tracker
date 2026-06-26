import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWorkflowAudit, fetchWorkflowFiles, mutateWorkflowFile } from "../api/workflowClient";
import { allowDemoFallbacks } from "../config/productionMode";
import { portalFiles, projectAuditEvents } from "../systemState";

function scopeSeedFiles(files, projectId, filters = {}) {
  let items = files.filter((file) => !projectId || !file.ownerObjectId || file.ownerObjectId === "PRJ-A117" || file.ownerObjectId === projectId);

  if (filters.category && filters.category !== "All") {
    items = items.filter((file) => file.category === filters.category);
  }

  if (filters.status && filters.status !== "All") {
    items = items.filter((file) => file.status === filters.status);
  }

  if (filters.q) {
    const q = filters.q.toLowerCase();
    items = items.filter((file) => [file.name, file.category, file.status, file.owner, file.discipline, file.linkedEvidenceTarget, file.note].filter(Boolean).join(" ").toLowerCase().includes(q));
  }

  return items.map((file, index) => ({
    ...file,
    fileId: file.fileId || `${projectId || "PRJ-A117"}-FILE-${index + 1}`,
    ownerObjectType: file.ownerObjectType || "Project",
    ownerObjectId: projectId || file.ownerObjectId || "PRJ-A117",
  }));
}

function scopeSeedAudit(events, projectId) {
  return events.filter(
    (event) =>
      !projectId ||
      !event.targetObjectId ||
      event.targetObjectId === projectId ||
      event.detail?.includes("PRJ-A117") ||
      event.reason?.includes("PRJ-A117")
  );
}

export default function useWorkflowEvidence(projectId) {
  const [filters, setFilters] = useState({ category: "All", status: "All", q: "" });
  const [files, setFiles] = useState(() =>
    allowDemoFallbacks() ? scopeSeedFiles(portalFiles, projectId, filters) : [],
  );
  const [auditEvents, setAuditEvents] = useState(() =>
    allowDemoFallbacks() ? scopeSeedAudit(projectAuditEvents, projectId) : [],
  );
  const [meta, setMeta] = useState({
    backingSource: allowDemoFallbacks() ? "seeded-system-state" : "api-pending",
    persistenceState: allowDemoFallbacks()
      ? "Fallback workflow evidence active"
      : "Loading workflow evidence",
    lastSyncedAt: null,
  });

  const hydrate = useCallback(async () => {
    try {
      const [filesPayload, auditPayload] = await Promise.all([
        fetchWorkflowFiles({ projectId, ...filters }),
        fetchWorkflowAudit(projectId),
      ]);

      setFiles(Array.isArray(filesPayload.items) ? filesPayload.items : []);
      setAuditEvents(Array.isArray(auditPayload.items) ? auditPayload.items : []);
      setMeta({
        backingSource: "api-workflow-store",
        persistenceState: "Workflow-backed file and audit evidence active",
        lastSyncedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (allowDemoFallbacks()) {
        setFiles(scopeSeedFiles(portalFiles, projectId, filters));
        setAuditEvents(scopeSeedAudit(projectAuditEvents, projectId));
        setMeta({
          backingSource: "seeded-system-state",
          persistenceState: "Fallback workflow evidence active",
          lastSyncedAt: null,
        });
      } else {
        setFiles([]);
        setAuditEvents([]);
        setMeta({
          backingSource: "api-error",
          persistenceState: error?.message || "Workflow API unavailable",
          error: true,
          lastSyncedAt: null,
        });
      }
    }
  }, [projectId, filters]);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const [filesPayload, auditPayload] = await Promise.all([
          fetchWorkflowFiles({ projectId, ...filters }),
          fetchWorkflowAudit(projectId),
        ]);

        if (!active) return;

        setFiles(Array.isArray(filesPayload.items) ? filesPayload.items : []);
        setAuditEvents(Array.isArray(auditPayload.items) ? auditPayload.items : []);
        setMeta({
          backingSource: "api-workflow-store",
          persistenceState: "Workflow-backed file and audit evidence active",
          lastSyncedAt: new Date().toISOString(),
        });
      } catch (error) {
        if (!active) return;
        if (allowDemoFallbacks()) {
          setFiles(scopeSeedFiles(portalFiles, projectId, filters));
          setAuditEvents(scopeSeedAudit(projectAuditEvents, projectId));
          setMeta({
            backingSource: "seeded-system-state",
            persistenceState: "Fallback workflow evidence active",
            lastSyncedAt: null,
          });
        } else {
          setFiles([]);
          setAuditEvents([]);
          setMeta({
            backingSource: "api-error",
            persistenceState: error?.message || "Workflow API unavailable",
            error: true,
            lastSyncedAt: null,
          });
        }
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [projectId, filters]);

  const mutateFile = useCallback(
    async (action, body = {}) => {
      const result = await mutateWorkflowFile(action, { ...body, projectId });
      await hydrate();
      return result;
    },
    [hydrate, projectId]
  );

  const summary = useMemo(() => {
    const byCategory = files.reduce((acc, file) => {
      const key = file.category || "Document";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const byStatus = files.reduce((acc, file) => {
      const key = file.status || "Active";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      total: files.length,
      byCategory,
      byStatus,
    };
  }, [files]);

  return useMemo(
    () => ({
      files,
      auditEvents,
      meta,
      filters,
      setFilters,
      summary,
      mutateFile,
      refreshEvidence: hydrate,
    }),
    [auditEvents, files, filters, hydrate, meta, mutateFile, summary]
  );
}
