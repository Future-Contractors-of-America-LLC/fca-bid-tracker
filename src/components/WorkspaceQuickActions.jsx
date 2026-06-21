import AuricruxActionHint from "./AuricruxActionHint";
import { filterVisibleActions } from "../ctaBehavior";

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
  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname;
  const visibleActions = filterVisibleActions(actions, currentPath);

  if (!visibleActions.length) return null;

  return (
    <div style={cardStyle}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 10, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Shortcuts
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {visibleActions.map((action) => (
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
