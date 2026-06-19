import { useEffect, useMemo } from "react";
import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import ProjectFileAuditPanel from "../../components/ProjectFileAuditPanel";
import ExecutionTruthBanner from "../../components/ExecutionTruthBanner";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import useWorkflowAudit from "../../hooks/useWorkflowAudit";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const statCardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 14,
  background: "#f8fbff",
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

const auditRouteOverlay = {
  title: "Audit route state",
  summary: "Audit specializes the shared state around accountable execution, file evidence continuity, and Auricrux traceability.",
  status: "Audit state active",
  primaryFocus: "Timeline and correction continuity",
  primaryDetail: "This route keeps project history, evidence linkage, and Auricrux actions connected to the same active project root.",
  dependency: "Project and file continuity",
  dependencyDetail: "Audit depends on active project context and file/evidence linkage remaining stable across routes.",
  auricruxRole: "Record and explain",
  auricruxDetail: "Auricrux uses this route to explain what changed, why it changed, and what should happen next.",
};

export default function PortalAudit() {
  const { state, refreshSyncStamp, syncActiveProject } = useWorkspaceState();
  const { activeProject, meta: projectMeta } = useProjectWorkspace();

  const visibleProject = activeProject || state.project;
  const { files } = useWorkflowEvidence(visibleProject?.id);
  const { auditEvents, meta: auditMeta, filters, setFilters, summary } = useWorkflowAudit(visibleProject?.id);

  const eventTypeOptions = useMemo(() => ["All", ...Object.keys(summary.byEventType).sort()], [summary.byEventType]);
  const actorTypeOptions = useMemo(() => ["All", ...Object.keys(summary.byActorType).sort()], [summary.byActorType]);
  const apiBacked = auditMeta.backingSource === "api-workflow-store";

  useEffect(() => {
    if (activeProject) {
      syncActiveProject(activeProject, `Audit route synchronized to ${activeProject.id}`);
    }
    refreshSyncStamp(`Audit route synchronized to ${visibleProject.id}`);
  }, [activeProject, refreshSyncStamp, syncActiveProject, visibleProject.id]);

  return (
    <PortalShell
      title="Audit Timeline and Auricrux Record"
      subtitle="Continuity surface showing project-linked file movement, accountable workflow mutations, and Auricrux operating history under one project spine."
      activeHref="/portal/audit"
      currentJourney="coordination"
      routeOverlay={auditRouteOverlay}
      primaryHref="/portal/projects"
      primaryLabel="Open Project Flow"
      workspaceState={state}
    >
      {!apiBacked ? (
        <div style={{ marginBottom: 16 }}>
          <ExecutionTruthBanner
            title="Audit continuity shell is active"
            status="Workspace active"
            source={auditMeta.backingSource}
            tone="warning"
            whatIsLive={[
              "Audit timeline layout and project-scoping controls.",
              "Actor-type and event-type filtering inside the shell.",
              "Continuity-oriented review of project/file/Auricrux history posture.",
            ]}
            whatIsNotLiveYet={[
              "This route is not currently using fully verified governed audit truth for all displayed records.",
              "Fallback audit history can appear when API-backed audit evidence is unavailable.",
              "Full correction, reversal, and production-grade audit lifecycle support is not yet verified here.",
            ]}
          />
        </div>
      ) : null}

      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={visibleProject}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Audit visibility now reads from the active project workspace"
          detail="Project-linked file movement, route actions, and Auricrux traces now resolve against the same active project context used by Projects and Files."
        />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Active audit scope</div>
        <div style={{ color: "#334155", lineHeight: 1.8 }}>
          <div><strong>Project root:</strong> {visibleProject.id}</div>
          <div><strong>Project name:</strong> {visibleProject.name}</div>
          <div><strong>Current stage:</strong> {visibleProject.stage}</div>
          <div><strong>Next action:</strong> {visibleProject.nextAction || state.workspace.currentNextAction}</div>
          <div><strong>Project workflow source:</strong> {projectMeta.backingSource}</div>
          <div><strong>Audit workflow source:</strong> {auditMeta.backingSource}</div>
          <div><strong>Audit workflow status:</strong> {auditMeta.persistenceState}</div>
          <div><strong>Visible audit records:</strong> {summary.total}</div>
          <div><strong>Audit status:</strong> {visibleProject.auditStatus}</div>
          {!apiBacked ? <div><strong>Execution note:</strong> When API-backed audit evidence is unavailable, this route is showing continuity scaffolding and fallback audit history for workspace validation only.</div> : null}
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Audit summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
          <div style={statCardStyle}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Visible audit records</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{summary.total}</div>
          </div>
          {Object.entries(summary.byEventType).slice(0, 3).map(([label, count]) => (
            <div key={label} style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{count}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Search</div>
            <input style={inputStyle} value={filters.q} onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))} placeholder="Search action, reason, discipline, event type" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Event type</div>
            <select style={inputStyle} value={filters.eventType} onChange={(event) => setFilters((current) => ({ ...current, eventType: event.target.value }))}>
              {eventTypeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Actor type</div>
            <select style={inputStyle} value={filters.actorType} onChange={(event) => setFilters((current) => ({ ...current, actorType: event.target.value }))}>
              {actorTypeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <ProjectFileAuditPanel project={visibleProject} files={files} auditEvents={auditEvents} />
    </PortalShell>
  );
}
