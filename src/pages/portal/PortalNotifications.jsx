import { useEffect, useMemo } from "react";
import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import AuditEventCard from "../../components/AuditEventCard";
import PortalApiStatusBanner from "../../components/portal/PortalApiStatusBanner";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useWorkflowAudit from "../../hooks/useWorkflowAudit";
import { fetchPortalMessages } from "../../api/portalClient";
import { PortalEmptyState } from "../../components/portal/PortalPrimitives";
import { routeStateOverlays } from "../../systemState";

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

export default function PortalNotifications() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session, isAuthenticated } = useCustomerSession();
  const projectId = state.project?.id || "";
  const { auditEvents, meta: auditMeta, refreshAudit } = useWorkflowAudit(projectId);
  const messagesLoad = usePortalApiLoad(() => fetchPortalMessages(), []);

  useEffect(() => {
    refreshSyncStamp("Live notifications feed active");
  }, [refreshSyncStamp]);

  const liveNotifications = useMemo(() => {
    const rows = [];
    if (isAuthenticated) {
      rows.push({
        type: "session",
        badge: "Live workspace",
        title: "Signed in to your workspace",
        detail: `${session.company} is connected${projectId ? ` to project ${projectId}` : ""}.`,
        routeHint: "Continue through bids, files, messages, and billing from one place.",
        time: "Live",
      });
    }

    (messagesLoad.data?.items || []).forEach((message) => {
      rows.push({
        type: "message",
        badge: message.channel || "Message",
        title: message.subject || "Portal message",
        detail: message.message || message.preview || "",
        routeHint: "Open Messages to reply or send follow-up.",
        time: message.sentAt || message.createdAt || "Recent",
      });
    });

    auditEvents.slice(0, 8).forEach((event) => {
      rows.push({
        type: "audit",
        badge: event.eventType || "Audit",
        title: event.action || "Workflow event",
        detail: event.detail || event.reason || "",
        routeHint: event.targetObjectId ? `Related to ${event.targetObjectId}` : "Open audit for full trail.",
        time: event.time || event.at || "Recent",
      });
    });

    return rows;
  }, [auditEvents, isAuthenticated, messagesLoad.data?.items, projectId, session?.company]);

  const loadStatus =
    messagesLoad.status === "loading" || auditMeta.backingSource === "loading"
      ? "loading"
      : messagesLoad.status === "error" || auditMeta.backingSource === "api-error"
        ? "error"
        : "ready";

  const loadError = messagesLoad.error || auditMeta.loadError || "";

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
      <PortalSliceAuricrux
        title="Auricrux Notification Intelligence"
        targetObjectId={projectId || session?.email || "NOTIFY"}
        sourceRoute="/portal/notifications"
        rationale="Route approvals and field alerts to the right owner on each job."
        nextAction="Act on the highest-priority notification in the feed."
        actionHref="/portal/audit"
        actionLabel="Open audit"
      />

      <PortalApiStatusBanner
        status={loadStatus}
        error={loadError}
        label="notifications"
        onRetry={() => {
          messagesLoad.reload();
          refreshAudit();
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Active notifications</h2>
          {liveNotifications.length ? (
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
          ) : loadStatus === "ready" ? (
            <PortalEmptyState
              title="No notifications yet"
              detail="Messages and workflow audit events will appear here as your workspace activity grows."
              primaryHref="/portal/messages"
              primaryLabel="Open Messages"
            />
          ) : null}
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Workflow audit cues</h2>
          {auditEvents.length ? (
            <div style={{ display: "grid", gap: 12 }}>
              {auditEvents.slice(0, 3).map((event) => (
                <AuditEventCard key={`${event.time}-${event.action}`} event={event} compact />
              ))}
            </div>
          ) : loadStatus === "ready" ? (
            <PortalEmptyState
              title="No audit events yet"
              detail="Workflow mutations and approvals will show up here once jobs are active."
              primaryHref="/portal/audit"
              primaryLabel="Open audit"
            />
          ) : null}
        </div>
      </div>
    </PortalShell>
  );
}
