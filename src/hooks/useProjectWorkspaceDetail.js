import { useEffect, useMemo, useState } from "react";
import { fetchProjectWorkspace, fetchFileSummary, fetchAuditSummary } from "../api/workflowClient";

export default function useProjectWorkspaceDetail(projectId, fallbackProject) {
  const [item, setItem] = useState(null);
  const [meta, setMeta] = useState({
    projectSource: "fallback-shell-state",
    fileSource: "fallback-shell-state",
    auditSource: "fallback-shell-state",
    persistenceState: "Fallback project workspace active",
    lastSyncedAt: null,
  });

  useEffect(() => {
    let active = true;

    async function hydrate() {
      if (!projectId) {
        if (!active) return;
        setItem(null);
        setMeta({
          projectSource: "fallback-shell-state",
          fileSource: "fallback-shell-state",
          auditSource: "fallback-shell-state",
          persistenceState: "No project identity resolved",
          lastSyncedAt: null,
        });
        return;
      }

      try {
        const [projectPayload, filePayload, auditPayload] = await Promise.all([
          fetchProjectWorkspace(projectId),
          fetchFileSummary("Project", projectId),
          fetchAuditSummary("Project", projectId),
        ]);
        if (!active) return;
        setItem({
          ...projectPayload.item,
          fileSummary: filePayload.summary,
          auditSummary: auditPayload.summary,
        });
        setMeta({
          projectSource: projectPayload.backingSource || "api-workflow-store",
          fileSource: filePayload.backingSource || "api-workflow-store",
          auditSource: auditPayload.backingSource || "api-workflow-store",
          persistenceState: "API project workspace active",
          lastSyncedAt: new Date().toISOString(),
        });
      } catch {
        if (!active) return;
        setItem(null);
        setMeta({
          projectSource: "fallback-shell-state",
          fileSource: "fallback-shell-state",
          auditSource: "fallback-shell-state",
          persistenceState: fallbackProject ? "Fallback project workspace active" : "Project workspace unavailable",
          lastSyncedAt: null,
        });
      }
    }

    hydrate();
    return () => {
      active = false;
    };
  }, [projectId, fallbackProject]);

  return useMemo(() => ({ item, meta }), [item, meta]);
}
