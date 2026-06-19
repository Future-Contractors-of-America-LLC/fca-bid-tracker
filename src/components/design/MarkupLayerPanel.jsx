export default function MarkupLayerPanel({ layers = [], onToggle }) {
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Markup layers</div>
      <div style={{ display: "grid", gap: 8 }}>
        {layers.map((layer) => (
          <label key={layer.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={layer.visible !== false} onChange={() => onToggle?.(layer.id)} />
            <span style={{ width: 10, height: 10, borderRadius: 999, background: layer.color || "#2563eb", display: "inline-block" }} />
            <span style={{ fontWeight: 600, color: "#0f172a" }}>{layer.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
