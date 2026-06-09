const panelStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const badgeStyle = (tone = "neutral") => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #dbe3ef",
  background:
    tone === "open"
      ? "#eff6ff"
      : tone === "review"
      ? "#fffbeb"
      : tone === "closed"
      ? "#ecfdf5"
      : "#f8fafc",
  fontSize: 12,
  fontWeight: 700,
  color:
    tone === "open"
      ? "#1d4ed8"
      : tone === "review"
      ? "#b45309"
      : tone === "closed"
      ? "#047857"
      : "#334155",
});

const buttonStyle = {
  border: "1px solid #2563eb",
  background: "#eff6ff",
  color: "#1d4ed8",
  borderRadius: 10,
  padding: "10px 12px",
  fontWeight: 700,
  cursor: "pointer",
};

function statusTone(status = "") {
  const value = status.toLowerCase();
  if (value.includes("open") || value.includes("awaiting")) return "open";
  if (value.includes("review") || value.includes("pending") || value.includes("billing")) return "review";
  if (value.includes("closed") || value.includes("complete")) return "closed";
  return "neutral";
}

export default function ContinuityObjectsPanel({
  project,
  items = [],
  onMarkBillingReady,
  onCompletePunch,
}) {
  return (
    <section style={panelStyle}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Continuity object starters</div>
      <h2 style={{ marginTop: 0, marginBottom: 10 }}>RFI, change, and QC records attached to {project.id}</h2>
      <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 16 }}>
        These are the first non-bid continuity objects connected to the same project spine, file references, audit posture, and billing follow-through as the rest of FCA Contractor Command.
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((item) => {
          const isChange = item.type === "Change Event" || item.type === "Change Order";
          const isQc = item.type === "QC / Punch";

          return (
            <div key={item.id} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.title}</div>
                  <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 4 }}>
                    {item.type} · {item.id}<br />
                    Project root: {item.projectId}{item.fileId ? ` · File link: ${item.fileId}` : " · File link pending"}
                  </div>
                </div>
                <div style={badgeStyle(statusTone(item.status))}>{item.status}</div>
              </div>
              <div style={{ color: "#0f172a", lineHeight: 1.7, marginTop: 10 }}>
                <div><strong>Owner:</strong> {item.owner}</div>
                <div><strong>Next action:</strong> {item.nextAction}</div>
                <div><strong>Audit impact:</strong> {item.auditImpact}</div>
                <div><strong>Billing linkage:</strong> {item.billingStatus || "Not linked"}</div>
              </div>

              {item.actionHistory?.length ? (
                <div style={{ marginTop: 10, color: "#475569", lineHeight: 1.6 }}>
                  <strong>Recent continuity actions:</strong>
                  <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                    {item.actionHistory.slice(0, 2).map((entry) => (
                      <li key={`${entry.at}-${entry.label}`}>{entry.label} · {entry.detail}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                {isChange ? (
                  <button type="button" style={buttonStyle} onClick={() => onMarkBillingReady?.(item.id)}>
                    Mark Billing Ready
                  </button>
                ) : null}
                {isQc ? (
                  <button type="button" style={buttonStyle} onClick={() => onCompletePunch?.(item.id)}>
                    Complete QC / Punch
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
