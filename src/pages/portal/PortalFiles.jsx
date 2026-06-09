import PortalShell from "../../components/PortalShell";
import ProjectFileAuditPanel from "../../components/ProjectFileAuditPanel";
import PublicCtaRow from "../../components/PublicCtaRow";
import SystemStateSummary from "../../components/SystemStateSummary";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectFileWorkspace from "../../hooks/useProjectFileWorkspace";
import { publicBodyCtaSets } from "../../websiteShell";
import { fileGovernance } from "../../fileGovernance";
import { qualificationEvidencePackets } from "../../qualificationEvidence";
import { routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const actionButtonStyle = {
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 600,
  padding: "10px 12px",
  cursor: "pointer",
};

export default function PortalFiles() {
  const { state } = useWorkspaceState();
  const { files, auditEvents, briefings, addFilePackage } = useProjectFileWorkspace();

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
          tenant={state.tenant}
          project={state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
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
          <div><strong>Project:</strong> {state.project.name}</div>
          <div><strong>Project ID:</strong> {state.project.id}</div>
          <div><strong>File count:</strong> {files.length} linked packages</div>
          <div>{state.project.fileSpineStatus || state.project.auditSummary || "Project-linked file spine active."}</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
          <button
            type="button"
            style={actionButtonStyle}
            onClick={() =>
              addFilePackage(state.project.id, {
                name: `Owner_Approval_${state.project.id}.pdf`,
                packageLabel: "Owner approval package",
                category: "Approval",
                discipline: "Commercial",
                documentType: "Approval",
                action: "Send for owner signoff",
                note: "Owner approval package linked so project setup and billing can proceed from one project record.",
                revisionLabel: "Rev A",
              })
            }
          >
            Add Approval Package
          </button>
          <button
            type="button"
            style={actionButtonStyle}
            onClick={() =>
              addFilePackage(state.project.id, {
                name: `Permit_Submission_${state.project.id}.pdf`,
                packageLabel: "Permit submission package",
                category: "Permit",
                discipline: "Permitting",
                documentType: "Permit",
                action: "Release for submission",
                note: "Permit package attached with auditable submission readiness and document-briefing output.",
                revisionLabel: "Permit Rev 1",
              })
            }
          >
            Add Permit Package
          </button>
          <button
            type="button"
            style={actionButtonStyle}
            onClick={() =>
              addFilePackage(state.project.id, {
                name: `Field_Onboarding_${state.project.id}.pdf`,
                packageLabel: "Field onboarding packet",
                category: "Field",
                discipline: "Safety",
                documentType: "Onboarding",
                action: "Assign field onboarding",
                note: "Field onboarding packet linked to project setup, safety readiness, and academy continuity.",
                revisionLabel: "Kickoff Pack",
              })
            }
          >
            Add Onboarding Packet
          </button>
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

      <ProjectFileAuditPanel project={state.project} files={files} auditEvents={auditEvents} briefings={briefings.slice(0, 6)} />
    </PortalShell>
  );
}
