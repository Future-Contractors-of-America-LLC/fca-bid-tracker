import PortalShell from "../../components/PortalShell";
import PublicCtaRow from "../../components/PublicCtaRow";
import SystemStateSummary from "../../components/SystemStateSummary";
import { publicBodyCtaSets } from "../../websiteShell";
import { auricruxRail, currentProject, portalMessages, portalTenant, projectAuditEvents, routeStateOverlays, workspaceContext } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalNotifications() {
  const liveNotifications = [
    ...portalMessages.map((message) => ({
      type: "message",
      title: message.subject,
      detail: `${message.from} · ${message.preview}`,
      time: message.time,
    })),
    ...projectAuditEvents.slice(0, 2).map((event) => ({
      type: "audit",
      title: event.action,
      detail: event.detail,
      time: event.time,
    })),
  ];

  return (
    <PortalShell
      title="Live Notifications and Continuity Alerts"
      subtitle="Workspace notification surface showing message activity, audit cues, and Auricrux continuity signals in one live customer-facing layer."
      activeHref="/portal/notifications"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.notifications}
      primaryHref="/portal/messages"
      primaryLabel="Open Messages"
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={portalTenant}
          project={currentProject}
          workspace={workspaceContext}
          auricrux={auricruxRail}
          title="Notifications now read from live workspace continuity"
          detail="This route unifies customer messages, project audit cues, and Auricrux state so the customer can see what changed and what must happen next."
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <PublicCtaRow actions={publicBodyCtaSets.portalCoordination} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Notification continuity</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Customer:</strong> {portalTenant.name}</div>
          <div><strong>Project spine:</strong> {currentProject.id}</div>
          <div><strong>Current blocker:</strong> {auricruxRail.currentBlocker}</div>
          <div><strong>Recommended move:</strong> {auricruxRail.nextRecommendedAction}</div>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Active notifications</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {liveNotifications.map((notification) => (
            <div key={`${notification.type}-${notification.time}-${notification.title}`} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{notification.title}</div>
                  <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 4 }}>{notification.detail}</div>
                </div>
                <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700 }}>{notification.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
