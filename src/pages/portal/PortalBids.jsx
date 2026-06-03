import PortalShell from "../../components/PortalShell";
import { portalBids } from "../../portalShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalBids() {
  return (
    <PortalShell
      title="Bid Pipeline and Approval Readiness"
      subtitle="Bid-facing shell for demo and sales conversations, tied directly to project conversion and customer action."
      activeHref="/portal/bids"
      primaryHref="/bid-entry/"
      primaryLabel="Open Bid Entry"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {portalBids.map((bid) => (
          <div key={bid.package} style={cardStyle}>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>{bid.status}</div>
            <h3 style={{ marginTop: 0, marginBottom: 10 }}>{bid.package}</h3>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>{bid.value}</div>
            <div style={{ color: "#4b5563", lineHeight: 1.6 }}>{bid.blocker}</div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Sales Narrative</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          This shell lets FCA show that bidding is not a disconnected tool. Auricrux can surface the approval queue, explain blockers,
          and move directly from estimate visibility into project execution, communications, and onboarding.
        </p>
      </div>
    </PortalShell>
  );
}
