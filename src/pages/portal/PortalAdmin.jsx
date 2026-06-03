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

export default function PortalAdmin() {
  return (
    <PortalShell
      title="Admin, Rollout, and Governance Control"
      subtitle="Administrative surface for tenant status, rollout readiness, seat visibility, and Auricrux governance awareness."
      activeHref="/portal/admin"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.admin}
      primaryHref="/pricing"
      primaryLabel="Open Rollout Planning"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Tenant</div>
          <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0" }}>{portalTenant.name}</div>
          <div>{portalTenant.roleSummary}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Seat readiness</div>
          <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0" }}>5 seats</div>
          <div>Owner, Admin, Estimator, Coordinator, Learner</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Rollout state</div>
          <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0" }}>Production shell active</div>
          <div>Backend spine and persistence hardening still in progress</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Governance visibility</div>
          <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0" }}>Auricrux monitored</div>
          <div>Project {currentProject.id} remains within shared audit and workspace control</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Administrative priorities</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9, marginBottom: 0 }}>
            <li>Confirm tenant rollout sequence</li>
            <li>Validate project-linked file/audit continuity</li>
            <li>Track billing and training readiness together</li>
            <li>Preserve Auricrux visibility across all routes</li>
          </ul>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Production posture</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
            This control surface is the beginning of the broader platform spine: tenant summary, seat/readiness view,
            rollout status, and governance visibility inside the same FCA shell.
          </p>
        </div>
      </div>
    </PortalShell>
  );
}
