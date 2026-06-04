import PortalShell from "../../components/PortalShell";
import PublicCtaRow from "../../components/PublicCtaRow";
import SystemStateSummary from "../../components/SystemStateSummary";
import useCustomerSession from "../../hooks/useCustomerSession";
import { publicBodyCtaSets } from "../../websiteShell";
import { auricruxRail, currentProject, portalTenant, routeStateOverlays, workspaceContext } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalProfile() {
  const { session, isAuthenticated } = useCustomerSession();
  const sessionCompany = session?.company || portalTenant.name;
  const sessionEmail = session?.email || "workspace@futurecontractorsofamerica.com";
  const sessionWorkspace = session?.workspaceLabel || `${sessionCompany} Workspace`;
  const sessionLogin = session?.lastLoginAt || "Pending first authenticated entry";

  return (
    <PortalShell
      title="Customer Identity and Workspace Profile"
      subtitle="Live customer identity surface showing session continuity, workspace ownership, and Auricrux-guided next actions inside the active FCA shell."
      activeHref="/portal/profile"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.overview}
      primaryHref="/portal/platform"
      primaryLabel="Open Platform Dashboard"
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={portalTenant}
          project={currentProject}
          workspace={workspaceContext}
          auricrux={auricruxRail}
          title="Customer profile now reads from the live authenticated workspace"
          detail="This profile route binds session identity, tenant continuity, project state, and Auricrux guidance into one customer-facing operating surface."
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <PublicCtaRow actions={publicBodyCtaSets.portalEntry} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16 }}>
        <div style={cardStyle}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Authenticated customer profile</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{sessionWorkspace}</h2>
          <div style={{ color: "#475569", lineHeight: 1.8 }}>
            <div><strong>Customer company:</strong> {sessionCompany}</div>
            <div><strong>Customer email:</strong> {sessionEmail}</div>
            <div><strong>Session status:</strong> {isAuthenticated ? "Authenticated" : "Shell continuity mode"}</div>
            <div><strong>Last login:</strong> {sessionLogin}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Auricrux continuity signal</div>
          <div style={{ color: "#475569", lineHeight: 1.8 }}>
            <div><strong>Next action:</strong> {workspaceContext.currentNextAction}</div>
            <div><strong>Current blocker:</strong> {auricruxRail.currentBlocker}</div>
            <div><strong>Recommended move:</strong> {auricruxRail.nextRecommendedAction}</div>
            <div><strong>Project spine:</strong> {currentProject.id} · {currentProject.stage}</div>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Why this route matters</h2>
        <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 0 }}>
          The profile icon now has a real destination inside the product. Instead of routing customers into a dead-end account stub,
          this surface confirms who is signed in, what workspace they control, what project spine is active, and what Auricrux says should happen next.
        </p>
      </div>
    </PortalShell>
  );
}
