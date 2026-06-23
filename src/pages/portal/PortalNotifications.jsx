import { useEffect, useMemo } from "react";
import PortalShell from "../../components/PortalShell";
import AuditEventCard from "../../components/AuditEventCard";
import { PortalAlert } from "../../components/portal/PortalPrimitives";
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

const badgeStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#1d4ed8",
  background: "#dbeafe",
  borderRadius: 999,
  padding: "4px 8px",
};

function scopeAuditEventsToProject(events, project) {
  const projectId = project?.id || "PRJ-A117";
  return events.map((event) => ({
    ...event,
    detail: event.detail.replace(/PRJ-A117/g, projectId),
    reason: event.reason?.replace(/PRJ-A117/g, projectId),
  }));
}

export default function PortalNotifications() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session, isAuthenticated } = useCustomerSession();

  useEffect(() => {
    refreshSyncStamp("Persisted notifications state active");
  }, [refreshSyncStamp]);

  const accountSource = session?.accountSource || "workspace-shell";
  const launchReadiness = accountSource === "api"
    ? "Connected to your account"
    : accountSource === "local-fallback"
      ? "Demo workspace active"
      : "Workspace active";

  const scopedAuditEvents = useMemo(() => scopeAuditEventsToProject(projectAuditEvents, state.project), [state.project]);

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
          {
            type: "launch",
            badge: launchReadiness,
            title: "Launch account posture recorded",
            detail: `Account source is ${accountSource}. Notifications now keep launch-user truth visible alongside customer continuity.`,
            routeHint: accountSource === "api" ? "Production auth verified for this workspace." : "Keep launch checklist open until production auth and billing are fully live.",
            time: "Now",
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
  ];

  return (
    <PortalShell
      title="Notifications"
      subtitle="Approvals, document flags, and field signals in one feed."
      activeHref="/portal/notifications"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.notifications}
      primaryHref="/portal/messages"
      primaryLabel="Open Messages"
      workspaceState={state}
    >
      {accountSource === "local-fallback" ? (
        <PortalAlert tone="warning">
          Demo workspace active. Notification feed uses seeded continuity until production customer auth is configured.
        </PortalAlert>
      ) : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Active notifications</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {liveNotifications.map((notification) => (
              <div key={`${notification.type}-${notification.time}-${notification.title}`} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 700 }}>{notification.title}</div>
                      <div style={badgeStyle}>{notification.badge}</div>
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

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Canonical audit cues</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {scopedAuditEvents.slice(0, 3).map((event) => (
              <AuditEventCard key={`${event.time}-${event.action}`} event={event} compact />
            ))}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
