import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import ProjectFileAuditPanel from "../../components/ProjectFileAuditPanel";
import AuricruxBriefingCard from "../../components/AuricruxBriefingCard";
import { PortalAlert, PortalEmptyState } from "../../components/portal/PortalPrimitives";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import { computeRetentionDates, fileGovernance } from "../../fileGovernance";
import { qualificationEvidencePackets } from "../../qualificationEvidence";
import { qualificationEvidenceByProject } from "../../qualificationEvidence";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { submitAuricruxAction } from "../../api/auricruxActionsClient";
import { publishPortalPageContext } from "../../portalPageContext";
import { routeStateOverlays } from "../../systemState";
import { fetchSharePointDriveStatus, listSharePointFolderItems, sharePointItemHref } from "../../api/m365Client";
import { fetchProjectRfis, fetchChangeOrders } from "../../api/constructionClient";
import { fetchFieldTasks } from "../../api/fieldOpsClient";
import { sendPortalMessage } from "../../api/portalClient";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const inputStyle = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 12px",
  font: "inherit",
  background: "#fff",
  color: "#0f172a",
};

const buttonStyle = {
  border: "1px solid #2563eb",
  background: "#2563eb",
  color: "#fff",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: "#eff6ff",
  color: "#1d4ed8",
};

const statCardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 14,
  background: "#f8fbff",
};

const BRAND_STORAGE_KEY = "fca_customer_brand_skin_v1";
const FILE_INTAKE_DRAFTS_KEY = "fca_customer_file_intake_v1";
const FILE_ACTIVITY_LOG_KEY = "fca_file_activity_log_v1";

const defaultDraft = {
  name: "",
  category: "Document",
  discipline: "Document Control",
  owner: "Project Coordinator",
  projectType: "Commercial",
  approvalStatus: "pending",
  linkType: "RFI",
  linkId: "",
  linkedEvidenceTarget: "",
};

const semanticQueryExamples = [
  "approved structural submittals",
  "modified after last rfi",
  "field photos overdue review",
];

function readLocalJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort only
  }
}

function parseDate(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildFileActivityEntry(type, file, actorId, detail) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type,
    fileId: file?.fileId || "new-file",
    fileName: file?.name || "Pending file",
    actorId,
    detail,
    at: new Date().toISOString(),
  };
}

function normalizeFileCategory(category = "") {
  const normalized = String(category).toLowerCase();
  if (normalized.includes("rfi")) return "RFI";
  if (normalized.includes("submittal")) return "Submittal";
  if (normalized.includes("drawing") || normalized.includes("plan")) return "Drawing";
  if (normalized.includes("photo")) return "Photo";
  if (normalized.includes("permit")) return "Permit";
  if (normalized.includes("legal")) return "Legal";
  return "Document";
}

function validateNamingConvention(name, projectId) {
  const withExtension = /\.[a-z0-9]{2,8}$/i.test(name || "");
  const structured = /^[A-Za-z0-9-]+_[A-Za-z0-9-]+(?:_[A-Za-z0-9-]+)*\.[A-Za-z0-9]{2,8}$/.test(name || "");
  const hasProjectToken = projectId ? String(name || "").toLowerCase().includes(String(projectId).toLowerCase()) : true;
  if (!withExtension) return { pass: false, reason: "File must include a valid extension (e.g., .pdf, .dwg, .xlsx)." };
  if (!structured) return { pass: false, reason: "File name must follow governance format: Project_Artifact_Revision.ext." };
  if (!hasProjectToken) return { pass: false, reason: `File name must include project token ${projectId}.` };
  return { pass: true, reason: "Naming convention passed." };
}

function validateFileFormatByCategory(name, category) {
  const extension = (String(name || "").split(".").pop() || "").toLowerCase();
  const key = normalizeFileCategory(category);
  const allowed = {
    RFI: ["pdf", "doc", "docx", "xlsx", "csv"],
    Submittal: ["pdf", "doc", "docx", "xlsx"],
    Drawing: ["pdf", "dwg", "dxf", "ifc", "rvt"],
    Photo: ["jpg", "jpeg", "png", "webp"],
    Permit: ["pdf", "doc", "docx"],
    Legal: ["pdf", "doc", "docx"],
    Document: ["pdf", "doc", "docx", "xlsx", "csv", "txt"],
  }[key] || ["pdf"];
  const pass = allowed.includes(extension);
  return {
    pass,
    reason: pass ? `${key} format check passed.` : `${key} files require one of: ${allowed.join(", ")}.`,
  };
}

function validateStageApproval(stage, category, approvalStatus) {
  const normalizedStage = String(stage || "").toLowerCase();
  const strictCategory = ["Submittal", "Permit", "Legal"].includes(normalizeFileCategory(category));
  if (!strictCategory) return { pass: true, reason: "Stage approval check not required for this category." };
  if (normalizedStage.includes("construction") && String(approvalStatus).toLowerCase() !== "approved") {
    return { pass: false, reason: "Construction stage requires Approved status for legal/permit/submittal artifacts." };
  }
  return { pass: true, reason: "Stage approval check passed." };
}

