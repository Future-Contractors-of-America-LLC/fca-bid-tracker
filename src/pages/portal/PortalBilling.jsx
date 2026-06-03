import PortalShell from "../../components/PortalShell";
import { portalBilling } from "../../portalShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const actionLinkStyle = {
  display: "inline-block",
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  marginRight: 10,
  marginTop: 12,
};

export default function PortalBilling() {
  return (
    <PortalShell
      title="Billing and Revenue Follow-Through"
      subtitle="Account shell showing that FCA can carry approved work into invoicing, review, and customer financial visibility."
      activeHref="/portal/billing"
      currentJourney="finance"
      primaryHref="/portal/academy"
      primaryLabel="Open Academy Continuity"
    >
      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Revenue to retention path</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Billing should lead into long-term customer continuity</h2>
        <p style={{ lineHeight: 1.7, color: "#334155", maxWidth: 860, marginBottom: 0 }}>
          This route should not be the end of the story. After approved work reaches billing readiness, the same customer should continue into training, enablement, and long-term account support through the academy and the broader FCA shell.
        </p>
        <div>
          <a href="/portal/academy" style={actionLinkStyle}>Continue to Academy</a>
          <a href="/pricing" style={{ ...actionLinkStyle, background: "#e5e7eb", color: "#111827" }}>Open Pricing</a>
          <a href="/contact" style={{ ...actionLinkStyle, background: "#f8fafc", color: "#111827", border: "1px solid #cbd5e1" }}>Request Demo</a>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {portalBilling.map((row) => (
          <div key={row.invoice} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>{row.invoice}</h3>
                <div style={{ color: "#4b5563", lineHeight: 1.6 }}>
                  Customer: {row.customer}<br />
                  Amount: {row.amount}
                </div>
              </div>
              <div style={{ alignSelf: "center", fontWeight: 700, color: "#2563eb" }}>{row.status}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Why this matters</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          This route closes the sales story. FCA is not only for front-end capture. It shows how the same customer workspace can support execution, communication, invoicing, and long-term account continuity with Auricrux visible throughout.
        </p>
      </div>
    </PortalShell>
  );
}
