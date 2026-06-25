import { useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import AuricruxCommsPanel from "../../components/AuricruxCommsPanel";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { fetchAuricruxActions } from "../../api/auricruxActionsClient";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import PortalApiStatusBanner from "../../components/portal/PortalApiStatusBanner";
import { auricruxCommsChannels, auricruxRail, routeStateOverlays } from "../../systemState";
import { openAuricruxAssistant } from "../../auricruxAssistant";
import { auricruxPersona } from "../../config/auricruxPersona";
import { portalButtonPrimary, portalCardStyle, portalEyebrowStyle, portalTokens } from "../../portalDesignTokens";

const actionRouteMap = {
  Project: "/portal/projects",
  Bid: "/portal/bids",
  Invoice: "/portal/billing",
  File: "/portal/files",
  Message: "/portal/messages",
  Academy: "/portal/academy",
  Support: "/portal/support",
};

function normalizeGuidedAction(action) {
  if (typeof action === "string") {
    return {
      key: action,
      title: action,
      detail: "Suggested from your current workspace.",
      href: "/portal/projects",
      label: "Open projects",
    };
  }

  const href = actionRouteMap[action.targetObjectType] || "/portal/platform";
  const modeLabel = action.mode === "recommend" ? "Recommended" : action.mode === "validate" ? "Review" : "Action";

  return {
    key: `${action.mode}-${action.targetObjectType}-${action.targetObjectId}`,
    title: action.rationale,
    detail: `${modeLabel} · ${action.targetObjectType}${action.targetObjectId ? ` ${action.targetObjectId}` : ""}`,
    href,
    label: `Open ${action.targetObjectType.toLowerCase()}`,
  };
}

export default function PortalAuricrux() {
  const { session } = useCustomerSession();
  const { state } = useWorkspaceState();
  const actionsLoad = usePortalApiLoad(() => fetchAuricruxActions(), []);
  const liveActions = actionsLoad.data?.items || [];

  const guidedActions = useMemo(
    () => liveActions.map(normalizeGuidedAction),
    [liveActions],
  );

  const blocker = state.auricrux?.currentBlocker || auricruxRail.currentBlocker;
  const nextAction = state.workspace?.currentNextAction || auricruxRail.nextRecommendedAction;

  const usingLiveActions = actionsLoad.isLive && liveActions.length > 0;

  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const commItems = auricruxCommsChannels.map((item) => ({
    ...item,
    value: `${item.value}${enabledComms[item.label.toLowerCase()] === false ? " · Not enabled" : ""}`,
    href: `/portal/messages#${item.label.toLowerCase()}`,
    ctaLabel: `Open ${item.label}`,
  }));

  return (
    <PortalShell
      title="Auricrux"
      subtitle="Your guide for what to do next — blockers, priorities, and the right product to open."
      activeHref="/portal/auricrux"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.auricrux}
      primaryHref="/portal/platform"
      primaryLabel="Back to workspace"
    >
      <PortalApiStatusBanner
        status={actionsLoad.status}
        error={actionsLoad.error}
        onRetry={actionsLoad.reload}
        label="Auricrux actions"
      />
      <div style={{ ...portalCardStyle, marginBottom: 16, borderLeft: `4px solid ${usingLiveActions ? "#16a34a" : "#d97706"}`, background: usingLiveActions ? "#f0fdf4" : "#fffbeb" }}>
        <div style={{ ...portalEyebrowStyle, color: usingLiveActions ? "#166534" : "#92400e" }}>
          {usingLiveActions ? "Live recommendations" : "Guidance mode"}
        </div>
        <p style={{ color: portalTokens.body, fontSize: 14, lineHeight: 1.55, margin: "8px 0 0" }}>
          {usingLiveActions
            ? "Actions below are loaded from your workspace API."
            : "Live actions will appear here once the workspace API responds. Use Ask Auricrux in the header for immediate help."}
        </p>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16, borderLeft: `4px solid #d4a32a`, background: "linear-gradient(135deg, #fffbeb 0%, #fff 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 280px" }}>
            <div style={{ ...portalEyebrowStyle, color: "#92400e" }}>{auricruxPersona.title}</div>
            <p style={{ color: portalTokens.body, lineHeight: 1.6, margin: "8px 0 0", fontSize: 14 }}>
              {auricruxPersona.intro}
            </p>
          </div>
          <button type="button" onClick={() => openAuricruxAssistant()} style={{ ...portalButtonPrimary, border: "none", cursor: "pointer", background: "#7c5313" }}>
            Chat with Auricrux
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={portalCardStyle}>
          <div style={portalEyebrowStyle}>What is blocked</div>
          <div style={{ fontWeight: 700, marginTop: 8, lineHeight: 1.45, color: portalTokens.ink }}>{blocker}</div>
        </div>
        <div style={portalCardStyle}>
          <div style={portalEyebrowStyle}>Do this next</div>
          <div style={{ fontWeight: 700, marginTop: 8, lineHeight: 1.45, color: portalTokens.ink }}>{nextAction}</div>
        </div>
        <div style={portalCardStyle}>
          <div style={portalEyebrowStyle}>Active project</div>
          <div style={{ fontWeight: 700, marginTop: 8, lineHeight: 1.45, color: portalTokens.ink }}>
            {state.project?.id || "—"} · {state.project?.stage || "—"}
          </div>
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16, borderLeft: `4px solid ${portalTokens.primary}` }}>
        <div style={portalEyebrowStyle}>Suggested actions</div>
        <p style={{ color: portalTokens.body, fontSize: 14, lineHeight: 1.55, marginTop: 8, marginBottom: 14 }}>
          Tap a card to open the lane Auricrux recommends. You can also use the top-nav <strong>Ask Auricrux</strong> button anytime.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          {guidedActions.length === 0 ? (
            <p style={{ color: portalTokens.muted, margin: 0 }}>
              No live recommendations yet. Open Ask Auricrux to get the next move for your workspace.
            </p>
          ) : null}
          {guidedActions.slice(0, 8).map((action) => (
            <article key={action.key} style={{ border: `1px solid ${portalTokens.border}`, borderRadius: 12, padding: 14, background: portalTokens.panel }}>
              <div style={{ fontWeight: 700, marginBottom: 6, lineHeight: 1.45 }}>{action.title}</div>
              <div style={{ color: portalTokens.muted, fontSize: 12, marginBottom: 10 }}>{action.detail}</div>
              <a href={action.href} style={{ ...portalButtonPrimary, display: "inline-block", fontSize: 13, padding: "8px 12px" }}>
                {action.label}
              </a>
            </article>
          ))}
        </div>
      </div>

      <AuricruxCommsPanel
        title="Messages and channels"
        detail="Reach your team by chat, SMS, phone, email, Teams, conference, or lecture — from one place."
        statusLabel="Channels"
        statusValue={`${Object.values(enabledComms).filter(Boolean).length} enabled`}
        items={commItems}
      />
    </PortalShell>
  );
}
