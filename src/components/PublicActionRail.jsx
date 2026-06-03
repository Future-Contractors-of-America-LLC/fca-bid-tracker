import { shellProductionActions, shellWorkspaceRoutes } from "../websiteShell";

const railStyle = {
  border: "1px solid #dbe3ef",
  background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
  borderRadius: 16,
  padding: 18,
  marginTop: 24,
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const ctaStyles = {
  primary: {
    textDecoration: "none",
    background: "#111827",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 700,
  },
  secondary: {
    textDecoration: "none",
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 700,
    border: "1px solid #bfdbfe",
  },
  light: {
    textDecoration: "none",
    background: "#f3f4f6",
    color: "#111827",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 700,
    border: "1px solid #d1d5db",
  },
};

export default function PublicActionRail({
  title = "Ready for the next step?",
  detail = "Close each public route with the same clear actions so customers always have a path into workspace access, platform visibility, or a guided walkthrough.",
}) {
  return (
    <div style={railStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Next actions</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h2>
          <div style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860 }}>{detail}</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {shellProductionActions.map((action) => (
            <a key={action.href} href={action.href} style={ctaStyles[action.variant]}>
              {action.label}
            </a>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {shellWorkspaceRoutes.slice(0, 4).map((route) => (
          <a
            key={route.href}
            href={route.href}
            style={{
              textDecoration: "none",
              border: "1px solid #dbe3ef",
              background: "#ffffff",
              borderRadius: 12,
              padding: 12,
              color: "#111827",
            }}
          >
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>
              Next surface
            </div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{route.label}</div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{route.href}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
