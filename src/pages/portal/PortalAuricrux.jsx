import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import AuricruxCommsPanel from "../../components/AuricruxCommsPanel";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { fetchAuricruxActions } from "../../api/auricruxActionsClient";
import { auricruxActions as fallbackActions, auricruxCommsChannels, auricruxRail, routeStateOverlays } from "../../systemState";
import { portalButtonPrimary, portalCardStyle, portalEyebrowStyle, portalTokens } from "../../portalDesignTokens";

export default function PortalAuricrux() {
  const { session } = useCustomerSession();
  const { state } = useWorkspaceState();
  const [liveActions, setLiveActions] = useState([]);
  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const commItems = auricruxCommsChannels.map((item) => ({
    ...item,
    value: `${item.value}${enabledComms[item.label.toLowerCase()] === false ? " · Pending" : ""}`,
    href: `/portal/messages#${item.label.toLowerCase()}`,
    ctaLabel: `Open ${item.label}`,
  }));

  useEffect(() => {
    fetchAuricruxActions()
      .then((payload) => {
        const items = (payload?.items || []).map(
          (item) => `${item.mode} · ${item.targetObjectType} ${item.targetObjectId}: ${item.rationale}`,
        );
        if (items.length) setLiveActions(items);
      })
      .catch(() => setLiveActions([]));
  }, []);

  const guidedActions = liveActions.length ? liveActions : fallbackActions;
  const blocker = state.auricrux?.currentBlocker || auricruxRail.currentBlocker;
  const nextAction = state.workspace?.currentNextAction || auricruxRail.nextRecommendedAction;

  return (
    <PortalShell
      title="Auricrux"
      subtitle="Guidance across approvals, documents, billing, and workforce readiness."
      activeHref="/portal/auricrux"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.platform}
      primaryHref="/portal/platform"
      primaryLabel="Open Dashboard"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={portalCardStyle}>
          <div style={portalEyebrowStyle}>Current blocker</div>
          <div style={{ fontWeight: 700, marginTop: 8, lineHeight: 1.45, color: portalTokens.ink }}>{blocker}</div>
        </div>
        <div style={portalCardStyle}>
          <div style={portalEyebrowStyle}>Recommended next</div>
          <div style={{ fontWeight: 700, marginTop: 8, lineHeight: 1.45, color: portalTokens.ink }}>{nextAction}</div>
        </div>
        <div style={portalCardStyle}>
          <div style={portalEyebrowStyle}>Project</div>
          <div style={{ fontWeight: 700, marginTop: 8, lineHeight: 1.45, color: portalTokens.ink }}>
            {state.project?.id || "—"} · {state.project?.stage || "—"}
          </div>
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16, borderLeft: `4px solid ${portalTokens.primary}` }}>
        <div style={portalEyebrowStyle}>Guided actions</div>
        <ul style={{ paddingLeft: 20, lineHeight: 1.75, marginBottom: 0, marginTop: 10, color: portalTokens.body }}>
          {guidedActions.slice(0, 8).map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <a href="/portal/messages" style={portalButtonPrimary}>Open Messages</a>
          <a href="/portal/projects" style={{ ...portalButtonPrimary, background: portalTokens.panel, color: portalTokens.primaryInk, border: `1px solid #bfdbfe` }}>
            Open Projects
          </a>
        </div>
      </div>

      <AuricruxCommsPanel
        title="Communications"
        detail="Chat, SMS, phone, email, Teams, conference, and lecture — from one guidance layer."
        statusLabel="Channels"
        statusValue={`${Object.values(enabledComms).filter(Boolean).length} enabled`}
        items={commItems}
      />
    </PortalShell>
  );
}
