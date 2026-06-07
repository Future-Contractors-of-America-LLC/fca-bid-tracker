const shellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  padding: 18,
  background: "linear-gradient(135deg, #eef6ff 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 14,
  background: "#fff",
};

const ctaStyle = {
  display: "inline-block",
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
};

export default function AuricruxCommsPanel({
  title = "Auricrux communications control plane",
  detail = "Auricrux is coordinating customer, project, training, and escalation communications across one operating spine.",
  statusLabel = "Comms posture",
  statusValue = "Unified channels active",
  items = [],
}) {
  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Auricrux Comms</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 900 }}>{detail}</div>
        </div>
        <div style={{ ...cardStyle, minWidth: 220 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>{statusLabel}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{statusValue}</div>
          <a href="/portal/messages" style={ctaStyle}>Open Comms Workspace</a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {items.map((item) => (
          <div key={item.label} style={cardStyle}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{item.value}</div>
            <div style={{ color: "#475569", lineHeight: 1.6, marginBottom: 10 }}>{item.detail}</div>
            <a href={item.href || "/portal/messages"} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{item.ctaLabel || "Open channel"}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
