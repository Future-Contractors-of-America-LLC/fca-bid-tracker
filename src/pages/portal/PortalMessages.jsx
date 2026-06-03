import PortalShell from "../../components/PortalShell";
import ProjectFileAuditPanel from "../../components/ProjectFileAuditPanel";
import { auricruxActions, currentProject, portalFiles, portalMessages, projectAuditEvents } from "../../portalShell";

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
      title="Messages, Notifications, and Auricrux Follow-Through"
      subtitle="Communication shell so customer actions never disappear into a dead end and every stage has a visible update path."
      activeHref="/portal/messages"
      currentJourney="coordination"
      primaryHref="/portal/billing"
      primaryLabel="Open Billing"
    >
      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Communication continuity</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Every message should move the customer forward</h2>
        <p style={{ lineHeight: 1.7, color: "#334155", maxWidth: 860, marginBottom: 0 }}>
          This route works best when it clearly points to the next commercial or operational step. Messages should lead into billing readiness, training continuity, and production-rollout conversion instead of acting like a dead-end inbox.
        </p>
        <div>
          <a href="/portal/billing" style={ctaStyle}>Continue to Billing</a>
          <a href="/portal/academy" style={{ ...ctaStyle, background: "#e5e7eb", color: "#111827" }}>Open Academy</a>
          <a href="/contact" style={{ ...ctaStyle, background: "#f8fafc", color: "#111827", border: "1px solid #cbd5e1" }}>Request Demo</a>
        </div>
      </div>

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
          <h2 style={{ marginTop: 0 }}>Audit Context</h2>
          <div style={{ color: "#4b5563", lineHeight: 1.8, marginBottom: 12 }}>
            <div><strong>Project ID:</strong> {currentProject.id}</div>
            <div><strong>Audit state:</strong> {currentProject.auditLabel}</div>
          </div>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9 }}>
            {auricruxActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      </div>

      <ProjectFileAuditPanel project={currentProject} files={portalFiles} auditEvents={projectAuditEvents} />
    </PortalShell>
  );
}
