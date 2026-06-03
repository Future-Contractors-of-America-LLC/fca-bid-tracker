import PortalShell from "../../components/PortalShell";
import { auricruxActions, portalMessages } from "../../portalShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalMessages() {
  return (
    <PortalShell
      title="Messages, Notifications, and Auricrux Follow-Through"
      subtitle="Communication shell so customer actions never disappear into a dead end and every stage has a visible update path."
      activeHref="/portal/messages"
      primaryHref="/portal/billing"
      primaryLabel="Open Billing"
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Recent Conversations</h2>
          {portalMessages.map((message) => (
            <div key={message.subject} style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong>{message.from}</strong>
                <span style={{ color: "#6b7280", fontSize: 14 }}>{message.time}</span>
              </div>
              <div style={{ marginTop: 6, fontWeight: 600 }}>{message.subject}</div>
              <div style={{ color: "#4b5563", marginTop: 4, lineHeight: 1.6 }}>{message.preview}</div>
            </div>
          ))}
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Auricrux Escalation Queue</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9 }}>
            {auricruxActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      </div>
    </PortalShell>
  );
}
