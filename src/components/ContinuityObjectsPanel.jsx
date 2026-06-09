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

function statusTone(status = "") {
  const value = status.toLowerCase();
  if (value.includes("open") || value.includes("awaiting")) return "open";
  if (value.includes("review") || value.includes("pending")) return "review";
  if (value.includes("closed") || value.includes("complete")) return "closed";
  return "neutral";
}

export default function ContinuityObjectsPanel({ project, items = [] }) {
  return (
    <section style={panelStyle}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Continuity object starters</div>
      <h2 style={{ marginTop: 0, marginBottom: 10 }}>RFI, change, and QC records attached to {project.id}</h2>
      <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 16 }}>
        These are the first non-bid continuity objects connected to the same project spine, file references, and audit posture as the rest of FCA Contractor Command.
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((item) => (
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
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
