import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { portalProjects, routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalProjects() {
  const { state, refreshSyncStamp } = useWorkspaceState();

  useEffect(() => {
    refreshSyncStamp("Persisted project flow state active");
  }, [refreshSyncStamp]);

  return (
    <PortalShell
      title="Project Flow and Customer Visibility"
      subtitle="Execution-stage shell showing how FCA carries a customer from awarded work into job setup, delivery coordination, and closeout accountability."
      activeHref="/portal/projects"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref="/portal/files"
      primaryLabel="Open Files"
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Project route is anchored to the live workspace state"
          detail="Project execution visibility now reads from the same tenant, project, next-action, and blocker source as the rest of the FCA shell."
        />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Persisted project state</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Source:</strong> {state.meta.backingSource}</div>
          <div><strong>Status:</strong> {state.meta.persistenceState}</div>
          <div><strong>Last sync:</strong> {state.meta.lastSyncedAt || "Pending initial sync"}</div>
          <div><strong>Authenticated customer:</strong> {state.meta.authenticatedCustomer || "Continuity shell visitor"}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Current Project Root</h2>
        <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
          <div><strong>{state.project.name}</strong></div>
          <div>Project ID: {state.project.id}</div>
          <div>Current stage: {state.project.stage}</div>
          <div>{state.project.auditStatus}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Project Lifecycle</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            "Lead captured",
            "Bid built",
            "Customer approved",
            "Project mobilized",
            "Billing and closeout",
          ].map((step) => (
            <div key={step} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
              <div style={{ fontWeight: 700 }}>{step}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {portalProjects.map((project) => (
          <div key={project.id} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 6px 0" }}>{project.id} · {project.customer}</h3>
                <div style={{ color: "#4b5563", lineHeight: 1.6 }}>
                  Current stage: <strong>{project.stage}</strong><br />
                  Next action: {project.nextAction}<br />
                  Site status: {project.siteStatus}
                </div>
              </div>
              <div style={{ minWidth: 220, color: "#0f172a", lineHeight: 1.7 }}>
                <div><strong>Owner:</strong> {project.owner}</div>
                <div><strong>Due:</strong> {project.due}</div>
                <div><strong>Superintendent:</strong> {project.superintendent}</div>
                <div><strong>Permit status:</strong> {project.permitStatus}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, color: "#475569", lineHeight: 1.6 }}>
              <strong>Commercial focus:</strong> {project.commercialFocus}
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
