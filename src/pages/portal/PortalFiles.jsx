import { useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import ProjectFileAuditPanel from "../../components/ProjectFileAuditPanel";
import PublicCtaRow from "../../components/PublicCtaRow";
import SystemStateSummary from "../../components/SystemStateSummary";
import { publicBodyCtaSets } from "../../websiteShell";
import { fileGovernance } from "../../fileGovernance";
import { qualificationEvidencePackets } from "../../qualificationEvidence";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useFileWorkspace from "../../hooks/useFileWorkspace";
import { auricruxRail, currentProject, projectAuditEvents, routeStateOverlays, workspaceContext, portalTenant } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalFiles() {
  const { projects, syncProjectEvidence } = useProjectWorkspace();
  const { files, getFilesForProject, attachEvidence, generateBriefing } = useFileWorkspace();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || currentProject.id.replace("PRJ-", ""));

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || projects[0],
    [projects, selectedProjectId]
  );

  const selectedFiles = selectedProject ? getFilesForProject(selectedProject.id) : files;
  const selectedAuditEvents = selectedProject
    ? projectAuditEvents.map((event) => ({ ...event, action: `${event.action} · ${selectedProject.canonicalProjectId}` }))
    : projectAuditEvents;

  return (
    <PortalShell
      title="Files, Plans, and Customer Documents"
      subtitle="Document shell proving that qualification evidence, bid packages, permit sets, RFIs, submittals, safety packets, and project artifacts live in one connected workspace."
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
          detail="Document context, next action, qualification evidence, and blocker visibility stay attached to the shared system module rather than separate wrapper exports."
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <PublicCtaRow actions={publicBodyCtaSets.portalCoordination} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>File Spine Context</h2>
        <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
          <div><strong>Project:</strong> {selectedProject?.customer || currentProject.name}</div>
          <div><strong>Canonical project ID:</strong> {selectedProject?.canonicalProjectId || currentProject.id}</div>
          <div><strong>Linked file count:</strong> {selectedFiles.length}</div>
          <div><strong>Evidence posture:</strong> {selectedProject?.evidenceStatus || currentProject.fileSpineStatus}</div>
          <div><strong>Briefing posture:</strong> {selectedProject?.fileBriefingStatus || "Document briefing pending"}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Project-linked document control</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>Select the project spine the files belong to</h2>
            <div style={{ color: "#334155", lineHeight: 1.7 }}>
              Every file package must anchor to one project/job record, one evidence trail, and one Auricrux-guided next action.
            </div>
          </div>
          <div>
            <label htmlFor="project-selector" style={{ display: "block", fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>Project spine</label>
            <select
              id="project-selector"
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              style={{ minWidth: 280, borderRadius: 10, border: "1px solid #cbd5e1", padding: "10px 12px", font: "inherit" }}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.canonicalProjectId} · {project.customer}</option>
              ))}
            </select>
          </div>
        </div>
        {selectedProject ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <button
              type="button"
              onClick={() => {
                const savedFiles = attachEvidence(selectedProject);
                syncProjectEvidence(selectedProject.id, savedFiles.filter((file) => file.projectId === selectedProject.id).length, `Evidence spine refreshed for ${selectedProject.canonicalProjectId}.`);
              }}
              style={{ border: "1px solid #1d4ed8", background: "#1d4ed8", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer", font: "inherit" }}
            >
              Attach Evidence to {selectedProject.canonicalProjectId}
            </button>
            <button
              type="button"
              onClick={() => {
                const savedFiles = generateBriefing(selectedProject);
                syncProjectEvidence(selectedProject.id, savedFiles.filter((file) => file.projectId === selectedProject.id).length, `Auricrux briefing refreshed for ${selectedProject.canonicalProjectId}.`);
              }}
              style={{ border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer", font: "inherit" }}
            >
              Refresh Auricrux Briefing
            </button>
          </div>
        ) : null}
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

      <ProjectFileAuditPanel project={selectedProject || currentProject} files={selectedFiles} auditEvents={selectedAuditEvents} />
    </PortalShell>
  );
}
