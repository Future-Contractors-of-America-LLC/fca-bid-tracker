import PortalShell from "../../components/PortalShell";
import { portalBilling } from "../../portalShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalBilling() {
  return (
    <PortalShell
      title="Billing and Revenue Follow-Through"
      subtitle="Account shell showing that FCA can carry approved work into invoicing, review, and customer financial visibility."
      activeHref="/portal/billing"
      primaryHref="/portal/academy"
      primaryLabel="Open Academy Continuity"
    >
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
          This route closes the sales story. FCA is not only for front-end capture. It shows how the same customer workspace can support
          execution, communication, invoicing, and long-term account continuity with Auricrux visible throughout.
        </p>
      </div>
    </PortalShell>
  );
}
