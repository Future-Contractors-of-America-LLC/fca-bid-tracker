const cardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 14,
  background: "#fff",
};

const linkStyle = {
  display: "inline-block",
  marginTop: 8,
  marginRight: 12,
  color: "#2563eb",
  fontWeight: 700,
  textDecoration: "none",
};

export default function AuricruxLeadsHint({ actions = [], loading = false }) {
  const top = actions[0];

  return (
    <div style={{ ...cardStyle, borderColor: "#bfdbfe", background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
      <strong style={{ color: "#1e3a8a" }}>Auricrux lead intelligence</strong>
      <p style={{ color: "#475569", lineHeight: 1.65, marginBottom: 8 }}>
        {loading
          ? "Loading governed lead next actions…"
          : top
            ? `${top.title}. ${top.detail}`
            : "Capture inbound demand, complete qualification checklists, and advance qualified leads into governed opportunities."}
      </p>
      {top?.href ? (
        <a href={top.href} style={linkStyle}>
          Open next lead action
        </a>
      ) : null}
    </div>
  );
}
