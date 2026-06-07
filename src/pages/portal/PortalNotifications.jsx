import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { portalMessages, projectAuditEvents, routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalNotifications() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session, isAuthenticated } = useCustomerSession();

  useEffect(() => {
    refreshSyncStamp("Persisted notifications state active");
  }, [refreshSyncStamp]);

  const liveNotifications = [
    ...(isAuthenticated
      ? [
          {
            type: "session",
            badge: "Live workspace",
            title: "Authenticated workspace continuity active",
            detail: `${session.company} is now attached to ${state.project.id} through the shared FCA workspace shell.`,
            routeHint: "Continue through bids, files, messages, and billing without losing customer context.",
            time: "Live",
          },
        ]
      : []),
    ...portalMessages.map((message) => ({
      type: "message",
      badge: message.priority,
      title: message.subject,
      detail: `${message.from} · ${message.preview}`,
      routeHint: `${message.channel} · ${message.nextAction}`,
      time: message.time,
    })),
    ...projectAuditEvents.slice(0, 3).map((event) => ({
      type: "audit",
      badge: event.discipline || "Audit",
      title: event.action,
      detail: event.detail,
      routeHint: `${event.discipline || "Operational"} continuity recorded on ${state.project.id}.`,
      time: event.time,
    })),
  ];

  return (
    <PortalShell
      title="Live Notifications and Continuity Alerts"
      subtitle="Workspace alert surface showing approvals, permit/document dependencies, field-readiness cues, and Auricrux continuity signals in one customer-facing layer."
      activeHref="/portal/notifications"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.notifications}
      primaryHref="/portal/messages"
      primaryLabel="Open Messages"
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Notifications now read from live workspace continuity"
          detail="This route unifies customer messages, project audit cues, and Auricrux state so the customer can see what changed and what must happen next."
        />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Persisted notification state</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Source:</strong> {state.meta.backingSource}</div>
          <div><strong>Status:</strong> {state.meta.persistenceState}</div>
          <div><strong>Last sync:</strong> {state.meta.lastSyncedAt || "Pending initial sync"}</div>
          <div><strong>Authenticated customer:</strong> {state.meta.authenticatedCustomer || "Continuity shell visitor"}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Notification continuity</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Customer:</strong> {state.tenant.name}</div>
          <div><strong>Project spine:</strong> {state.project.id}</div>
          <div><strong>Current blocker:</strong> {state.auricrux.currentBlocker}</div>
          <div><strong>Recommended move:</strong> {state.auricrux.nextRecommendedAction}</div>
          <div><strong>Next action:</strong> {state.workspace.currentNextAction}</div>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Active notifications</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {liveNotifications.map((notification) => (
            <div key={`${notification.type}-${notification.time}-${notification.title}`} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 700 }}>{notification.title}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", background: "#dbeafe", borderRadius: 999, padding: "4px 8px" }}>
                      {notification.badge}
                    </div>
                  </div>
                  <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 6 }}>{notification.detail}</div>
                  <div style={{ color: "#0f172a", lineHeight: 1.6, marginTop: 8 }}>
                    <strong>Route hint:</strong> {notification.routeHint}
                  </div>
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
