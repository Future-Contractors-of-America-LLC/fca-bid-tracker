import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import ProjectFileAuditPanel from "../../components/ProjectFileAuditPanel";
import PublicCtaRow from "../../components/PublicCtaRow";
import SystemStateSummary from "../../components/SystemStateSummary";
import AuricruxBriefingCard from "../../components/AuricruxBriefingCard";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import { publicBodyCtaSets } from "../../websiteShell";
import { fileGovernance } from "../../fileGovernance";
import { qualificationEvidencePackets, qualificationEvidenceByProject } from "../../qualificationEvidence";
import { routeStateOverlays } from "../../systemState";

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

const defaultDraft = {
  name: "",
  category: "Document",
  discipline: "Document Control",
  owner: "Project Coordinator",
  linkedEvidenceTarget: "",
};

function isBriefingReady(file = {}) {
  const haystack = `${file.status || ""} ${file.evidenceStatus || ""} ${file.action || ""} ${file.note || ""}`.toLowerCase();
  return haystack.includes("briefing");
}

function buildBriefingMutation(file, visibleProject) {
  return {
    evidenceStatus: "Briefing generated",
    status: "Auricrux briefing ready",
    actionLabel: "Open briefing",
    briefingTitle: `Auricrux Briefing — ${file.name}`,
    briefingSummary: `Auricrux generated a governed briefing placeholder for ${file.name} under ${visibleProject.id}.`,
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
    projectId: params.get("project") || "",
    fileId: params.get("file") || "",
  };
}

