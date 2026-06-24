import { formatLeadDate } from "../../utils/leadsModel";

export default function LeadAuditTrail({ events = [] }) {
  const items = (events || []).slice(0, 8);

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, background: "#fff" }}>
      <strong style={{ color: "#0f172a" }}>Governance trail</strong>
      {!items.length ? (
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 10 }}>No audit events recorded for this lead yet.</p>
      ) : (
        <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "#475569", lineHeight: 1.7, fontSize: 13 }}>
          {items.map((event) => (
            <li key={event.auditEventId || `${event.eventType}-${event.createdAt}`}>
              <strong>{event.eventType || "lead-event"}</strong>
              {event.summary ? ` — ${event.summary}` : ""}
              <div style={{ color: "#94a3b8" }}>{formatLeadDate(event.createdAt || event.timestamp)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
