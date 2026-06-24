import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import ProjectFileAuditPanel from "../../components/ProjectFileAuditPanel";
import AuricruxBriefingCard from "../../components/AuricruxBriefingCard";
import { PortalAlert } from "../../components/portal/PortalPrimitives";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import { fileGovernance } from "../../fileGovernance";
import { qualificationEvidencePackets, qualificationEvidenceByProject } from "../../qualificationEvidence";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { submitAuricruxAction } from "../../api/auricruxActionsClient";
import { fetchSharePointDriveStatus, listSharePointFolderItems, sharePointItemHref } from "../../api/m365Client";

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

const defaultDraft = {
  name: "",
  category: "Document",
  discipline: "Document Control",
  owner: "Project Coordinator",
  linkedEvidenceTarget: "",
};

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
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(() => readLocalJson(FILE_INTAKE_DRAFTS_KEY, defaultDraft));
  const [deepLink] = useState(() => readDeepLinkParams());
  const [sharePointStatus, setSharePointStatus] = useState(null);
  const [sharePointItems, setSharePointItems] = useState([]);
  const [sharePointError, setSharePointError] = useState("");
  const brandSkin = readLocalJson(BRAND_STORAGE_KEY, { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" });

  const visibleProject = activeProject || state.project;
  const { files, auditEvents, meta: evidenceMeta, mutateFile, filters, setFilters, summary } = useWorkflowEvidence(visibleProject?.id);
  const evidencePackets = qualificationEvidenceByProject?.[visibleProject?.id] || qualificationEvidencePackets;
  const briefingFiles = useMemo(() => files.filter((file) => isBriefingReady(file)), [files]);
  const targetedFile = useMemo(() => files.find((file) => file.fileId === deepLink.fileId) || null, [files, deepLink.fileId]);

  const categoryOptions = useMemo(() => ["All", ...Object.keys(summary.byCategory).sort()], [summary.byCategory]);
  const statusOptions = useMemo(() => ["All", ...Object.keys(summary.byStatus).sort()], [summary.byStatus]);
  const apiBacked = evidenceMeta.backingSource === "api-workflow-store";

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
      refreshSyncStamp(detail);
    } finally {
      setBusyFileId(null);
    }
  }

  async function handleCreateBriefing(file) {
    setBusyFileId(file.fileId);
    try {
      const payload = await submitAuricruxAction({
        mode: "recommend",
        targetObjectType: "File",
        targetObjectId: file.fileId,
        rationale: `Generate governed briefing for ${file.name} under project ${visibleProject.id}.`,
        sourceRoute: "/portal/files",
      });
      const guidanceReply = payload?.guidance?.reply || "";
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
    try {
      const detail = `${draft.name.trim()} registered under governed file spine for ${visibleProject.id}.`;
      await mutateFile("create-file-record", {
        projectId: visibleProject.id,
        name: draft.name.trim(),
        category: draft.category,
        discipline: draft.discipline,
        owner: draft.owner,
        linkedEvidenceTarget: draft.linkedEvidenceTarget.trim() || `${visibleProject.id} governed evidence chain`,
        detail,
        status: "Registered",
        evidenceStatus: "Pending review",
        actionLabel: "Review",
      });
      setDraft(defaultDraft);
      refreshSyncStamp(detail);
    } finally {
      setCreating(false);
    }
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
            targetObjectId={visibleProject.id}
            sourceRoute="/portal/files"
            rationale="Review governed file posture, evidence links, and briefing readiness for the active project."
            nextAction="Register missing artifacts, link evidence targets, and generate briefings before execution advances."
            actionHref={`/portal/design?projectId=${encodeURIComponent(visibleProject.id)}`}
            actionLabel="Open design workspace"
            tone="blue"
            liveRecommend
          />
        </div>
      ) : null}

      {targetedFile ? (
        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: `1px solid ${brandSkin.accent || "#2563eb"}` }}>
          <div style={{ color: brandSkin.accent || "#2563eb", fontWeight: 700, marginBottom: 8 }}>Targeted file briefing focus</div>
          <AuricruxBriefingCard file={targetedFile} project={visibleProject} />
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
                <option>Bid</option>
                <option>Permit</option>
                <option>Coordination</option>
                <option>Field</option>
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
          </div>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Evidence target</div>
            <input style={inputStyle} value={draft.linkedEvidenceTarget} onChange={(event) => setDraft((current) => ({ ...current, linkedEvidenceTarget: event.target.value }))} placeholder={`${visibleProject.id} governed evidence chain`} />
          </label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="submit" style={buttonStyle} disabled={creating || !draft.name.trim()}>{creating ? "Creating…" : apiBacked ? "Create File Record" : "Stage File Record"}</button>
            <button type="button" style={secondaryButtonStyle} disabled={creating} onClick={() => setDraft(defaultDraft)}>Reset Draft</button>
          </div>
        </form>
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

      {briefingFiles.length ? (
        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Auricrux briefing surface</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Governed briefing artifacts ready for action</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {briefingFiles.map((file) => <AuricruxBriefingCard key={`briefing-${file.fileId}`} file={file} project={visibleProject} />)}
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
      </div>

      <ProjectFileAuditPanel
        project={visibleProject}
        files={files}
        auditEvents={auditEvents}
        busyFileId={busyFileId}
        targetedFileId={deepLink.fileId}
        onRegisterReview={(file) => handleFileAction(file, "register-review", `${file.name} queued for governed review under ${visibleProject.id}.`)}
        onClassifyFile={(file) => handleFileAction(file, "classify-file", `Auricrux classified ${file.name} for ${visibleProject.id}.`, { category: file.category, evidenceStatus: "Classification complete", status: "Classified", actionLabel: "Classification saved" })}
        onLinkEvidence={(file) => handleFileAction(file, "link-evidence", `${file.name} linked to governed evidence target for ${visibleProject.id}.`, { linkedEvidenceTarget: `${visibleProject.id} governed evidence chain`, evidenceStatus: "Evidence linked", status: "Linked to governed object", actionLabel: "Evidence linked" })}
        onCreateBriefing={handleCreateBriefing}
        onOpenDesign={(file) => {
          const href = `/portal/design?projectId=${encodeURIComponent(visibleProject.id)}&fileId=${encodeURIComponent(file.fileId)}`;
          window.location.href = href;
        }}
      />
    </PortalShell>
  );
}
