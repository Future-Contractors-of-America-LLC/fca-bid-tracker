import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import WorkspaceQuickActions from "../../components/WorkspaceQuickActions";
import ExecutionCommandCenter from "../../components/ExecutionCommandCenter";
import CustomerPlanSummaryPanel from "../../components/CustomerPlanSummaryPanel";
import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import { portalMessages, routeStateOverlays } from "../../systemState";
import { platformDashboardCtaSets } from "../../websiteShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalEyebrowStyle, portalTokens } from "../../portalDesignTokens";

export default function PlatformDashboard() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session, applyPlanPreset, setProductAccess, setCommsAccess } = useCustomerSession();

  useEffect(() => {
    refreshSyncStamp("Live workspace dashboard active");
  }, [refreshSyncStamp]);

  return (
    <PortalShell
      title="Workspace"
      subtitle="Setup, Auricrux guidance, and your product lanes."
      activeHref="/portal/platform"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.platform}
      primaryHref="/portal/projects"
      primaryLabel="Open Projects"
      navDensity="full"
      showRouteOverlay={false}
    >
      <div style={{ ...portalCardStyle, marginBottom: 16, borderLeft: `4px solid ${portalTokens.primary}`, background: portalTokens.primarySoft }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 240px" }}>
            <div style={portalEyebrowStyle}>Auricrux</div>
            <div style={{ fontWeight: 700, marginTop: 6, lineHeight: 1.5, color: portalTokens.ink }}>
              {state.auricrux.currentBlocker}
            </div>
            <div style={{ color: portalTokens.body, fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>
              Next: {state.workspace.currentNextAction}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href="/portal/auricrux" style={portalButtonPrimary}>Ask Auricrux</a>
            <a href="/portal/admin" style={portalButtonSecondary}>Setup</a>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {platformDashboardCtaSets.operationalCards.map((item) => (
          <div key={item.href} style={portalCardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: 6, fontSize: "1rem" }}>{item.title}</h3>
            <p style={{ color: portalTokens.body, lineHeight: 1.5, marginTop: 0, marginBottom: 12, fontSize: 13 }}>
              {item.detail}
            </p>
            <a href={item.href} style={portalButtonPrimary}>{item.label}</a>
          </div>
        ))}
      </div>

      <WorkspaceQuickActions actions={platformDashboardCtaSets.quickActions} />

      <div style={{ display: "grid", gap: 12, marginTop: 16, marginBottom: 16 }}>
        <CustomerPlanSummaryPanel session={session} title="Account and plan" />
        <ExecutionCommandCenter
          session={session}
          state={state}
          applyPlanPreset={applyPlanPreset}
          setProductAccess={setProductAccess}
          setCommsAccess={setCommsAccess}
          refreshSyncStamp={refreshSyncStamp}
        />
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={{ ...portalEyebrowStyle, marginBottom: 10 }}>Recent updates</div>
        {portalMessages.slice(0, 3).map((message) => (
          <div key={message.subject} style={{ padding: "8px 0", borderBottom: `1px solid ${portalTokens.border}` }}>
            <strong style={{ fontSize: 14 }}>{message.from}</strong>
            <div style={{ color: portalTokens.body, fontSize: 14 }}>{message.subject}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <AutomationRecoveryFeed title="Activity log" detail="Recent workspace actions." />
        <CommercialContinuityFeed title="Commercial activity" detail="Billing and rollout events." />
      </div>
    </PortalShell>
  );
}
