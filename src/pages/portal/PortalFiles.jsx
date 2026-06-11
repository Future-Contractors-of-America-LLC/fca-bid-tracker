import { useEffect, useMemo } from "react";
import PortalShell from "../../components/PortalShell";
import ProjectFileAuditPanel from "../../components/ProjectFileAuditPanel";
import PublicCtaRow from "../../components/PublicCtaRow";
import SystemStateSummary from "../../components/SystemStateSummary";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import { publicBodyCtaSets } from "../../websiteShell";
import { fileGovernance } from "../../fileGovernance";
import { qualificationEvidencePackets } from "../../qualificationEvidence";
import { portalFiles, projectAuditEvents, routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

function scopeFilesToProject(files, project) {
  const projectId = project?.id || "PRJ-A117";
  const projectSuffix = projectId.replace(/^PRJ-/, "");

  return files
    .filter((file) => !file.ownerObjectId || file.ownerObjectId === "PRJ-A117" || file.ownerObjectId === projectId)
    .map((file, index) => ({
      ...file,
      fileId: `${projectId}-FILE-${index + 1}`,
      ownerObjectType: file.ownerObjectType || "Project",
      ownerObjectId: projectId,
      linkedEvidenceTarget: file.linkedEvidenceTarget || `${projectId} continuity record`,
      name: file.name.replace(/A117/g, projectSuffix),
      note: `${file.note} Active project context: ${projectId}.`,
    }));
}

function scopeAuditEventsToProject(events, project) {
  const projectId = project?.id || "PRJ-A117";
  return events
    .filter((event) => !event.targetObjectId || event.targetObjectId === projectId || event.detail?.includes("PRJ-A117") || event.reason?.includes("PRJ-A117"))
    .map((event) => ({
      ...event,
      targetObjectId: event.targetObjectId || projectId,
      detail: event.detail.replace(/PRJ-A117/g, projectId),
      reason: event.reason?.replace(/PRJ-A117/g, projectId),
    }));
}

export default function PortalFiles() {
  const { state, refreshSyncStamp, syncActiveProject } = useWorkspaceState();
  const { activeProject, meta } = useProjectWorkspace();

  const visibleProject = activeProject || state.project;

  useEffect(() => {
    if (activeProject) {
      syncActiveProject(activeProject, `File spine synchronized to ${activeProject.id}`);
    }
    refreshSyncStamp(`File spine synchronized to ${visibleProject.id}`);
  }, [activeProject, refreshSyncStamp, syncActiveProject, visibleProject.id]);

  const scopedFiles = useMemo(() => scopeFilesToProject(portalFiles, visibleProject), [visibleProject]);
  const scopedAuditEvents = useMemo(() => scopeAuditEventsToProject(projectAuditEvents, visibleProject), [visibleProject]);

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
          <div><strong>Workflow source:</strong> {meta.backingSource}</div>
          <div><strong>Workflow status:</strong> {meta.persistenceState}</div>
          <div><strong>Last workflow sync:</strong> {meta.lastSyncedAt || "Pending initial sync"}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>File Spine Context</h2>
        <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
          <div><strong>Project:</strong> {visibleProject.name}</div>
          <div><strong>Project ID:</strong> {visibleProject.id}</div>
          <div><strong>File set:</strong> {visibleProject.fileSetLabel}</div>
          <div>{visibleProject.fileSpineStatus}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Qualification evidence handoff</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>The file spine now proves why a bid was allowed to advance</h2>
        <div style={{ display: "grid", gap: 16 }}>
          {qualificationEvidencePackets.map((packet) => (
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

      <ProjectFileAuditPanel project={visibleProject} files={scopedFiles} auditEvents={scopedAuditEvents} />
    </PortalShell>
  );
}
