import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import WorkspaceQuickActions from "../../components/WorkspaceQuickActions";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import { auricruxActions, portalMessages, portalMetrics } from "../../portalShell";
import { routeStateOverlays } from "../../workspaceState";
import useWorkspaceState from "../../hooks/useWorkspaceState";

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

export default function PlatformDashboard() {
  const { state, refreshSyncStamp } = useWorkspaceState();

  useEffect(() => {
    refreshSyncStamp("Persisted platform dashboard state active");
  }, [refreshSyncStamp]);

  return (
    <PortalShell
      title="FCA Unified Platform Dashboard"
      subtitle="Single executive and customer shell view summarizing portal operations, academy continuity, support posture, admin readiness, and Auricrux-guided execution."
      activeHref="/portal/platform"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.platform}
      primaryHref="/portal/projects"
      primaryLabel="Open Project Flow"
    >
      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Persisted workspace state</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>Platform dashboard now reads from a branded operating source</h2>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <FcaBrandMark compact />
            <AuricruxBrandMark compact />
          </div>
        </div>
        <div style={{ color: "#334155", lineHeight: 1.7 }}>
          <div><strong>Source:</strong> {state.meta.backingSource}</div>
          <div><strong>Status:</strong> {state.meta.persistenceState}</div>
          <div><strong>Last sync:</strong> {state.meta.lastSyncedAt || "Pending initial sync"}</div>
        </div>
      </div>

      <WorkspaceQuickActions
        actions={[
          { label: "Portal Overview", href: "/portal", variant: "primary" },
          { label: "Open Support", href: "/portal/support", variant: "secondary" },
          { label: "Open Admin", href: "/portal/admin", variant: "secondary" },
          { label: "Open Academy", href: "/academy", variant: "light" },
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {portalMetrics.map((metric) => (
          <div key={metric.label} style={cardStyle}>
            <div style={{ color: "#6b7280" }}>{metric.label}</div>
            <div style={metricStyle}>{metric.value}</div>
            <div>{metric.detail}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Executive workspace summary</h2>
          <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
            <div><strong>Tenant:</strong> {state.tenant.name}</div>
            <div><strong>Project:</strong> {state.project.name}</div>
            <div><strong>Project ID:</strong> {state.project.id}</div>
            <div><strong>Current stage:</strong> {state.project.stage}</div>
          </div>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Auricrux next actions</h2>
          <div style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 12 }}>
            <div><strong>Recommendation:</strong> {state.auricrux.nextRecommendedAction}</div>
            <div><strong>Blocker:</strong> {state.auricrux.currentBlocker}</div>
          </div>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginBottom: 0 }}>
            {auricruxActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Portal operations</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.7 }}>
            Project visibility, files, messages, and billing continuity remain attached to one tenant and project spine.
          </p>
          <a href="/portal">Open portal overview</a>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Academy continuity</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.7 }}>
            Workforce readiness, learner assignment, and certification visibility now participate in the same shell state.
          </p>
          <a href="/academy">Open academy</a>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Support posture</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.7 }}>
            Escalations, continuity recovery, and customer help remain inside the operating shell rather than outside it.
          </p>
          <a href="/portal/support">Open support</a>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Admin readiness</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.7 }}>
            Tenant rollout, seat readiness, governance visibility, and production posture are summarized in one control surface.
          </p>
          <a href="/portal/admin">Open admin</a>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Recent platform signals</h2>
        {portalMessages.map((message) => (
          <div key={message.subject} style={{ marginBottom: 12 }}>
            <strong>{message.from}</strong>
            <div style={{ color: "#4b5563" }}>{message.subject}</div>
            <div style={{ color: "#6b7280", fontSize: 14 }}>{message.time}</div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