export default function PortalFiles() {
  const { state, refreshSyncStamp, syncActiveProject } = useWorkspaceState();
  const { activeProject, meta: projectMeta } = useProjectWorkspace();
  const [busyFileId, setBusyFileId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(defaultDraft);
  const [deepLink] = useState(() => readDeepLinkParams());

  const visibleProject = activeProject || state.project;
  const { files, auditEvents, meta: evidenceMeta, mutateFile, filters, setFilters, summary } = useWorkflowEvidence(visibleProject?.id);
  const evidencePackets = qualificationEvidenceByProject?.[visibleProject?.id] || qualificationEvidencePackets;
  const briefingFiles = useMemo(() => files.filter((file) => isBriefingReady(file)), [files]);
  const targetedFile = useMemo(() => files.find((file) => file.fileId === deepLink.fileId) || null, [files, deepLink.fileId]);

  const categoryOptions = useMemo(() => ["All", ...Object.keys(summary.byCategory).sort()], [summary.byCategory]);
  const statusOptions = useMemo(() => ["All", ...Object.keys(summary.byStatus).sort()], [summary.byStatus]);

  useEffect(() => {
    if (activeProject) {
      syncActiveProject(activeProject, `File spine synchronized to ${activeProject.id}`);
    }
    refreshSyncStamp(`File spine synchronized to ${visibleProject.id}`);
  }, [activeProject, refreshSyncStamp, syncActiveProject, visibleProject.id]);

  useEffect(() => {
    if (!deepLink.fileId || !targetedFile) return;
    setFilters((current) => (current.q === targetedFile.name ? current : { ...current, q: targetedFile.name }));
  }, [deepLink.fileId, targetedFile, setFilters]);

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
      title="Files, Plans, and Customer Documents"
      subtitle="Document shell proving that qualification evidence, bid packages, permit sets, RFIs, submittals, safety packets, and project artifacts live in one connected workspace."
      activeHref="/portal/files"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.files}
      primaryHref="/portal/messages"
      primaryLabel="Open Messages"
      workspaceState={state}
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={visibleProject}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="File route now reads from the active project workspace"
          detail="Document context, next action, qualification evidence, and blocker visibility stay attached to the same active project root used by Projects and Audit."
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <PublicCtaRow actions={publicBodyCtaSets.portalCoordination} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Active file workspace</div>
        <div style={{ color: "#334155", lineHeight: 1.8 }}>
          <div><strong>Project root:</strong> {visibleProject.id}</div>
          <div><strong>Project name:</strong> {visibleProject.name}</div>
          <div><strong>Project workflow source:</strong> {projectMeta.backingSource}</div>
          <div><strong>Evidence workflow source:</strong> {evidenceMeta.backingSource}</div>
          <div><strong>Evidence workflow status:</strong> {evidenceMeta.persistenceState}</div>
          <div><strong>Last evidence sync:</strong> {evidenceMeta.lastSyncedAt || "Pending initial sync"}</div>
        </div>
      </div>

      {targetedFile ? (
        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #2563eb" }}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Targeted file briefing focus</div>
          <AuricruxBriefingCard file={targetedFile} project={visibleProject} />
        </div>
      ) : null}

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>File Spine Context</h2>
        <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
          <div><strong>Project:</strong> {visibleProject.name}</div>
          <div><strong>Project ID:</strong> {visibleProject.id}</div>
          <div><strong>File set:</strong> {visibleProject.fileSetLabel}</div>
          <div>{visibleProject.fileSpineStatus}</div>
          <div><strong>Visible file records:</strong> {summary.total}</div>
          <div><strong>Workflow-backed audit records:</strong> {auditEvents.length}</div>
          <div><strong>Briefing-ready artifacts:</strong> {briefingFiles.length}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>File register summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
          <div style={statCardStyle}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Visible files</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{summary.total}</div>
          </div>
          <div style={statCardStyle}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Briefings ready</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{briefingFiles.length}</div>
          </div>
          {Object.entries(summary.byStatus).slice(0, 2).map(([label, count]) => (
            <div key={label} style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{count}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Search</div>
            <input style={inputStyle} value={filters.q} onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))} placeholder="Search file name, owner, evidence target, note" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Category</div>
            <select style={inputStyle} value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
              {categoryOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Status</div>
            <select style={inputStyle} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              {statusOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {briefingFiles.length ? (
        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Auricrux briefing surface</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Governed briefing artifacts ready for action</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {briefingFiles.map((file) => (
              <AuricruxBriefingCard key={`briefing-${file.fileId}`} file={file} project={visibleProject} />
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Governed file registration</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Create a project-linked file record</h2>
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
            <button type="submit" style={buttonStyle} disabled={creating || !draft.name.trim()}>
              {creating ? "Creating…" : "Create file record"}
            </button>
            <button type="button" style={secondaryButtonStyle} disabled={creating} onClick={() => setDraft(defaultDraft)}>
              Reset draft
            </button>
          </div>
        </form>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Qualification evidence handoff</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>The file spine now proves why a bid was allowed to advance</h2>
        <div style={{ display: "grid", gap: 16 }}>
          {evidencePackets.map((packet) => (
            <div key={packet.bidId} style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#f8fbff" }}>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{packet.packageName}</h3>
              <div style={{ color: "#334155", lineHeight: 1.7 }}>
                <div><strong>Readiness:</strong> {packet.readiness}</div>
                <div><strong>Summary:</strong> {packet.summary}</div>
                <div><strong>Next action:</strong> {packet.nextAction}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
                <div>
                  <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Linked evidence files</div>
                  <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", margin: 0 }}>
                    {packet.files.map((file) => (
                      <li key={file}>{file}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Gate checks</div>
                  <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", margin: 0 }}>
                    {packet.checks.map((check) => (
                      <li key={check}>{check}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Document-control governance</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>FCA now models drawing, RFI, submittal, and closeout continuity as a governed product layer</h2>
        <div style={{ display: "grid", gap: 16 }}>
          {fileGovernance.registers.map((register) => (
            <div key={register.title} style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#f8fbff" }}>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{register.title}</h3>
              <p style={{ color: "#334155", lineHeight: 1.7 }}>{register.purpose}</p>
              <a href={register.route} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{register.label}</a>
              <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", marginTop: 10, marginBottom: 0 }}>
                {register.artifacts.map((artifact) => (
                  <li key={artifact}>{artifact}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
            <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Closeout package checklist</div>
            <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", marginTop: 0 }}>
              {fileGovernance.closeoutPackages.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
            <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Audit signals</div>
            <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", marginTop: 0 }}>
              {fileGovernance.auditSignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ProjectFileAuditPanel
        project={visibleProject}
        files={files}
        auditEvents={auditEvents}
        busyFileId={busyFileId}
        targetedFileId={deepLink.fileId}
        onRegisterReview={(file) =>
          handleFileAction(file, "register-review", `${file.name} queued for governed review under ${visibleProject.id}.`)
        }
        onClassifyFile={(file) =>
          handleFileAction(file, "classify-file", `Auricrux classified ${file.name} for ${visibleProject.id}.`, {
            category: file.category,
            evidenceStatus: "Classification complete",
            status: "Classified",
            actionLabel: "Classification saved",
          })
        }
        onLinkEvidence={(file) =>
          handleFileAction(file, "link-evidence", `${file.name} linked to governed evidence target for ${visibleProject.id}.`, {
            linkedEvidenceTarget: `${visibleProject.id} governed evidence chain`,
            evidenceStatus: "Evidence linked",
            status: "Linked to governed object",
            actionLabel: "Evidence linked",
          })
        }
        onCreateBriefing={(file) =>
          handleFileAction(file, "create-briefing", `Auricrux generated a briefing placeholder for ${file.name} under ${visibleProject.id}.`, buildBriefingMutation(file, visibleProject))
        }
      />
    </PortalShell>
  );
}
