import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createCanonicalDocumentBriefing,
  fetchCanonicalDocumentBriefings,
  fetchCanonicalFiles,
  fetchWorkflowAudit,
  fetchWorkflowFiles,
  mutateWorkflowFile,
  registerCanonicalFiles,
  upsertCanonicalFile,
} from "../api/workflowClient";
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

function filterCanonicalFiles(items = [], filters = {}) {
  let files = Array.isArray(items) ? items : [];

  if (filters.category && filters.category !== "All") {
    files = files.filter((file) => file.category === filters.category);
  }

  if (filters.status && filters.status !== "All") {
    files = files.filter((file) => file.status === filters.status || file.evidenceStatus === filters.status);
  }

  if (filters.q) {
    const q = filters.q.toLowerCase();
    files = files.filter((file) =>
      [file.fileName, file.name, file.category, file.status, file.owner, file.discipline, file.linkedEvidenceTarget, file.note]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }

  return files;
}

function mergeBriefingsIntoFiles(files = [], briefings = []) {
  const sourceMap = new Map();

  for (const briefing of briefings) {
    for (const fileId of briefing.sourceFileIds || []) {
      sourceMap.set(fileId, briefing);
    }
  }

  return files.map((file) => {
    const briefing = sourceMap.get(file.fileId);
    if (!briefing) return file;

    return {
      ...file,
      status: file.status === "registered" ? "briefing-ready" : file.status,
      evidenceStatus: "Briefing generated",
      actionLabel: "Open briefing",
      briefingTitle: briefing.title,
      briefingSummary: briefing.summary,
      briefingKeyFacts: briefing.keyFindings || [],
      briefingDetectedGaps: briefing.risks || [],
      briefingRecommendedNextActions: ["Review briefing and preserve downstream continuity before advancing the project state."],
    };
  });
}

export default function useWorkflowEvidence(projectId) {
  const [filters, setFilters] = useState({ category: "All", status: "All", q: "" });
  const [files, setFiles] = useState(() => scopeSeedFiles(portalFiles, projectId, filters));
  const [auditEvents, setAuditEvents] = useState(() => scopeSeedAudit(projectAuditEvents, projectId));
  const [meta, setMeta] = useState({
    backingSource: "seeded-system-state",
    persistenceState: "Fallback workflow evidence active",
    lastSyncedAt: null,
  });

  const hydrate = useCallback(async () => {
    try {
      const [canonicalFiles, auditPayload, canonicalBriefings] = await Promise.all([
        fetchCanonicalFiles({ projectId, ...filters }),
        fetchWorkflowAudit(projectId),
        fetchCanonicalDocumentBriefings({ projectId }),
      ]);

      const mergedFiles = mergeBriefingsIntoFiles(filterCanonicalFiles(canonicalFiles, filters), canonicalBriefings);
      setFiles(mergedFiles);
      setAuditEvents(Array.isArray(auditPayload.items) ? auditPayload.items : []);
      setMeta({
        backingSource: "canonical-phase-a-files",
        persistenceState: "Canonical Phase A file and briefing spine active",
        lastSyncedAt: new Date().toISOString(),
      });
    } catch {
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
      } catch {
        setFiles(scopeSeedFiles(portalFiles, projectId, filters));
        setAuditEvents(scopeSeedAudit(projectAuditEvents, projectId));
        setMeta({
          backingSource: "seeded-system-state",
          persistenceState: "Fallback workflow evidence active",
          lastSyncedAt: null,
        });
      }
    }
  }, [projectId, filters]);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const [canonicalFiles, auditPayload, canonicalBriefings] = await Promise.all([
          fetchCanonicalFiles({ projectId, ...filters }),
          fetchWorkflowAudit(projectId),
          fetchCanonicalDocumentBriefings({ projectId }),
        ]);

        if (!active) return;

        const mergedFiles = mergeBriefingsIntoFiles(filterCanonicalFiles(canonicalFiles, filters), canonicalBriefings);
        setFiles(mergedFiles);
        setAuditEvents(Array.isArray(auditPayload.items) ? auditPayload.items : []);
        setMeta({
          backingSource: "canonical-phase-a-files",
          persistenceState: "Canonical Phase A file and briefing spine active",
          lastSyncedAt: new Date().toISOString(),
        });
      } catch {
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
        } catch {
          if (!active) return;
          setFiles(scopeSeedFiles(portalFiles, projectId, filters));
          setAuditEvents(scopeSeedAudit(projectAuditEvents, projectId));
          setMeta({
            backingSource: "seeded-system-state",
            persistenceState: "Fallback workflow evidence active",
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
      try {
        if (action === "create-file-record") {
          await registerCanonicalFiles({
            projectId,
            ownerObjectType: body.ownerObjectType || "Project",
            ownerObjectId: body.ownerObjectId || body.projectId || projectId,
            uploadedBy: body.owner || body.uploadedBy || "system",
            linkedEvidenceTarget: body.linkedEvidenceTarget,
            files: [
              {
                fileName: body.name || body.fileName,
                category: body.category,
                discipline: body.discipline,
                versionLabel: body.versionLabel,
              },
            ],
          });
          await hydrate();
          return { ok: true, backingSource: "canonical-phase-a-files" };
        }

        if (action === "create-briefing") {
          await createCanonicalDocumentBriefing({
            projectId,
            fileIds: [body.fileId],
            createdBy: "auricrux",
          });
          await hydrate();
          return { ok: true, backingSource: "canonical-phase-a-files" };
        }

        if (["register-review", "classify-file", "link-evidence"].includes(action)) {
          const currentFile = files.find((file) => file.fileId === body.fileId) || {};
          await upsertCanonicalFile({
            ...currentFile,
            ...body,
            fileId: body.fileId || currentFile.fileId,
            id: body.fileId || currentFile.fileId,
            projectId,
            ownerObjectId: currentFile.ownerObjectId || projectId,
            ownerObjectType: currentFile.ownerObjectType || "Project",
            fileName: currentFile.fileName || currentFile.name || body.name,
            name: currentFile.fileName || currentFile.name || body.name,
          });
          await hydrate();
          return { ok: true, backingSource: "canonical-phase-a-files" };
        }
      } catch {
        // fall through to workflow-backed mutation path
      }

      const result = await mutateWorkflowFile(action, { ...body, projectId });
      await hydrate();
      return result;
    },
    [files, hydrate, projectId]
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
