import AuricruxActionHint from "./AuricruxActionHint";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
  marginBottom: 24,
};

const actionStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
};

export default function WorkspaceQuickActions({ actions = [] }) {
  if (!actions.length) return null;

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Quick Actions</div>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Familiar dashboard shortcuts</h3>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 860 }}>
            This action row keeps the shell feeling like a modern customer workspace: clear shortcuts,
            obvious next steps, and direct movement into the most important operational surfaces.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        {actions.map((action) => (
          <div key={action.label} style={{ minWidth: 0, maxWidth: 280 }}>
            <a
              href={action.href}
              style={{
                ...actionStyle,
                background: action.variant === "secondary" ? "#e5e7eb" : action.variant === "light" ? "#f8fafc" : actionStyle.background,
                color: action.variant === "primary" ? "#fff" : "#111827",
                border: action.variant === "light" ? "1px solid #cbd5e1" : "none",
              }}
            >
              {action.label}
            </a>
            <AuricruxActionHint action={action} />
          </div>
        ))}
      </div>
    </div>
  );
}
