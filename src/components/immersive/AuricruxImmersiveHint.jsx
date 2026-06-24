export default function AuricruxImmersiveHint({ actions = [], title = "Auricrux immersive guidance" }) {
  if (!actions.length) return null;

  return (
    <div
      style={{
        border: "1px solid #bfdbfe",
        background: "#eff6ff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <div style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: 8 }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 20, color: "#334155", lineHeight: 1.75 }}>
        {actions.slice(0, 3).map((action) => (
          <li key={action.id}>
            <a href={action.href} style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
              {action.title}
            </a>
            {action.detail ? ` — ${action.detail}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
