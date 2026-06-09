const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #dbe3ef",
  background: "#eff6ff",
  fontSize: 12,
  fontWeight: 700,
  color: "#1d4ed8",
};

export default function AuditEventCard({ event, compact = false }) {
  if (!event) return null;

  return (
    <div style={{ borderLeft: "3px solid #2563eb", paddingLeft: 12 }}>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{event.time}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
        {event.eventType ? <div style={badgeStyle}>{event.eventType}</div> : null}
        {event.actorType ? <div style={badgeStyle}>{event.actorType}</div> : null}
        {event.targetObjectType ? <div style={badgeStyle}>{event.targetObjectType}</div> : null}
        {event.discipline && compact ? <div style={badgeStyle}>{event.discipline}</div> : null}
      </div>
      <div style={{ fontWeight: 700, marginTop: 8 }}>{event.action}</div>
      {!compact && event.discipline ? <div style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 700, marginTop: 4 }}>{event.discipline}</div> : null}
      <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 4 }}>{event.detail}</div>
      {event.reason ? <div style={{ color: "#334155", lineHeight: 1.6, marginTop: 6 }}><strong>Reason:</strong> {event.reason}</div> : null}
    </div>
  );
}
