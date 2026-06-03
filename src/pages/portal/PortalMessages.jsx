import PortalShell from "../../components/PortalShell";
import { portalMessages } from "../../portalShell";
import { routeStateOverlays } from "../../workspaceState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const ctaStyle = {
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

export default function PortalMessages() {
  return (
    <PortalShell
      title="Messages and Communication Continuity"
      subtitle="Customer communication surface with Auricrux-guided follow-through inside the shared FCA workspace."
      activeHref="/portal/messages"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.messages}
      primaryHref="/portal/billing"
      primaryLabel="Continue to Billing"
    >
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Message stream</h2>
        {portalMessages.map((message) => (
          <div key={message.subject} style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ fontWeight: 700 }}>{message.from}</div>
            <div style={{ color: "#111827", marginTop: 4 }}>{message.subject}</div>
            <div style={{ color: "#4b5563", marginTop: 4 }}>{message.preview}</div>
            <div style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>{message.time}</div>
          </div>
        ))}
        <div>
          <a href="/portal/billing" style={ctaStyle}>Continue to Billing</a>
          <a href="/portal/academy" style={{ ...ctaStyle, background: "#e5e7eb", color: "#111827" }}>Open Academy</a>
          <a href="/contact" style={{ ...ctaStyle, background: "#f8fafc", color: "#111827", border: "1px solid #cbd5e1" }}>Request Founder Review</a>
        </div>
      </div>
    </PortalShell>
  );
}
