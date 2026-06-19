export default function DesignPropertiesPanel({ activeSheet, selectedMarkup, intelligence }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Sheet properties</div>
        <div style={{ color: "#475569", lineHeight: 1.7 }}>
          <div><strong>ID:</strong> {activeSheet?.sheetId || "—"}</div>
          <div><strong>Discipline:</strong> {activeSheet?.discipline || "—"}</div>
          <div><strong>Scale:</strong> {activeSheet?.scale || "—"}</div>
          <div><strong>Size:</strong> {activeSheet?.width || "—"} × {activeSheet?.height || "—"}</div>
        </div>
      </div>
      {selectedMarkup ? (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Selected markup</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>
            <div><strong>Type:</strong> {selectedMarkup.type}</div>
            <div><strong>Status:</strong> {selectedMarkup.status}</div>
            <div><strong>Label:</strong> {selectedMarkup.label || "—"}</div>
          </div>
        </div>
      ) : null}
      {intelligence?.recommendations?.length ? (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Auricrux recommendations</div>
          <div style={{ display: "grid", gap: 8 }}>
            {intelligence.recommendations.map((item) => (
              <div key={item.action} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: item.priority === "high" ? "#b91c1c" : "#1d4ed8", textTransform: "uppercase" }}>{item.priority}</div>
                <div style={{ marginTop: 4, color: "#334155", lineHeight: 1.6 }}>{item.summary}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
