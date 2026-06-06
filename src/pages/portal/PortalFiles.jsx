import PortalShell from "../../components/PortalShell";
import ProjectFileAuditPanel from "../../components/ProjectFileAuditPanel";
import PublicCtaRow from "../../components/PublicCtaRow";
import SystemStateSummary from "../../components/SystemStateSummary";
import { publicBodyCtaSets } from "../../websiteShell";
import { auricruxRail, currentProject, portalFiles, portalTenant, projectAuditEvents, routeStateOverlays, workspaceContext } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalFiles() {
  return (
    <PortalShell
      title="Files, Plans, and Customer Documents"
      subtitle="Document shell proving that bid packages, permit sets, RFIs, submittals, safety packets, and project artifacts live in one connected workspace."
      activeHref="/portal/files"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.files}
      primaryHref="/portal/messages"
      primaryLabel="Open Messages"
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={portalTenant}
          project={currentProject}
          workspace={workspaceContext}
          auricrux={auricruxRail}
          title="File route now reads from the same canonical state"
          detail="Document context, next action, and blocker visibility stay attached to the shared system module rather than separate wrapper exports."
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <PublicCtaRow actions={publicBodyCtaSets.portalCoordination} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>File Spine Context</h2>
        <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
          <div><strong>Project:</strong> {currentProject.name}</div>
          <div><strong>Project ID:</strong> {currentProject.id}</div>
          <div><strong>File set:</strong> {currentProject.fileSetLabel}</div>
          <div>{currentProject.fileSpineStatus}</div>
        </div>
      </div>

      <ProjectFileAuditPanel project={currentProject} files={portalFiles} auditEvents={projectAuditEvents} />
    </PortalShell>
  );
}
