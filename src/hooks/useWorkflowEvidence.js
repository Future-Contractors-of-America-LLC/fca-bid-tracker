import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWorkflowAudit, fetchWorkflowFiles, mutateWorkflowFile } from "../api/workflowClient";
import { portalFiles, projectAuditEvents } from "../systemState";

function scopeSeedFiles(files, projectId) {
  return files
    .filter((file) => !projectId || !file.ownerObjectId || file.ownerObjectId === "PRJ-A117" || file.ownerObjectId === projectId)
    .map((file, index) => ({
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
  const [files, setFiles] = useState(() => scopeSeedFiles(portalFiles, projectId));
  const [auditEvents, setAuditEvents] = useState(() => scopeSeedAudit(projectAuditEvents, projectId));
  const [meta, setMeta] = useState({
    backingSource: "seeded-system-state",
    persistenceState: "Fallback workflow evidence active",
    lastSyncedAt: null,
  });

  const hydrate = useCallback(async () => {
    try {
      const [filesPayload, auditPayload] = await Promise.all([
        fetchWorkflowFiles(projectId),
        fetchWorkflowAudit(projectId),
      ]);

      setFiles(Array.isArray(filesPayload.items) ? filesPayload.items : []);
      setAuditEvents(Array.isArray(auditPayload.items) ? auditPayload.items : []);
      setMeta({
        backingSource: "api-workflow-store",
        persistenceState: "Workflow-backed file and audit evidence active",
        lastSyncedAt: new Date().toISOString(),
      });
    } catch {
      setFiles(scopeSeedFiles(portalFiles, projectId));
      setAuditEvents(scopeSeedAudit(projectAuditEvents, projectId));
      setMeta({
        backingSource: "seeded-system-state",
        persistenceState: "Fallback workflow evidence active",
        lastSyncedAt: null,
      });
    }
  }, [projectId]);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const [filesPayload, auditPayload] = await Promise.all([
          fetchWorkflowFiles(projectId),
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
      } catch {
        if (!active) return;
        setFiles(scopeSeedFiles(portalFiles, projectId));
        setAuditEvents(scopeSeedAudit(projectAuditEvents, projectId));
        setMeta({
          backingSource: "seeded-system-state",
          persistenceState: "Fallback workflow evidence active",
          lastSyncedAt: null,
        });
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [projectId]);

  const mutateFile = useCallback(
    async (action, body = {}) => {
      const result = await mutateWorkflowFile(action, { ...body, projectId });
      await hydrate();
      return result;
    },
    [hydrate, projectId]
  );

  return useMemo(
    () => ({
      files,
      auditEvents,
      meta,
      mutateFile,
      refreshEvidence: hydrate,
    }),
    [auditEvents, files, hydrate, meta, mutateFile]
  );
}
