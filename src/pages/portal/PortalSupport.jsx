import PortalShell from "../../components/PortalShell";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import PublicCtaRow from "../../components/PublicCtaRow";
import SystemStateSummary from "../../components/SystemStateSummary";
import AuricruxCommsPanel from "../../components/AuricruxCommsPanel";
import { publicBodyCtaSets, portalNarrativeCtaSets } from "../../websiteShell";
import { auricruxCommsChannels, auricruxRail, currentProject, portalTenant, routeStateOverlays, workspaceContext } from "../../systemState";

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
      subtitle="Support surface for owner communication, permit/document issues, field-readiness blockers, and Auricrux-guided recovery inside the same workspace shell."
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
        <AuricruxCommsPanel
          title="Support is now framed inside the full Auricrux communications stack"
          detail="Recovery no longer stops at a support inbox. FCA support now routes across phone, SMS, chat, Teams, conference, and training continuity so every escalation can move back into execution."
          statusLabel="Recovery posture"
          statusValue="Escalation lanes connected"
          items={auricruxCommsChannels}
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
          Customer help, escalation handling, and recovery guidance remain attached to the same tenant, project, permit/document, billing, and Auricrux state as the rest of FCA rather than appearing as a disconnected support tool.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Active support context</h2>
          <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
            <div><strong>Tenant:</strong> {portalTenant.name}</div>
            <div><strong>Project:</strong> {currentProject.name}</div>
            <div><strong>Project ID:</strong> {currentProject.id}</div>
            <div><strong>Current issue pattern:</strong> scope approval delay, permit submission dependency, mobilization onboarding, and invoice timing risk</div>
          </div>
          <div style={{ marginTop: 14 }}>
            <PublicCtaRow actions={portalNarrativeCtaSets.supportContext} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }} />
          </div>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Escalation lanes</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9, marginBottom: 0 }}>
            <li>Owner approval and revised scope dispute</li>
            <li>Permit or plan-set submission blocker</li>
            <li>RFI / submittal coordination delay</li>
            <li>Field onboarding or safety packet issue</li>
            <li>Billing / retainage follow-through escalation</li>
          </ul>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Primary blocker</div>
          <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0" }}>{auricruxRail.currentBlocker}</div>
          <div>{auricruxRail.blockerImpact}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Support owner</div>
          <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0" }}>{workspaceContext.nextActionOwner}</div>
          <div>Escalations stay tied to the same next-action chain as bids, files, and billing.</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Recovery priority</div>
          <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0" }}>Clear approval path</div>
          <div>Support is currently focused on removing the dependency that is holding permit release, startup packet issuance, and invoice readiness.</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Why this route matters</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          Support should not sit outside the operating shell. This route keeps customer help, continuity recovery,
          and escalation handling attached to the same tenant, project, file, audit, permit/document, and Auricrux state as the rest of FCA.
        </p>
      </div>
    </PortalShell>
  );
}
