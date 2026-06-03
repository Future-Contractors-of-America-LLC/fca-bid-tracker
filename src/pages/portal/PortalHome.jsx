import PortalShell from "../../components/PortalShell";
import { auricruxActions, portalMessages, portalMetrics, portalProjects } from "../../portalShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const metricStyle = {
  fontSize: 28,
  fontWeight: 700,
  margin: "6px 0",
};

export default function PortalHome() {
  return (
    <PortalShell
      title="FCA Customer Workspace"
      subtitle="Active pilot with Auricrux-guided next actions, communication visibility, billing readiness, and academy continuity."
      activeHref="/portal"
      primaryHref="/portal/projects"
      primaryLabel="Open Project Flow"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {portalMetrics.map((metric) => (
          <div key={metric.label} style={cardStyle}>
            <div style={{ color: "#6b7280" }}>{metric.label}</div>
            <div style={metricStyle}>{metric.value}</div>
            <div>{metric.detail}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Auricrux Next Actions</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
            {auricruxActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Message Preview</h2>
          {portalMessages.map((message) => (
            <div key={message.subject} style={{ marginBottom: 12 }}>
              <strong>{message.from}</strong>
              <div style={{ color: "#4b5563" }}>{message.subject}</div>
              <div style={{ color: "#6b7280", fontSize: 14 }}>{message.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Connected Demo Flow</h2>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Start on the public shell and enter through <a href="/login">demo login</a>.</li>
            <li>Use this portal overview to frame account status and Auricrux guidance.</li>
            <li>Open <a href="/portal/projects">Projects</a> to show execution continuity.</li>
            <li>Open <a href="/portal/files">Files</a> and <a href="/portal/messages">Messages</a> to show coordination.</li>
            <li>Finish in <a href="/portal/academy">Academy</a> to prove workforce and training follow-through.</li>
          </ol>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Project Snapshot</h2>
          {portalProjects.map((project) => (
            <div key={project.id} style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700 }}>{project.id} · {project.customer}</div>
              <div style={{ color: "#4b5563" }}>{project.stage} · Next: {project.nextAction}</div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
