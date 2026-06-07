import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import WorkspaceQuickActions from "../../components/WorkspaceQuickActions";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import PublicCtaRow from "../../components/PublicCtaRow";
import AutomationStatusCard from "../../components/AutomationStatusCard";
import ProductAccessStatusPanel from "../../components/ProductAccessStatusPanel";
import CustomerCommsLaunchpad from "../../components/CustomerCommsLaunchpad";
import CommercialReadinessPanel from "../../components/CommercialReadinessPanel";
import CustomerPlanSummaryPanel from "../../components/CustomerPlanSummaryPanel";
import ExecutionCommandCenter from "../../components/ExecutionCommandCenter";
import { auricruxActions, portalMessages, portalMetrics, routeStateOverlays } from "../../systemState";
import { platformDashboardCtaSets, publicBodyCtaSets } from "../../websiteShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import { ctaPrimaryStyle } from "../../publicShellStyles";

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
  const { session, applyPlanPreset, setProductAccess, setCommsAccess } = useCustomerSession();

  useEffect(() => {
    refreshSyncStamp("Live workspace dashboard active");
  }, [refreshSyncStamp]);

  return (
    <PortalShell
      title="FCA Platform Dashboard"
      subtitle="A customer-friendly view of estimating posture, project delivery, document control, billing readiness, training continuity, guided next steps, enabled communications lanes, active commercial packaging, and one-click workspace actions."
      activeHref="/portal/platform"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.platform}
      primaryHref="/portal/projects"
      primaryLabel="Open Projects"
    >
      <ProductAccessStatusPanel session={session} stateMeta={state.meta} />
      <CustomerCommsLaunchpad session={session} title="Launch customer-enabled communications lanes" />

      <div style={{ marginBottom: 24 }}>
        <CustomerPlanSummaryPanel session={session} title="Platform dashboard customer plan summary" />
      </div>

      <div style={{ marginBottom: 24 }}>
        <ExecutionCommandCenter
          session={session}
          state={state}
          applyPlanPreset={applyPlanPreset}
          setProductAccess={setProductAccess}
          setCommsAccess={setCommsAccess}
          refreshSyncStamp={refreshSyncStamp}
        />
      </div>

      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live workspace dashboard</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>Your platform summary is connected across bids, jobs, files, billing, training, customer communications, and commercial plan state</h2>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <FcaBrandMark compact />
            <AuricruxBrandMark compact />
          </div>
        </div>
        <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>
          <div><strong>Source:</strong> {state.meta.backingSource}</div>
          <div><strong>Workspace status:</strong> {state.meta.persistenceState}</div>
          <div><strong>Last refresh:</strong> {state.meta.lastSyncedAt || "Pending initial refresh"}</div>
        </div>
        <PublicCtaRow actions={publicBodyCtaSets.portalEntry} />
      </div>

      <WorkspaceQuickActions actions={platformDashboardCtaSets.quickActions} />

      <div style={{ marginTop: 24 }}>
        <CommercialReadinessPanel
          title="Revenue and rollout readiness"
          detail="This live dashboard now keeps approval, billing, communications access, rollout readiness, and executable customer controls connected so revenue-facing claims stay truthful to the authenticated workspace."
          primaryHref="/pricing"
          primaryLabel="Review Commercial Packaging"
          secondaryHref="/portal/billing"
          secondaryLabel="Open Billing"
          session={session}
        />
      </div>

      <div style={{ ...cardStyle, marginTop: 24, background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)", border: "1px solid #e5d3a1" }}>
        <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>What needs attention now</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, color: "#1f2937", lineHeight: 1.7 }}>
          <div>
            <strong>Recommended next step</strong>
            <div>{state.workspace.currentNextAction}</div>
          </div>
          <div>
            <strong>Current blocker</strong>
            <div>{state.auricrux.currentBlocker}</div>
          </div>
          <div>
            <strong>Training continuity</strong>
            <div>Two learners remain ready for assignment in the academy flow.</div>
          </div>
          <div>
            <strong>Best path forward</strong>
            <div>Move approval through bids, keep document dependencies visible, and carry the same context into billing, onboarding, customer-facing comms, and plan-backed expansion.</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 24 }}>
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
          <h2 style={{ marginTop: 0 }}>Workspace summary</h2>
          <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
            <div><strong>Customer:</strong> {state.tenant.name}</div>
            <div><strong>Project:</strong> {state.project.name}</div>
            <div><strong>Project ID:</strong> {state.project.id}</div>
            <div><strong>Current stage:</strong> {state.project.stage}</div>
          </div>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Auricrux guidance</h2>
          <div style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 12 }}>
            <div><strong>Recommendation:</strong> {state.auricrux.nextRecommendedAction}</div>
            <div><strong>Current blocker:</strong> {state.auricrux.currentBlocker}</div>
          </div>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginBottom: 0 }}>
            {auricruxActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      </div>

      <AutomationStatusCard
        title="System status"
        eyebrow="Platform reliability"
        detail="This dashboard shows a simple service-health summary so customers and teams can see that guided support is active without digging through internal logs."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 24 }}>
        {platformDashboardCtaSets.operationalCards.map((item) => (
          <div key={item.href} style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>{item.title}</h2>
            <p style={{ color: "#4b5563", lineHeight: 1.7 }}>{item.detail}</p>
            <a href={item.href} style={ctaPrimaryStyle}>{item.label}</a>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Recent updates</h2>
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
