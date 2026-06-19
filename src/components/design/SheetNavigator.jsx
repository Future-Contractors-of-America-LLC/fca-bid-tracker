const sheetButtonStyle = (active) => ({
  width: "100%",
  textAlign: "left",
  border: active ? "1px solid #2563eb" : "1px solid #e2e8f0",
  background: active ? "#eff6ff" : "#fff",
  borderRadius: 10,
  padding: "10px 12px",
  cursor: "pointer",
});

export default function SheetNavigator({ sheets = [], activeSheetId, onSelect, fileFormat = "pdf" }) {
  const disciplines = [...new Set(sheets.map((sheet) => sheet.discipline || "General"))];

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Format</div>
        <div style={{ marginTop: 6, fontWeight: 700, color: "#0f172a" }}>{String(fileFormat || "pdf").toUpperCase()}</div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Disciplines</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          {disciplines.map((discipline) => (
            <span key={discipline} style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", background: "#eff6ff", borderRadius: 999, padding: "4px 10px" }}>
              {discipline}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Sheets</div>
        <div style={{ display: "grid", gap: 8, marginTop: 8, maxHeight: "52vh", overflowY: "auto" }}>
          {sheets.map((sheet) => (
            <button key={sheet.sheetId} type="button" style={sheetButtonStyle(activeSheetId === sheet.sheetId)} onClick={() => onSelect(sheet.sheetId)}>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>{sheet.name}</div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
                {sheet.sheetId} · {sheet.discipline} · {sheet.scale}
              </div>
            </button>
          ))}
          {!sheets.length ? <div style={{ color: "#64748b" }}>No sheets extracted yet.</div> : null}
        </div>
      </div>
    </div>
  );
}
