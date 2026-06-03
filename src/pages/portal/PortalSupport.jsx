import PortalShell from "../../components/PortalShell";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import PublicCtaRow from "../../components/PublicCtaRow";
import SystemStateSummary from "../../components/SystemStateSummary";
import { ctaLightStyle, ctaPrimaryStyle } from "../../publicShellStyles";
import { publicBodyCtaSets } from "../../websiteShell";
import { auricruxRail, currentProject, portalTenant, routeStateOverlays, workspaceContext } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
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
      primaryLabel="Open Contact & Rollout"
    >
      <div style={{ marginBottom: 24 }}>
        <SystemStateSummary
          tenant={portalTenant}
          project={currentProject}
          workspace={workspaceContext}
          auricrux={auricruxRail}
          title="Support route is attached to the canonical operating state"
          detail="Escalation and recovery context now read from the same system module as portal execution, billing, and academy continuity."
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <PublicCtaRow actions={publicBodyCtaSets.portalCoordination} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
      </div>

      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Support continuity</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>FCA support now presents as part of the same operating shell</h2>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <FcaBrandMark compact />
            <AuricruxBrandMark compact />
          </div>
        </div>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>
          Customer help, escalation handling, and recovery guidance remain attached to the same tenant, project, and Auricrux state as the rest of FCA rather than appearing as a disconnected support tool.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Active support context</h2>
          <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
            <div><strong>Tenant:</strong> {portalTenant.name}</div>
            <div><strong>Project:</strong> {currentProject.name}</div>
            <div><strong>Project ID:</strong> {currentProject.id}</div>
            <div><strong>Current issue pattern:</strong> approval delay, onboarding coordination, billing readiness</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
            <a href="/portal/messages" style={ctaPrimaryStyle}>Open Messages</a>
            <a href="/portal/billing" style={ctaLightStyle}>Open Billing</a>
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
