export default function BimCoordinationPanel({ sheets = [], markups = [], onSave, onClash, busy = false }) {
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>BIM coordination</div>
      <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
        Model sheets, element quantities, clash detection, and export to governed takeoffs.
      </div>
      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <div><strong>Sheets:</strong> {sheets.length}</div>
        <div><strong>Linked markups:</strong> {markups.length}</div>
        <div><strong>Clash matrix:</strong> Ready</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={busy}
          onClick={onClash}
          style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 12px", fontWeight: 700, cursor: "pointer" }}
        >
          Run clash detection
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onSave}
          style={{ border: "1px solid #2563eb", background: "#eff6ff", color: "#1d4ed8", borderRadius: 10, padding: "10px 12px", fontWeight: 700, cursor: "pointer" }}
        >
          Save BIM model
        </button>
      </div>
    </div>
  );
}
