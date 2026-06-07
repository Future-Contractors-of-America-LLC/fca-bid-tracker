import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import WorkspaceQuickActions from "../../components/WorkspaceQuickActions";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import PublicCtaRow from "../../components/PublicCtaRow";
import PublicOperationsStrip from "../../components/PublicOperationsStrip";
import ProductAccessStatusPanel from "../../components/ProductAccessStatusPanel";
import { auricruxActions, portalMessages, portalMetrics, portalProjects, routeStateOverlays } from "../../systemState";
import { portalEntryCtaSets, publicBodyCtaSets } from "../../websiteShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";

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

const portalEntryContinuityItems = [
  {
    label: "Workspace state",
    value: "Portal entry now bridges from public shell",
    detail: "The main portal route now makes the handoff from home, login, and platform pages explicit instead of assuming users already understand the system state.",
  },
  {
    label: "Operational focus",
    value: "Projects, files, billing, and academy stay linked",
    detail: "The overview route now reinforces that execution, communication, revenue, and training remain part of one workspace flow.",
  },
  {
    label: "Next action",
    value: "Review project flow or live dashboard",
    detail: "Portal entry keeps both execution routing and executive state review immediately accessible.",
  },
];

export default function PortalHome() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session } = useCustomerSession();

  useEffect(() => {
    refreshSyncStamp("Persisted portal overview state active");
  }, [refreshSyncStamp]);

  return (
    <PortalShell
      title="FCA Customer Workspace"
      subtitle="Live workspace shell with Auricrux-guided next actions, estimating visibility, document control, billing readiness, and academy continuity."
      activeHref="/portal"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.overview}
      primaryHref="/portal/projects"
      primaryLabel="Open Project Flow"
    >
      <ProductAccessStatusPanel session={session} />

      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Persisted overview state</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>Workspace overview now reads from the shared branded backbone</h2>
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

      <div style={{ marginBottom: 24 }}>
        <PublicOperationsStrip
          eyebrow="Portal entry strip"
          title="Portal overview now completes the public-to-workspace continuity loop"
          detail="The main portal route now uses the same continuity strip pattern as the public shell so entry, live operations, and rollout guidance read as one connected product experience."
          statusLabel="Workspace posture"
          statusValue="Portal continuity active"
          items={portalEntryContinuityItems}
          primaryHref="/portal/projects"
          primaryLabel="Open Project Flow"
          secondaryHref="/portal/platform"
          secondaryLabel="Open Platform Dashboard"
        />
      </div>

      <PublicCtaRow actions={publicBodyCtaSets.portalEntry} style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }} />

      <WorkspaceQuickActions actions={portalEntryCtaSets.quickActions} />

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
          <h2 style={{ marginTop: 0 }}>Auricrux next actions</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
            {auricruxActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Active context</h2>
          <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
            <div><strong>Tenant:</strong> {state.tenant.name}</div>
            <div><strong>Project:</strong> {state.project.name}</div>
            <div><strong>Project ID:</strong> {state.project.id}</div>
            <div><strong>Current stage:</strong> {state.project.stage}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Connected workspace flow</h2>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8 }}>
            {portalEntryCtaSets.connectedWorkspaceFlow.map((item) => (
              <li key={item.step}>
                {item.prefix} <a href={item.href}>{item.label}</a>
                {item.secondaryHref ? <> {item.suffix} <a href={item.secondaryHref}>{item.secondaryLabel}</a> {item.trailing}</> : ` ${item.suffix}`}
              </li>
            ))}
            <li>Use this portal overview to frame account status, project readiness, and Auricrux guidance.</li>
          </ol>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Project snapshot</h2>
          {portalProjects.map((project) => (
            <div key={project.id} style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700 }}>{project.id} · {project.customer}</div>
              <div style={{ color: "#4b5563", lineHeight: 1.6 }}>{project.stage} · Next: {project.nextAction}</div>
              <div style={{ color: "#475569", fontSize: 14, marginTop: 4 }}>Permit: {project.permitStatus}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Recent workspace signals</h2>
        {portalMessages.map((message) => (
          <div key={message.subject} style={{ marginBottom: 12 }}>
            <strong>{message.from}</strong>
            <div style={{ color: "#4b5563" }}>{message.subject}</div>
            <div style={{ color: "#475569", fontSize: 14, marginTop: 4 }}>{message.channel} · {message.nextAction}</div>
            <div style={{ color: "#6b7280", fontSize: 14 }}>{message.time}</div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
