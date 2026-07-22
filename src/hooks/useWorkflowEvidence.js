import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWorkflowAudit, fetchWorkflowFiles, mutateWorkflowFile } from "../api/workflowClient";

/**
 * Files/audit evidence — fail closed.
 * Seeded/localStorage theater is intentionally removed so empty or red means the API is the truth.
 */
export default function useWorkflowEvidence(projectId) {
  const [filters, setFilters] = useState({ category: "All", status: "All", q: "" });
  const [files, setFiles] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [meta, setMeta] = useState({
    backingSource: "api-pending",
    persistenceState: "Loading workflow evidence",
    lastSyncedAt: null,
  });

  const hydrate = useCallback(async () => {
    try {
      const [filesPayload, auditPayload] = await Promise.all([
        fetchWorkflowFiles({ projectId, ...filters }),
        fetchWorkflowAudit({ projectId }),
      ]);

      setFiles(Array.isArray(filesPayload.items) ? filesPayload.items : []);
      setAuditEvents(Array.isArray(auditPayload.items) ? auditPayload.items : []);
      setMeta({
        backingSource: "api-workflow-store",
        persistenceState: "Workflow-backed file and audit evidence active",
        lastSyncedAt: new Date().toISOString(),
      });
    } catch (error) {
      setFiles([]);
      setAuditEvents([]);
      setMeta({
        backingSource: "api-error",
        persistenceState: error?.message || "Workflow API unavailable",
        error: true,
        lastSyncedAt: null,
      });
    }
  }, [projectId, filters]);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const [filesPayload, auditPayload] = await Promise.all([
          fetchWorkflowFiles({ projectId, ...filters }),
          fetchWorkflowAudit({ projectId }),
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