function inferExtractionInsights(file) {
  const text = `${file?.name || ""} ${file?.note || ""} ${file?.linkedEvidenceTarget || ""}`;
  const amountMatch = text.match(/\$\s?([\d,]+(?:\.\d+)?)/);
  const dateMatch = text.match(/(20\d{2}-\d{2}-\d{2}|\d{2}\/\d{2}\/20\d{2})/);
  const quantityMatch = text.match(/(\d+(?:\.\d+)?)\s?(ea|lf|sf|cy|tons)/i);
  return {
    amount: amountMatch ? `$${amountMatch[1]}` : "n/a",
    date: dateMatch ? dateMatch[1] : "n/a",
    quantity: quantityMatch ? `${quantityMatch[1]} ${quantityMatch[2].toUpperCase()}` : "n/a",
  };
}

function detectRevisionConflict(file) {
  const text = `${file?.name || ""} ${file?.discipline || ""}`.toLowerCase();
  const revised = /rev(?:ision)?[-_ ]?\d|updated|delta/i.test(text);
  const mepRouting = /mep|mechanical|electrical|plumbing|routing/.test(text);
  if (revised && mepRouting) {
    return {
      atRisk: true,
      message: "Potential MEP routing conflict detected against project baseline. Push to Design Workspace and issue RFI notification.",
    };
  }
  return { atRisk: false, message: "No baseline routing conflict detected." };
}

function semanticScore(file, query, lastRfiTimestamp) {
  if (!query.trim()) return 0;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = `${file.name || ""} ${file.category || ""} ${file.discipline || ""} ${file.status || ""} ${file.evidenceStatus || ""} ${file.note || ""}`.toLowerCase();
  let score = 0;
  words.forEach((word) => {
    if (hay.includes(word)) score += 2;
  });
  if (query.toLowerCase().includes("approved") && /approved|ready|verified/.test(hay)) score += 3;
  if (query.toLowerCase().includes("structural") && /structural/.test(hay)) score += 3;
  if (query.toLowerCase().includes("submittal") && /submittal/.test(hay)) score += 3;
  if (query.toLowerCase().includes("after last rfi") && parseDate(file.updated || file.updatedAt) > lastRfiTimestamp) score += 4;
  return score;
}

function isBriefingReady(file = {}) {
  const haystack = `${file.status || ""} ${file.evidenceStatus || ""} ${file.action || ""} ${file.note || ""}`.toLowerCase();
  return haystack.includes("briefing");
}

function buildBriefingMutation(file, visibleProject, guidanceReply = "") {
  return {
    evidenceStatus: "Briefing generated",
    status: "Auricrux briefing ready",
    actionLabel: "Open briefing",
    briefingTitle: `Auricrux Briefing — ${file.name}`,
    briefingSummary: guidanceReply || `Auricrux generated a governed briefing for ${file.name} under ${visibleProject.id}.`,
    briefingKeyFacts: [
      `${file.category || "Document"} artifact is attached to ${visibleProject.id}.`,
      `${file.discipline || "Document Control"} continuity remains governed inside the active file spine.`,
    ],
    briefingDetectedGaps: [
      "Confirm downstream estimate, schedule, and approval dependencies before execution state advances.",
    ],
    briefingRecommendedNextActions: [
      `Confirm ${file.name} is linked to the correct governed evidence target for ${visibleProject.id}.`,
      `Use this briefing artifact to support the next project action without breaking continuity.`,
    ],
  };
}

function readDeepLinkParams() {
  if (typeof window === "undefined") return { projectId: "", fileId: "" };
  const params = new URLSearchParams(window.location.search);
  return {
    projectId: params.get("projectId") || params.get("project") || "",
    fileId: params.get("fileId") || params.get("file") || "",
  };
}

