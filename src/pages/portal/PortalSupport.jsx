import PortalShell from "../../components/PortalShell";
import { currentProject, portalTenant } from "../../portalShell";
import { routeStateOverlays } from "../../workspaceState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const actionStyle = {
  display: "inline-block",
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  marginTop: 12,
  marginRight: 10,
};

export default function PortalSupport() {
  return (
    <PortalShell
      title="Support, Escalation, and Continuity"
      subtitle="Support surface for customer help, issue escalation, and Auricrux-guided continuity recovery inside the same workspace shell."
      activeHref="/portal/support"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.support}
      primaryHref="/contact"
      primaryLabel="Open Support Contact"
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Active support context</h2>
          <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
            <div><strong>Tenant:</strong> {portalTenant.name}</div>
            <div><strong>Project:</strong> {currentProject.name}</div>
            <div><strong>Project ID:</strong> {currentProject.id}</div>
            <div><strong>Current issue pattern:</strong> approval delay, onboarding coordination, billing readiness</div>
          </div>
          <div>
            <a href="/portal/messages" style={actionStyle}>Review Messages</a>
            <a href="/portal/billing" style={{ ...actionStyle, background: "#e5e7eb", color: "#111827" }}>Open Billing</a>
          </div>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Escalation lanes</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9, marginBottom: 0 }}>
            <li>Customer-facing support request</li>
            <li>Auricrux continuity alert</li>
            <li>Billing readiness blocker</li>
            <li>Academy onboarding delay</li>
            <li>Founder review escalation</li>
          </ul>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Why this route matters</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          Support should not sit outside the operating shell. This route keeps customer help, continuity recovery,
          and escalation handling attached to the same tenant, project, file, audit, and Auricrux state as the rest of FCA.
        </p>
      </div>
    </PortalShell>
  );
}
