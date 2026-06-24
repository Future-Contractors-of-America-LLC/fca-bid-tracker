import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import PortalWorkspaceGuide from "../../components/PortalWorkspaceGuide";
import CustomerProductLaunchpad from "../../components/CustomerProductLaunchpad";
import WorkspaceQuickActions from "../../components/WorkspaceQuickActions";
import CustomerPlanSummaryPanel from "../../components/CustomerPlanSummaryPanel";
import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import { portalMessages, routeStateOverlays } from "../../systemState";
import { platformDashboardCtaSets } from "../../websiteShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import { openAuricruxAssistant } from "../../auricruxAssistant";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalEyebrowStyle, portalTokens } from "../../portalDesignTokens";

export default function PlatformDashboard() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session } = useCustomerSession();

  useEffect(() => {
    refreshSyncStamp("Live workspace dashboard active");
  }, [refreshSyncStamp]);

  return (
    <PortalShell
      title="Workspace"
      subtitle="Your products, Auricrux guidance, and day-to-day lanes in one place."
      activeHref="/portal/platform"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.platform}
      primaryHref="/portal/auricrux"
      primaryLabel="Ask Auricrux"
      navDensity="full"
      showRouteOverlay={false}
    >
      <PortalSliceAuricrux
        title="Auricrux Workspace Intelligence"
        targetObjectId={state?.project?.id || session?.email || "WORKSPACE"}
        sourceRoute="/portal/platform"
        rationale="Workspace dashboard must keep every product lane visible and actionable under Auricrux guidance."
        nextAction={state.workspace?.currentNextAction || "Open the next lifecycle lane."}
        actionHref="/portal/auricrux"
        actionLabel="Ask Auricrux"
        liveRecommend
      />
      <CustomerProductLaunchpad session={session} />

      <div style={{ ...portalCardStyle, marginBottom: 16, borderLeft: `4px solid #d4a32a`, background: "linear-gradient(135deg, #fffbeb 0%, #fff 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 240px" }}>
            <div style={{ ...portalEyebrowStyle, color: "#92400e" }}>Auricrux · your guide</div>
            <div style={{ fontWeight: 700, marginTop: 6, lineHeight: 1.5, color: portalTokens.ink }}>
              {state.auricrux.currentBlocker}
            </div>
            <div style={{ color: portalTokens.body, fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>
              Next step: {state.workspace.currentNextAction}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={() => openAuricruxAssistant()} style={{ ...portalButtonPrimary, border: "none", cursor: "pointer" }}>
              Chat with Auricrux
            </button>
            <a href="/portal/auricrux" style={portalButtonSecondary}>Guidance page</a>
          </div>
        </div>
      </div>

      <PortalWorkspaceGuide compact />

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