export default function PortalFiles() {
  const { state, refreshSyncStamp, syncActiveProject } = useWorkspaceState();
  const { activeProject, meta: projectMeta } = useProjectWorkspace();
  const [busyFileId, setBusyFileId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(() => readLocalJson(FILE_INTAKE_DRAFTS_KEY, defaultDraft));
  const [semanticQuery, setSemanticQuery] = useState("");
  const [selectedPackageFileIds, setSelectedPackageFileIds] = useState([]);
  const [packageSnapshotAt, setPackageSnapshotAt] = useState("");
  const [activityLog, setActivityLog] = useState(() => readLocalJson(FILE_ACTIVITY_LOG_KEY, []));
  const [deepLink] = useState(() => readDeepLinkParams());
  const [sharePointStatus, setSharePointStatus] = useState(null);
  const [sharePointItems, setSharePointItems] = useState([]);
  const [sharePointError, setSharePointError] = useState("");
  const brandSkin = readLocalJson(BRAND_STORAGE_KEY, { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" });
  const companyName = state?.tenant?.name || brandSkin.companyName || "Customer Workspace";

  const visibleProject = activeProject || state.project;
  const { files, auditEvents, meta: evidenceMeta, mutateFile, filters, setFilters, summary } = useWorkflowEvidence(visibleProject?.id);
  const rfisLoad = usePortalApiLoad(() => (visibleProject?.id ? fetchProjectRfis(visibleProject.id) : Promise.resolve([])), [visibleProject?.id]);
  const changeOrdersLoad = usePortalApiLoad(() => (visibleProject?.id ? fetchChangeOrders(visibleProject.id) : Promise.resolve({ items: [] })), [visibleProject?.id]);
  const fieldTasksLoad = usePortalApiLoad(() => (visibleProject?.id ? fetchFieldTasks({ projectId: visibleProject.id }) : Promise.resolve({ items: [] })), [visibleProject?.id]);

  const rfis = rfisLoad.data || [];
  const changeOrders = changeOrdersLoad.data?.items || [];
  const fieldTasks = fieldTasksLoad.data?.items || [];

  const evidencePackets = qualificationEvidenceByProject?.[visibleProject?.id] || qualificationEvidencePackets;
  const briefingFiles = useMemo(() => files.filter((file) => isBriefingReady(file)), [files]);
  const targetedFile = useMemo(() => files.find((file) => file.fileId === deepLink.fileId) || null, [files, deepLink.fileId]);

  const categoryOptions = useMemo(() => ["All", ...Object.keys(summary.byCategory).sort()], [summary.byCategory]);
  const statusOptions = useMemo(() => ["All", ...Object.keys(summary.byStatus).sort()], [summary.byStatus]);
  const apiBacked = evidenceMeta.backingSource === "api-workflow-store";

  const availableLinkTargets = useMemo(() => {
    const rfiTargets = rfis.map((item) => ({ type: "RFI", id: item.rfiId || item.id || item.number, label: `${item.number || item.rfiId || item.id} · ${item.question || "RFI"}` }));
    const changeOrderTargets = changeOrders.map((item) => ({ type: "ChangeOrder", id: item.changeOrderId || item.id, label: `${item.changeOrderId || item.id} · ${item.title || "Change order"}` }));
    const taskTargets = fieldTasks.map((item) => ({ type: "FieldTask", id: item.taskId || item.id, label: `${item.taskId || item.id} · ${item.task || item.title || "Task"}` }));
    return [...rfiTargets, ...changeOrderTargets, ...taskTargets];
  }, [changeOrders, fieldTasks, rfis]);

  const orphanFiles = useMemo(
    () => files.filter((file) => {
      const target = String(file.linkedEvidenceTarget || "").toLowerCase();
      const hasContext = Boolean(file.ownerObjectId) && Boolean(file.owner);
      const hasDomainLink = /(rfi|change|task|field|submittal|permit|project)/.test(target);
      return !hasContext || !hasDomainLink;
    }),
    [files],
  );

  const submittalRegister = useMemo(() => {
    const now = Date.now();
    const rows = files
      .filter((file) => {
        const category = normalizeFileCategory(file.category);
        return ["Submittal", "Drawing", "Permit", "RFI"].includes(category);
      })
      .map((file) => {
        const status = String(file.status || file.evidenceStatus || "Pending review");
        const updatedAt = parseDate(file.updated || file.updatedAt);
        const ageDays = updatedAt ? Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24)) : null;
        const overdue = /pending|review|open/i.test(status) && Number.isFinite(ageDays) && ageDays > 10;
        return { file, status, overdue, ageDays };
      });
    return {
      total: rows.length,
      pending: rows.filter((row) => /pending|review|open/i.test(row.status)).length,
      approved: rows.filter((row) => /approved|verified|ready/i.test(row.status)).length,
      overdue: rows.filter((row) => row.overdue).length,
      rows,
    };
  }, [files]);

  const latestRfiTimestamp = useMemo(
    () => rfis.reduce((max, item) => Math.max(max, parseDate(item.updatedAt || item.createdAt || item.dueAt)), 0),
    [rfis],
  );

  const semanticResults = useMemo(() => {
    if (!semanticQuery.trim()) return [];
    return files
      .map((file) => ({ file, score: semanticScore(file, semanticQuery, latestRfiTimestamp) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [files, latestRfiTimestamp, semanticQuery]);

  const selectedPackageFiles = useMemo(
    () => files.filter((file) => selectedPackageFileIds.includes(file.fileId)),
    [files, selectedPackageFileIds],
  );

  const stalePackageWarning = useMemo(() => {
    if (!packageSnapshotAt || !selectedPackageFiles.length) return null;
    const snapshot = parseDate(packageSnapshotAt);
    const stale = selectedPackageFiles.filter((file) => parseDate(file.updated || file.updatedAt) > snapshot);
    return stale.length ? `${stale.length} file(s) changed after package snapshot. Package is stale.` : "Package remains current.";
  }, [packageSnapshotAt, selectedPackageFiles]);

  useEffect(() => {
    if (!visibleProject?.id) {
      publishPortalPageContext(null);
      return undefined;
    }
    publishPortalPageContext({
      surface: "files",
      projectId: visibleProject.id,
      targetObjectType: "Project",
      targetObjectId: visibleProject.id,
    });
    return () => publishPortalPageContext(null);
  }, [visibleProject?.id]);

  useEffect(() => {
    if (activeProject) {
      syncActiveProject(activeProject, `File spine synchronized to ${activeProject.id}`);
    }
    refreshSyncStamp(`File spine synchronized to ${visibleProject.id}`);
  }, [activeProject, refreshSyncStamp, syncActiveProject, visibleProject.id]);

  useEffect(() => {
    writeLocalJson(FILE_INTAKE_DRAFTS_KEY, draft);
  }, [draft]);

  useEffect(() => {
    writeLocalJson(FILE_ACTIVITY_LOG_KEY, activityLog);
  }, [activityLog]);

  useEffect(() => {
    if (!deepLink.fileId || !targetedFile) return;
    setFilters((current) => (current.q === targetedFile.name ? current : { ...current, q: targetedFile.name }));
  }, [deepLink.fileId, targetedFile, setFilters]);

  useEffect(() => {
    let active = true;
    setSharePointError("");
    Promise.all([
      fetchSharePointDriveStatus().catch(() => null),
      listSharePointFolderItems().catch(() => null),
    ])
      .then(([statusPayload, folderPayload]) => {
        if (!active) return;
        if (statusPayload) setSharePointStatus(statusPayload);
        if (folderPayload?.items) setSharePointItems(folderPayload.items.slice(0, 8));
      })
      .catch((error) => {
        if (active) setSharePointError(error.message || "SharePoint sync unavailable.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleFileAction(file, action, detail, extra = {}) {
    setBusyFileId(file.fileId);
    try {
      await mutateFile(action, {
        fileId: file.fileId,
        detail,
        ...extra,
      });
      setActivityLog((current) => [
        buildFileActivityEntry(action, file, state?.user?.email || state?.tenant?.name || "workspace-user", detail),
        ...current,
      ].slice(0, 120));
      refreshSyncStamp(detail);
      setActionNotice(detail);
    } finally {
      setBusyFileId(null);
    }
  }

  async function handleCreateBriefing(file) {
    setBusyFileId(file.fileId);
    try {
      const payload = await submitAuricruxAction({
        mode: "execute",
        capabilityId: "plan-briefing",
        targetObjectType: "Project",
        targetObjectId: visibleProject.id,
        rationale: `Generate governed briefing for ${file.name} under project ${visibleProject.id}.`,
        sourceRoute: "/portal/files",
      });
      const guidanceReply = payload?.guidance?.reply || payload?.guidance || "";
      await handleFileAction(
        file,
        "create-briefing",
        `Auricrux generated a governed briefing for ${file.name} under ${visibleProject.id}.`,
        buildBriefingMutation(file, visibleProject, guidanceReply),
      );
    } catch (error) {
      setActionError(error.message || "Unable to generate briefing.");
    } finally {
      setBusyFileId("");
    }
  }

  async function handleCreateFileRecord(event) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    setCreating(true);
    setActionError("");
    setActionNotice("");
    try {
      if (!visibleProject?.id) {
        setActionError("Select an active project before registering evidence.");
        return;
      }

      const namingCheck = validateNamingConvention(draft.name.trim(), visibleProject.id);
      if (!namingCheck.pass) {
        setActionError(`Compliance check failed: ${namingCheck.reason}`);
        return;
      }

      const formatCheck = validateFileFormatByCategory(draft.name.trim(), draft.category);
      if (!formatCheck.pass) {
        setActionError(`Compliance check failed: ${formatCheck.reason}`);
        return;
      }

      const stageApprovalCheck = validateStageApproval(visibleProject.stage, draft.category, draft.approvalStatus);
      if (!stageApprovalCheck.pass) {
        setActionError(`Compliance check failed: ${stageApprovalCheck.reason}`);
        return;
      }

      if (!draft.linkId.trim()) {
        setActionError("Governance violation: new evidence must link to active RFI, Change Order, or Field Task.");
        return;
      }

      const retention = computeRetentionDates({
        projectType: draft.projectType,
        category: normalizeFileCategory(draft.category),
        recordedAt: new Date().toISOString(),
      });

      const linkedEvidenceTarget = `${draft.linkType}:${draft.linkId.trim()}`;
      const detail = `${draft.name.trim()} registered under governed file spine for ${visibleProject.id}.`;
      await mutateFile("create-file-record", {
        projectId: visibleProject.id,
        name: draft.name.trim(),
        category: normalizeFileCategory(draft.category),
        discipline: draft.discipline,
        owner: draft.owner,
        linkedEvidenceTarget,
        detail,
        status: draft.approvalStatus === "approved" ? "Approved" : "Registered",
        evidenceStatus: draft.approvalStatus === "approved" ? "Approved evidence" : "Pending review",
        metadata: {
          projectType: draft.projectType,
          approvalStatus: draft.approvalStatus,
          retentionYears: retention.policy.years,
          retainUntil: retention.retainUntil,
          lifecyclePolicy: retention.policy,
          contextualDNA: {
            artifactType: normalizeFileCategory(draft.category),
            projectId: visibleProject.id,
            discipline: draft.discipline,
            owner: draft.owner,
            linkType: draft.linkType,
            linkId: draft.linkId.trim(),
          },
        },
        actionLabel: "Review",
      });

      const syntheticFile = {
        fileId: "new-file",
        name: draft.name.trim(),
        category: normalizeFileCategory(draft.category),
        discipline: draft.discipline,
        owner: draft.owner,
        linkedEvidenceTarget,
      };
      setActivityLog((current) => [
        buildFileActivityEntry("create", syntheticFile, state?.user?.email || state?.tenant?.name || "workspace-user", `${detail} Retain until ${retention.retainUntil}`),
        ...current,
      ].slice(0, 120));

      const extraction = inferExtractionInsights(syntheticFile);
      const conflict = detectRevisionConflict(syntheticFile);
      if (conflict.atRisk) {
        await sendPortalMessage({
          channel: "teams",
          subject: `${visibleProject.id} document conflict detected`,
          message: `${conflict.message} Source file: ${syntheticFile.name}. Triggering design workspace + RFI review.`,
        }).catch(() => null);
      }

      setActionNotice(`${detail} OCR extraction: amount ${extraction.amount}, date ${extraction.date}, quantity ${extraction.quantity}. Retention ${retention.policy.years}y.`);
      setDraft(defaultDraft);
      refreshSyncStamp(detail);
    } finally {
      setCreating(false);
    }
  }

  function togglePackageFile(fileId) {
    setSelectedPackageFileIds((current) =>
      current.includes(fileId) ? current.filter((id) => id !== fileId) : [...current, fileId],
    );
  }

  function snapshotEvidencePackage() {
    setPackageSnapshotAt(new Date().toISOString());
    setActionNotice(`Evidence package snapshot captured for ${selectedPackageFiles.length} file(s).`);
  }

  async function triggerConflictReview(file) {
    const conflict = detectRevisionConflict(file);
    if (!conflict.atRisk) {
      setActionNotice("No baseline conflict detected for selected file.");
      return;
    }
    await sendPortalMessage({
      channel: "teams",
      subject: `${visibleProject.id} conflict review requested`,
      message: `${conflict.message} File: ${file.name}. Open Design Workspace and create linked RFI.`,
    }).catch(() => null);
    setActivityLog((current) => [
      buildFileActivityEntry("conflict-review", file, state?.user?.email || state?.tenant?.name || "workspace-user", conflict.message),
      ...current,
    ].slice(0, 120));
    setActionNotice(`Conflict workflow triggered for ${file.name}.`);
  }

  return (
    <PortalShell
      title={`${companyName} File Intake and Evidence Workspace`}
      subtitle="Register project files, link evidence, and control deliverables."
      activeHref="/portal/files"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.files}
      primaryHref="/portal/messages"
      primaryLabel="Open Messages"
      workspaceState={state}
    >
      {!apiBacked ? (
        <div style={{ marginBottom: 16 }}>
          <PortalAlert tone="warning" title="Offline file workspace">
            File actions use workspace continuity when the workflow API is unavailable. Connect to sync governed uploads and evidence links.
          </PortalAlert>
        </div>
      ) : null}

      {actionNotice ? (
        <div style={{ marginBottom: 16 }}>
          <PortalAlert tone="success">{actionNotice}</PortalAlert>
        </div>
      ) : null}

      {actionError ? (
        <div style={{ marginBottom: 16 }}>
          <PortalAlert tone="error">{actionError}</PortalAlert>
        </div>
      ) : null}

      {sharePointStatus || sharePointItems.length ? (
        <div style={{ ...cardStyle, marginBottom: 16, background: "#f8fbff", border: "1px solid #dbe3ef" }}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>SharePoint governed library</div>
          <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>
            Project files can be opened from the FCA SharePoint site through Auricrux-Central Graph integration.
          </div>
          {sharePointStatus?.site?.webUrl ? (
            <a href={sharePointStatus.site.webUrl} target="_blank" rel="noreferrer" style={{ ...secondaryButtonStyle, display: "inline-block", textDecoration: "none", marginBottom: 12 }}>
              Open SharePoint site
            </a>
          ) : null}
          {sharePointItems.length ? (
            <div style={{ display: "grid", gap: 8 }}>
              {sharePointItems.map((item) => (
                <div key={item.id || item.name} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
                  <div>
                    <strong>{item.name}</strong>
                    <div style={{ color: "#64748b", fontSize: 13 }}>{item.folder ? "Folder" : "File"}</div>
                  </div>
                  {sharePointItemHref(item) ? (
                    <a href={sharePointItemHref(item)} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontWeight: 700 }}>
                      Open
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          {sharePointError ? <div style={{ color: "#b45309", marginTop: 10 }}>{sharePointError}</div> : null}
        </div>
      ) : null}

      {visibleProject?.id ? (
        <div style={{ marginBottom: 16 }}>
          <AuricruxInsightPanel
            title="Auricrux File Intelligence"
            targetObjectType="Project"
            targetObjectId={visibleProject.id}
            sourceRoute="/portal/files"
            rationale="Review governed file posture, evidence links, and briefing readiness for the active project."
            nextAction="Register missing artifacts, link evidence targets, and generate briefings before execution advances."
            actionHref={`/portal/design?projectId=${encodeURIComponent(visibleProject.id)}`}
            actionLabel="Open design workspace"
            tone="blue"
            liveRecommend
            operateConfig={{
              variant: "execute",
              capabilityId: "plan-briefing",
              mode: "execute",
              targetObjectType: "Project",
              targetObjectId: visibleProject.id,
              sourceRoute: "/portal/files",
              buttonLabel: "Generate plan briefing with Auricrux",
              description: "Execute governed plan briefing on the active project spine — scope gaps, evidence posture, and next commercial moves.",
            }}
          />
        </div>
      ) : null}

      {targetedFile ? (
        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: `1px solid ${brandSkin.accent || "#2563eb"}` }}>
          <div style={{ color: brandSkin.accent || "#2563eb", fontWeight: 700, marginBottom: 8 }}>Targeted file briefing focus</div>
          <AuricruxBriefingCard file={targetedFile} project={visibleProject} projectFiles={files} />
        </div>
      ) : null}

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>File intake and evidence registration</h2>
        <form onSubmit={handleCreateFileRecord} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>File name</div>
              <input style={inputStyle} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Example: Owner_Approval_Log.pdf" />
            </label>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Category</div>
              <select style={inputStyle} value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}>
                <option>Document</option>
                <option>RFI</option>
                <option>Submittal</option>
                <option>Drawing</option>
                <option>Photo</option>
                <option>Bid</option>
                <option>Permit</option>
                <option>Coordination</option>
                <option>Field</option>
                <option>Legal</option>
                <option>Closeout</option>
              </select>
            </label>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Discipline</div>
              <input style={inputStyle} value={draft.discipline} onChange={(event) => setDraft((current) => ({ ...current, discipline: event.target.value }))} placeholder="Document Control" />
            </label>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Owner</div>
              <input style={inputStyle} value={draft.owner} onChange={(event) => setDraft((current) => ({ ...current, owner: event.target.value }))} placeholder="Project Coordinator" />
            </label>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Project type</div>
              <select style={inputStyle} value={draft.projectType} onChange={(event) => setDraft((current) => ({ ...current, projectType: event.target.value }))}>
                <option>Commercial</option>
                <option>Public Infrastructure</option>
                <option>Residential</option>
              </select>
            </label>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Approval status</div>
              <select style={inputStyle} value={draft.approvalStatus} onChange={(event) => setDraft((current) => ({ ...current, approvalStatus: event.target.value }))}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Link type</div>
              <select style={inputStyle} value={draft.linkType} onChange={(event) => setDraft((current) => ({ ...current, linkType: event.target.value, linkId: "" }))}>
                <option value="RFI">RFI</option>
                <option value="ChangeOrder">Change Order</option>
                <option value="FieldTask">Field Task</option>
              </select>
            </label>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Link target</div>
              <select style={inputStyle} value={draft.linkId} onChange={(event) => setDraft((current) => ({ ...current, linkId: event.target.value }))}>
                <option value="">Select active target</option>
                {availableLinkTargets.filter((target) => target.type === draft.linkType).map((target) => (
                  <option key={`${target.type}-${target.id}`} value={target.id}>{target.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Evidence target</div>
            <input style={inputStyle} value={draft.linkedEvidenceTarget} onChange={(event) => setDraft((current) => ({ ...current, linkedEvidenceTarget: event.target.value }))} placeholder="Auto-mapped from link type and target" disabled />
          </label>
          <div style={{ color: "#475569", fontSize: 13 }}>
            Compliance checks run before registration: naming convention, category format, stage-based approval, and active target linking.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="submit" style={buttonStyle} disabled={creating || !draft.name.trim()}>{creating ? "Creating…" : apiBacked ? "Create File Record" : "Stage File Record"}</button>
            <button type="button" style={secondaryButtonStyle} disabled={creating} onClick={() => setDraft(defaultDraft)}>Reset Draft</button>
          </div>
        </form>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, border: "1px solid #fecaca", background: "#fef2f2" }}>
        <div style={{ color: "#b91c1c", fontWeight: 700, marginBottom: 8 }}>Governance violations (orphan evidence)</div>
        {orphanFiles.length ? (
          <ul style={{ margin: 0, paddingLeft: 18, color: "#7f1d1d", lineHeight: 1.7 }}>
            {orphanFiles.slice(0, 8).map((file) => (
              <li key={file.fileId}>{`${file.name} is missing contextual linkage.`}</li>
            ))}
          </ul>
        ) : (
          <div style={{ color: "#166534" }}>No orphan files detected in current register.</div>
        )}
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>File register summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
          <div style={statCardStyle}><div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Visible files</div><div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{summary.total}</div></div>
          <div style={statCardStyle}><div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Briefings ready</div><div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{briefingFiles.length}</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Search</div>
            <input style={inputStyle} value={filters.q} onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))} placeholder="Search file name, owner, evidence target, note" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Category</div>
            <select style={inputStyle} value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
              {categoryOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Status</div>
            <select style={inputStyle} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              {statusOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <div style={{ color: "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Qualification evidence handoff</div>
        <p style={{ marginTop: 0, color: "#334155", lineHeight: 1.7 }}>
          The file spine now proves why a bid was allowed to advance.
        </p>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Linked evidence files</div>
        <ul style={{ marginTop: 0, marginBottom: 12, paddingLeft: 18, color: "#334155", lineHeight: 1.7 }}>
          {evidencePackets[0]?.files?.slice(0, 3).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Gate checks</div>
        <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.7 }}>
          {evidencePackets[0]?.checks?.slice(0, 3).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Automated submittal register</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 12 }}>
          <div style={statCardStyle}><div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Tracked</div><div style={{ fontSize: 26, fontWeight: 800 }}>{submittalRegister.total}</div></div>
          <div style={statCardStyle}><div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Pending</div><div style={{ fontSize: 26, fontWeight: 800 }}>{submittalRegister.pending}</div></div>
          <div style={statCardStyle}><div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Approved</div><div style={{ fontSize: 26, fontWeight: 800 }}>{submittalRegister.approved}</div></div>
          <div style={statCardStyle}><div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Overdue</div><div style={{ fontSize: 26, fontWeight: 800 }}>{submittalRegister.overdue}</div></div>
        </div>
        {submittalRegister.rows.length ? (
          <div style={{ display: "grid", gap: 8 }}>
            {submittalRegister.rows.slice(0, 8).map((row) => (
              <div key={row.file.fileId} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: row.overdue ? "#fff7ed" : "#f8fafc" }}>
                <strong>{row.file.name}</strong>
                <div style={{ color: "#64748b", fontSize: 13 }}>{`${row.status}${Number.isFinite(row.ageDays) ? ` · ${row.ageDays}d` : ""}`}</div>
              </div>
            ))}
          </div>
        ) : (
          <PortalEmptyState
            title="No register artifacts yet"
            detail="Upload and classify submittals/drawings to build the automated register."
            primaryHref="/portal/files"
            primaryLabel="Create file record"
          />
        )}
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Semantic evidence retrieval</h2>
        <div style={{ color: "#475569", marginBottom: 8 }}>Search by intent, not filename.</div>
        <input style={inputStyle} value={semanticQuery} onChange={(event) => setSemanticQuery(event.target.value)} placeholder={`Try: ${semanticQueryExamples.join(" · ")}`} />
        {semanticQuery.trim() ? (
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            {semanticResults.map((entry) => (
              <div key={entry.file.fileId} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                <strong>{entry.file.name}</strong>
                <div style={{ color: "#64748b", fontSize: 13 }}>{`${entry.file.category || "Document"} · score ${entry.score}`}</div>
              </div>
            ))}
            {!semanticResults.length ? <div style={{ color: "#64748b" }}>No intent-matched evidence found.</div> : null}
          </div>
        ) : null}
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Dynamic evidence package briefing</h2>
        <div style={{ color: "#475569", marginBottom: 8 }}>Bundle evidence for owner submittal, internal review, or dispute defense.</div>
        <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
          {files.slice(0, 12).map((file) => (
            <label key={`pkg-${file.fileId}`} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={selectedPackageFileIds.includes(file.fileId)} onChange={() => togglePackageFile(file.fileId)} />
              <span>{file.name}</span>
            </label>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <button type="button" style={secondaryButtonStyle} onClick={snapshotEvidencePackage} disabled={!selectedPackageFileIds.length}>Snapshot package</button>
          <div style={{ color: "#334155", alignSelf: "center" }}>{packageSnapshotAt ? `Snapshot: ${packageSnapshotAt}` : "No snapshot yet"}</div>
        </div>
        {stalePackageWarning ? (
          <PortalAlert tone={stalePackageWarning.includes("stale") ? "warning" : "success"}>{stalePackageWarning}</PortalAlert>
        ) : null}
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Immutable audit spine</h2>
        <div style={{ color: "#475569", marginBottom: 8 }}>Every file interaction is recorded with actor and timestamp.</div>
        <div style={{ display: "grid", gap: 8 }}>
          {activityLog.slice(0, 12).map((entry) => (
            <div key={entry.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
              <strong>{`${entry.type} · ${entry.fileName}`}</strong>
              <div style={{ color: "#64748b", fontSize: 13 }}>{`${entry.at} · ${entry.actorId}`}</div>
              <div style={{ color: "#334155", fontSize: 13, marginTop: 4 }}>{entry.detail}</div>
            </div>
          ))}
          {!activityLog.length ? <div style={{ color: "#64748b" }}>No file interactions logged yet.</div> : null}
        </div>
      </div>

      {briefingFiles.length ? (
        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Auricrux briefing surface</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Governed briefing artifacts ready for action</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {briefingFiles.map((file) => <AuricruxBriefingCard key={`briefing-${file.fileId}`} file={file} project={visibleProject} projectFiles={files} />)}
          </div>
        </div>
      ) : null}

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>File governance registers</h2>
        <p style={{ lineHeight: 1.7, color: "#475569", marginTop: 0 }}>
          Cross-project registers tie legal artifacts, drawings, RFIs, and closeout packages to governed portal routes.
        </p>
        <div style={{ display: "grid", gap: 14 }}>
          {fileGovernance.registers.map((register) => (
            <div key={register.title} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
              <div style={{ fontWeight: 800, color: "#0f172a" }}>{register.title}</div>
              <div style={{ fontSize: 14, color: "#475569", marginTop: 6, lineHeight: 1.6 }}>{register.purpose}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
                Artifacts: {register.artifacts.join(" · ")}
              </div>
              <a href={register.route} style={{ ...secondaryButtonStyle, display: "inline-block", marginTop: 10, textDecoration: "none" }}>
                {register.label}
              </a>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Closeout packages</div>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: "#334155", margin: 0 }}>
            {fileGovernance.closeoutPackages.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Audit signals</div>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: "#334155", margin: 0 }}>
            {fileGovernance.auditSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Automated retention policies</div>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: "#334155", margin: 0 }}>
            {fileGovernance.retentionPolicies.map((policy) => (
              <li key={`${policy.projectType}-${policy.category}`}>{`${policy.projectType} · ${policy.category} · ${policy.years} years`}</li>
            ))}
          </ul>
        </div>
      </div>

      <ProjectFileAuditPanel
        project={visibleProject}
        files={files}
        auditEvents={auditEvents}
        busyFileId={busyFileId}
        targetedFileId={deepLink.fileId}
        onRegisterReview={(file) => handleFileAction(file, "register-review", `${file.name} queued for governed review under ${visibleProject.id}.`)}
        onClassifyFile={(file) => {
          const extraction = inferExtractionInsights(file);
          handleFileAction(file, "classify-file", `Auricrux classified ${file.name} for ${visibleProject.id}.`, {
            category: normalizeFileCategory(file.category),
            evidenceStatus: "Classification complete",
            status: "Classified",
            actionLabel: "Classification saved",
            note: `${file.note || ""} | Extracted amount:${extraction.amount} date:${extraction.date} qty:${extraction.quantity}`.trim(),
          });
        }}
        onLinkEvidence={(file) => handleFileAction(file, "link-evidence", `${file.name} linked to governed evidence target for ${visibleProject.id}.`, { linkedEvidenceTarget: `${visibleProject.id} governed evidence chain`, evidenceStatus: "Evidence linked", status: "Linked to governed object", actionLabel: "Evidence linked" })}
        onCreateBriefing={handleCreateBriefing}
        onOpenDesign={(file) => {
          const href = `/portal/design?projectId=${encodeURIComponent(visibleProject.id)}&fileId=${encodeURIComponent(file.fileId)}`;
          window.location.href = href;
        }}
      />

      <div style={{ ...cardStyle, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Conflict detection triggers</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {files.slice(0, 10).map((file) => {
            const conflict = detectRevisionConflict(file);
            return (
              <div key={`conflict-${file.fileId}`} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: conflict.atRisk ? "#fff7ed" : "#f8fafc" }}>
                <strong>{file.name}</strong>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{conflict.message}</div>
                {conflict.atRisk ? (
                  <button type="button" style={{ ...secondaryButtonStyle, marginTop: 8 }} onClick={() => triggerConflictReview(file)}>
                    Trigger design + RFI review
                  </button>
                ) : null}
              </div>
            );
          })}
          {!files.length ? <div style={{ color: "#64748b" }}>No files available for conflict checks.</div> : null}
        </div>
      </div>
    </PortalShell>
  );
}
