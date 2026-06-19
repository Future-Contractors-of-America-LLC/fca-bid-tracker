const toolButtonStyle = (active) => ({
  border: active ? "1px solid #2563eb" : "1px solid #dbe3ef",
  background: active ? "#eff6ff" : "#fff",
  color: active ? "#1d4ed8" : "#334155",
  borderRadius: 10,
  padding: "8px 12px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 13,
});

const tools = [
  { id: "select", label: "Select", shortcut: "V" },
  { id: "pan", label: "Pan", shortcut: "H" },
  { id: "pen", label: "Pen", shortcut: "P" },
  { id: "cloud", label: "Cloud", shortcut: "C" },
  { id: "dimension", label: "Dimension", shortcut: "D" },
  { id: "callout", label: "Callout", shortcut: "K" },
  { id: "punch", label: "Punch", shortcut: "U" },
  { id: "count", label: "Count", shortcut: "N" },
];

export default function MarkupToolbar({ activeTool, onToolChange, onCreateTakeoff, onExport, onCompare, onCollab, busy = false }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {tools.map((tool) => (
        <button key={tool.id} type="button" style={toolButtonStyle(activeTool === tool.id)} onClick={() => onToolChange(tool.id)}>
          {tool.label}{tool.shortcut ? ` (${tool.shortcut})` : ""}
        </button>
      ))}
      <div style={{ width: 1, height: 28, background: "#e2e8f0", margin: "0 4px" }} />
      <button type="button" style={toolButtonStyle(false)} disabled={busy} onClick={onCreateTakeoff}>
        Takeoff
      </button>
      <button type="button" style={toolButtonStyle(false)} disabled={busy} onClick={onCompare}>
        Compare
      </button>
      <button type="button" style={toolButtonStyle(false)} disabled={busy} onClick={onCollab}>
        Live session
      </button>
      <button type="button" style={toolButtonStyle(false)} disabled={busy} onClick={onExport}>
        Export
      </button>
    </div>
  );
}
