const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 14,
  padding: 18,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
  marginBottom: 24,
};

function resolveStatusTone(status) {
  switch (status) {
    case "ready":
      return { label: "Protected backend truth active", color: "#0f766e" };
    case "seeded":
      return { label: "Seeded continuity mode", color: "#b45309" };
    case "forbidden":
      return { label: "Entitlement blocked", color: "#b91c1c" };
    case "unauthorized":
      return { label: "Auth required", color: "#b91c1c" };
    case "loading":
      return { label: "Loading protected data", color: "#1d4ed8" };
    case "unavailable":
      return { label: "Protected backend unavailable", color: "#7c3aed" };
    default:
      return { label: "Protected data pending", color: "#475569" };
  }
}

export default function ProtectedProductDataPanel({
  title,
  detail,
  state,
  session,
  items = [],
}) {
  const tone = resolveStatusTone(state.status);

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Protected product data</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h2>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{detail}</div>
        </div>
        <div style={{ color: tone.color, fontWeight: 800 }}>{tone.label}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: items.length ? 16 : 0 }}>
        <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Auth mode</div>
          <div style={{ fontWeight: 700 }}>{session?.authMode || "none"}</div>
        </div>
        <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Data source</div>
          <div style={{ fontWeight: 700 }}>{state.source}</div>
        </div>
        <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Customer workspace</div>
          <div style={{ fontWeight: 700 }}>{session?.workspaceLabel || "No active workspace"}</div>
        </div>
      </div>

      {items.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {items.map((item) => (
            <div key={item.label} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
              <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: item.detail ? 6 : 0 }}>{item.value}</div>
              {item.detail ? <div style={{ color: "#475569", lineHeight: 1.6 }}>{item.detail}</div> : null}
            </div>
          ))}
        </div>
      ) : null}

      {state.error ? (
        <div style={{ marginTop: 16, color: state.status === "seeded" || state.status === "unavailable" ? "#8a6a14" : "#b91c1c", fontWeight: 700 }}>
          {state.error}
        </div>
      ) : null}
    </div>
  );
}
