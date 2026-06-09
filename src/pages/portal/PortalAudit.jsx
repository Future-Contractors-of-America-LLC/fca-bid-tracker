import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import ProjectFileAuditPanel from "../../components/ProjectFileAuditPanel";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import { portalFiles, projectAuditEvents } from "../../systemState";

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

export default function PortalAudit() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { activeProject } = useProjectWorkspace();

  useEffect(() => {
    refreshSyncStamp(`Audit route synchronized to ${state.project.id}`);
  }, [refreshSyncStamp, state.project.id]);

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
          project={state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Audit visibility now reads from the active project workspace"
          detail="Project-linked file movement, route actions, and Auricrux traces now resolve against the same project context used by Projects and Files."
        />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Active audit scope</div>
        <div style={{ color: "#334155", lineHeight: 1.8 }}>
          <div><strong>Project root:</strong> {state.project.id}</div>
          <div><strong>Project name:</strong> {state.project.name}</div>
          <div><strong>Current stage:</strong> {state.project.stage}</div>
          <div><strong>Next action:</strong> {state.workspace.currentNextAction}</div>
          <div><strong>Selected project source:</strong> {activeProject?.id || state.project.id}</div>
        </div>
      </div>

      <ProjectFileAuditPanel project={state.project} files={portalFiles} auditEvents={projectAuditEvents} />
    </PortalShell>
  );
}
