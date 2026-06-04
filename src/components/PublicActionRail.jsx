import AuricruxPresenceLayer from "./AuricruxPresenceLayer";
import { filterVisibleActions } from "../ctaBehavior";
import { shellProductionActions, shellWorkspaceRoutes } from "../websiteShell";
import { ctaLightStyle, ctaStyleMap } from "../publicShellStyles";

const railStyle = {
  border: "1px solid #dbe3ef",
  background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
  borderRadius: 16,
  padding: 18,
  marginTop: 24,
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PublicActionRail({
  title = "Ready for the next step?",
  detail = "Close each public route with the same clear actions so customers always have a path into workspace access, platform visibility, or a guided walkthrough.",
}) {
  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname;
  const productionActions = filterVisibleActions(shellProductionActions, currentPath);
  const workspaceRoutes = filterVisibleActions(shellWorkspaceRoutes.slice(0, 4), currentPath);

  return (
    <div style={railStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Next actions</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h2>
          <div style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860 }}>{detail}</div>
        </div>
        {productionActions.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "stretch" }}>
            {productionActions.map((action) => (
              <a key={action.href} href={action.href} style={ctaStyleMap[action.variant] || ctaLightStyle}>
                {action.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <div style={{ marginBottom: 16 }}>
        <AuricruxPresenceLayer
          surfaceLabel="Auricrux embedded in public action rail"
          title="Auricrux now closes the public route instead of waiting in a separate assistant tab"
          detail="Every public route now hands off through an Auricrux-guided decision layer so conversion, workspace access, and platform review keep the same intelligence spine."
          primaryHref="/portal/platform"
          primaryLabel="Open Platform Dashboard"
          secondaryHref="/login"
          secondaryLabel="Open Login Portal"
          compact
        />
      </div>

      {workspaceRoutes.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 12 }}>
          {workspaceRoutes.map((route) => (
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
                boxSizing: "border-box",
                minWidth: 0,
              }}
            >
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>
                Next surface
              </div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{route.label}</div>
              <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, wordBreak: "break-word" }}>{route.href}</div>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
