import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalProfile() {
  const { session, isAuthenticated } = useCustomerSession();
  const { state, refreshSyncStamp } = useWorkspaceState();

  useEffect(() => {
    refreshSyncStamp("Persisted customer profile state active");
  }, [refreshSyncStamp]);

  const sessionCompany = session?.company || state.tenant.name;
  const sessionEmail = session?.email || state.meta.customerSessionEmail || "workspace@futurecontractorsofamerica.com";
  const sessionWorkspace = session?.workspaceLabel || state.meta.customerWorkspaceLabel || `${sessionCompany} Workspace`;
  const sessionLogin = session?.lastLoginAt || state.meta.lastSyncedAt || "Pending first authenticated entry";
  const workspaceRole = session?.role || "Owner / Admin";

  return (
    <PortalShell
      title="Customer Identity and Workspace Profile"
      subtitle="Live customer identity surface showing workspace ownership, construction-role continuity, and Auricrux-guided next actions inside the active FCA shell."
      activeHref="/portal/profile"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.overview}
      primaryHref="/portal/platform"
      primaryLabel="Open Platform Dashboard"
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Customer profile now reads from the live authenticated workspace"
          detail="This profile route binds session identity, tenant continuity, project state, and Auricrux guidance into one customer-facing operating surface."
        />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Persisted profile state</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Source:</strong> {state.meta.backingSource}</div>
          <div><strong>Status:</strong> {state.meta.persistenceState}</div>
          <div><strong>Last sync:</strong> {state.meta.lastSyncedAt || "Pending initial sync"}</div>
          <div><strong>Authenticated customer:</strong> {state.meta.authenticatedCustomer || "Continuity shell visitor"}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16 }}>
        <div style={cardStyle}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Authenticated customer profile</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{sessionWorkspace}</h2>
          <div style={{ color: "#475569", lineHeight: 1.8 }}>
            <div><strong>Customer company:</strong> {sessionCompany}</div>
            <div><strong>Customer email:</strong> {sessionEmail}</div>
            <div><strong>Workspace role:</strong> {workspaceRole}</div>
            <div><strong>Session status:</strong> {isAuthenticated ? "Authenticated" : "Shell continuity mode"}</div>
            <div><strong>Last login:</strong> {sessionLogin}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Auricrux continuity signal</div>
          <div style={{ color: "#475569", lineHeight: 1.8 }}>
            <div><strong>Next action:</strong> {state.workspace.currentNextAction}</div>
            <div><strong>Current blocker:</strong> {state.auricrux.currentBlocker}</div>
            <div><strong>Recommended move:</strong> {state.auricrux.nextRecommendedAction}</div>
            <div><strong>Project spine:</strong> {state.project.id} · {state.project.stage}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 16 }}>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Current operating lane</div>
          <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0" }}>{state.workspace.currentStageLabel}</div>
          <div>{state.workspace.stageSummary}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Project responsibility</div>
          <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0" }}>{state.workspace.nextActionOwner}</div>
          <div>The profile now keeps ownership visible so estimating, coordination, accounting, and field roles stay legible to the customer.</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Construction-facing identity</div>
          <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0" }}>Workspace tied to live job flow</div>
          <div>Profile continuity stays attached to bids, project setup, document control, billing, and workforce readiness instead of becoming a dead-end account page.</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Why this route matters</h2>
        <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 0 }}>
          The profile icon now has a real destination inside the product. Instead of routing customers into a dead-end account stub,
          this surface confirms who is signed in, what workspace they control, what project spine is active, what role they hold in the construction workflow,
          and what Auricrux says should happen next.
        </p>
      </div>
    </PortalShell>
  );
}
