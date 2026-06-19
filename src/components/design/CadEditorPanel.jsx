export default function CadEditorPanel({ activeSheet, onSave, busy = false }) {
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>CAD editor</div>
      <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
        Layer table, xref management, discipline packages, and CAD-to-estimate continuity for {activeSheet?.name || "active sheet"}.
      </div>
      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        {["0", "A-WALL", "E-POWER", "E-LITE"].map((layer) => (
          <label key={layer} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" defaultChecked />
            <span>{layer}</span>
          </label>
        ))}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={onSave}
        style={{ border: "1px solid #2563eb", background: "#eff6ff", color: "#1d4ed8", borderRadius: 10, padding: "10px 12px", fontWeight: 700, cursor: "pointer" }}
      >
        Save CAD document
      </button>
    </div>
  );
}
