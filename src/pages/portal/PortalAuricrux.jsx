import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import ProductAccessStatusPanel from "../../components/ProductAccessStatusPanel";
import CustomerProductLaunchpad from "../../components/CustomerProductLaunchpad";
import PublicCtaRow from "../../components/PublicCtaRow";
import AuricruxCommsPanel from "../../components/AuricruxCommsPanel";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { auricruxActions, auricruxCommsChannels, auricruxRail, currentProject, portalTenant, routeStateOverlays, workspaceContext } from "../../systemState";
import { publicBodyCtaSets } from "../../websiteShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalAuricrux() {
  const { session } = useCustomerSession();
  const { state } = useWorkspaceState();

  return (
    <PortalShell
      title="Auricrux Live Guidance Workspace"
      subtitle="Authenticated customer surface for live Auricrux guidance across approvals, document dependencies, billing follow-through, workforce readiness, and communications orchestration."
      activeHref="/portal/auricrux"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.platform}
      primaryHref="/portal/platform"
      primaryLabel="Open Platform Dashboard"
    >
      <ProductAccessStatusPanel session={session} stateMeta={state.meta} />
      <CustomerProductLaunchpad session={session} title="Launch real customer product from Auricrux" />

      <div style={{ marginBottom: 24 }}>
        <SystemStateSummary
          tenant={portalTenant}
          project={currentProject}
          workspace={workspaceContext}
          auricrux={auricruxRail}
          title="Auricrux is now a live authenticated product surface"
          detail="This route gives the customer direct access to Auricrux guidance inside the real workspace shell, tied to the same tenant, project, blocker, next-action, and communications state as the rest of FCA."
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <AuricruxCommsPanel
          title="Auricrux now acts as the cross-channel communications executive layer"
          detail="Auricrux communications is now framed as one coordinated control plane across chat, SMS, phone, email, Teams, conference, and lecture so guidance can move execution forward instead of stopping at recommendations."
          statusLabel="Auricrux comms status"
          statusValue="Cross-channel orchestration active"
          items={auricruxCommsChannels}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <PublicCtaRow actions={publicBodyCtaSets.portalEntry} style={{ display: "flex", gap: 12, flexWrap: "wrap" }} />
      </div>

      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)", border: "1px solid #e5d3a1" }}>
        <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Live Auricrux guidance</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Current blocker:</strong> {auricruxRail.currentBlocker}</div>
          <div><strong>Blocker impact:</strong> {auricruxRail.blockerImpact}</div>
          <div><strong>Recommended move:</strong> {auricruxRail.nextRecommendedAction}</div>
          <div><strong>Reason:</strong> {auricruxRail.recommendationReason}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Current guided actions</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9, marginBottom: 0 }}>
            {auricruxActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Why this is real product access</h2>
          <div style={{ color: "#475569", lineHeight: 1.8 }}>
            <div><strong>Session:</strong> {session?.workspaceLabel || "Authenticated customer workspace"}</div>
            <div><strong>Route:</strong> /portal/auricrux</div>
            <div><strong>Scope:</strong> SaaS workspace + LMS continuity + live Auricrux guidance + comms orchestration</div>
            <div><strong>Project spine:</strong> {currentProject.id} · {currentProject.stage}</div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
