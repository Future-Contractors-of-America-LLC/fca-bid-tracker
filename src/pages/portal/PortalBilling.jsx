import PortalShell from "../../components/PortalShell";
import { portalBilling } from "../../portalShell";
import { auricruxRail, routeStateOverlays, workspaceContext } from "../../workspaceState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const continuityCardStyle = {
  ...cardStyle,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  border: "1px solid #e5d3a1",
};

const invoiceStyle = {
  display: "grid",
  gridTemplateColumns: "1.1fr 1fr 1fr 1fr",
  gap: 12,
  padding: "14px 0",
  borderBottom: "1px solid #e5e7eb",
  alignItems: "center",
};

const actionLinkStyle = {
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

export default function PortalBilling() {
  return (
    <PortalShell
      title="Billing and Account Continuity"
      subtitle="Billing surface tied to the same tenant, project, message, and Auricrux state as the rest of the FCA workspace."
      activeHref="/portal/billing"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.billing}
      primaryHref="/portal/admin"
      primaryLabel="Open Admin"
    >
      <div style={{ ...continuityCardStyle, marginBottom: 24 }}>
        <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Revenue continuity focus</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Billing now echoes the same approval and training state as the rest of the shell</h2>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Revenue blocker:</strong> {auricruxRail.currentBlocker}</div>
          <div><strong>Business impact:</strong> {auricruxRail.blockerImpact}</div>
          <div><strong>Commercial next step:</strong> Convert {workspaceContext.currentNextAction.toLowerCase()} into invoice follow-through.</div>
          <div><strong>Training continuity:</strong> Billing remains tied to learner assignment so onboarding and revenue stay visible together.</div>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Billing queue</h2>
        <div style={{ color: "#6b7280", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <div style={invoiceStyle}>
            <div>Invoice</div>
            <div>Customer</div>
            <div>Amount</div>
            <div>Status</div>
          </div>
        </div>
        {portalBilling.map((invoice) => (
          <div key={invoice.invoice} style={invoiceStyle}>
            <div style={{ fontWeight: 700 }}>{invoice.invoice}</div>
            <div>{invoice.customer}</div>
            <div>{invoice.amount}</div>
            <div>{invoice.status}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Why billing belongs in the same shell</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
            Billing is not just accounting. In FCA it stays tied to project progress, document readiness,
            customer communications, and training completion so commercial follow-through remains visible.
          </p>
          <div>
            <a href="/academy" style={actionLinkStyle}>Continue to Academy</a>
            <a href="/pricing" style={{ ...actionLinkStyle, background: "#e5e7eb", color: "#111827" }}>Open Pricing</a>
            <a href="/contact" style={{ ...actionLinkStyle, background: "#f8fafc", color: "#111827", border: "1px solid #cbd5e1" }}>Request Founder Review</a>
          </div>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Current billing posture</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9, marginBottom: 0 }}>
            <li>One invoice is awaiting internal review.</li>
            <li>One invoice has already been sent.</li>
            <li>One pilot-customer invoice is positioned for approval.</li>
            <li>Auricrux continues monitoring account follow-through.</li>
          </ul>
        </div>
      </div>
    </PortalShell>
  );
}
