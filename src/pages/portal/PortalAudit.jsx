import { useEffect, useMemo } from "react";
import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import ProjectFileAuditPanel from "../../components/ProjectFileAuditPanel";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
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

function buildEventTypeSummary(events) {
  const counts = events.reduce((acc, event) => {
    const key = event.eventType || "unspecified";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts);
}

export default function PortalAudit() {
  const { state, refreshSyncStamp, syncActiveProject } = useWorkspaceState();
  const { activeProject, meta: projectMeta } = useProjectWorkspace();

  const visibleProject = activeProject || state.project;
  const { files, auditEvents, meta: evidenceMeta } = useWorkflowEvidence(visibleProject?.id);
  const auditSummary = useMemo(() => buildEventTypeSummary(auditEvents), [auditEvents]);

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
          <div><strong>Evidence workflow source:</strong> {evidenceMeta.backingSource}</div>
          <div><strong>Evidence workflow status:</strong> {evidenceMeta.persistenceState}</div>
          <div><strong>Audit records loaded:</strong> {auditEvents.length}</div>
          <div><strong>Audit status:</strong> {visibleProject.auditStatus}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 16 }}>
        {auditSummary.map(([eventType, count]) => (
          <div key={eventType} style={cardStyle}>
            <div style={{ color: "#64748b", fontWeight: 700, fontSize: 12, textTransform: "uppercase", marginBottom: 8 }}>{eventType}</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{count}</div>
            <div style={{ color: "#475569", lineHeight: 1.6 }}>Visible continuity records for the active project spine.</div>
          </div>
        ))}
      </div>

      <ProjectFileAuditPanel project={visibleProject} files={files} auditEvents={auditEvents} />
    </PortalShell>
  );
}
