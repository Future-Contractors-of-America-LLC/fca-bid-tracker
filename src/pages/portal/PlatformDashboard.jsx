import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import WorkspaceQuickActions from "../../components/WorkspaceQuickActions";
import ExecutionCommandCenter from "../../components/ExecutionCommandCenter";
import ProductAccessStatusPanel from "../../components/ProductAccessStatusPanel";
import CustomerPlanSummaryPanel from "../../components/CustomerPlanSummaryPanel";
import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import { portalMessages, portalMetrics, routeStateOverlays } from "../../systemState";
import { platformDashboardCtaSets } from "../../websiteShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import { portalButtonPrimary, portalCardStyle, portalEyebrowStyle, portalTokens } from "../../portalDesignTokens";

const metricStyle = {
  fontSize: "1.75rem",
  fontWeight: 700,
  margin: "4px 0",
  letterSpacing: "-0.02em",
};

export default function PlatformDashboard() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session, applyPlanPreset, setProductAccess, setCommsAccess } = useCustomerSession();

  useEffect(() => {
    refreshSyncStamp("Live workspace dashboard active");
  }, [refreshSyncStamp]);

  return (
    <PortalShell
      title="Dashboard"
      subtitle="Command center for projects, pipeline, field, finance, and training."
      activeHref="/portal/platform"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.platform}
      showRouteOverlay
      primaryHref="/portal/projects"
      primaryLabel="Open Projects"
      navDensity="full"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={portalCardStyle}>
          <div style={portalEyebrowStyle}>Next action</div>
          <div style={{ fontWeight: 700, marginTop: 8, lineHeight: 1.45, color: portalTokens.ink }}>
            {state.workspace.currentNextAction}
          </div>
        </div>
        <div style={portalCardStyle}>
          <div style={portalEyebrowStyle}>Blocker</div>
          <div style={{ fontWeight: 700, marginTop: 8, lineHeight: 1.45, color: portalTokens.ink }}>
            {state.auricrux.currentBlocker}
          </div>
        </div>
        {portalMetrics.slice(0, 2).map((metric) => (
          <div key={metric.label} style={portalCardStyle}>
            <div style={portalEyebrowStyle}>{metric.label}</div>
            <div style={metricStyle}>{metric.value}</div>
            <div style={{ fontSize: 13, color: portalTokens.muted }}>{metric.detail}</div>
          </div>
        ))}
      </div>

      <WorkspaceQuickActions actions={platformDashboardCtaSets.quickActions} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        {platformDashboardCtaSets.operationalCards.map((item) => (
          <div key={item.href} style={portalCardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: "1.0625rem" }}>{item.title}</h3>
            <p style={{ color: portalTokens.body, lineHeight: 1.55, marginTop: 0, marginBottom: 14, fontSize: 14 }}>
              {item.detail}
            </p>
            <a href={item.href} style={portalButtonPrimary}>{item.label}</a>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 16, marginBottom: 20 }}>
        <ProductAccessStatusPanel session={session} stateMeta={state.meta} />
        <CustomerPlanSummaryPanel session={session} title="Plan and account" />
        <ExecutionCommandCenter
          session={session}
          state={state}
          applyPlanPreset={applyPlanPreset}
          setProductAccess={setProductAccess}
          setCommsAccess={setCommsAccess}
          refreshSyncStamp={refreshSyncStamp}
        />
      </div>

      <div style={{ ...portalCardStyle, marginTop: 16 }}>
        <div style={{ ...portalEyebrowStyle, marginBottom: 10 }}>Recent updates</div>
        {portalMessages.slice(0, 4).map((message) => (
          <div key={message.subject} style={{ padding: "10px 0", borderBottom: `1px solid ${portalTokens.border}` }}>
            <strong style={{ fontSize: 14 }}>{message.from}</strong>
            <div style={{ color: portalTokens.body, fontSize: 14 }}>{message.subject}</div>
            <div style={{ color: portalTokens.muted, fontSize: 12, marginTop: 4 }}>{message.time}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
        <AutomationRecoveryFeed title="Activity log" detail="Recent session and workspace actions across your account." />
        <CommercialContinuityFeed title="Commercial activity" detail="Recent billing, rollout, and plan changes." />
      </div>
    </PortalShell>
  );
}
