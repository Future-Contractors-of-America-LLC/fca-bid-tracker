import AuricruxBrandMark from "./AuricruxBrandMark";
import FcaBrandMark from "./FcaBrandMark";
import {
  shellCompatibilityRoutes,
  shellPrimaryNav,
  shellProductionActions,
  shellWorkspaceRoutes,
} from "../websiteShell";

const linkStyle = {
  textDecoration: "none",
  color: "#111827",
  fontWeight: 600,
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

export default function ShellFooter() {
  return (
    <div
      style={{
        marginTop: 40,
        padding: "24px 0 12px",
        borderTop: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div>
          <div style={{ display: "grid", gap: 14, marginBottom: 14 }}>
            <FcaBrandMark compact />
            <AuricruxBrandMark compact />
          </div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>
            FCA Conversion Path
          </div>
          <div style={{ color: "#4b5563", lineHeight: 1.7 }}>
            Use this shell to present the full contractor lifecycle: public entry,
            platform framing, workspace visibility, academy enablement, and
            Auricrux-guided next actions.
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Public Pages</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shellPrimaryNav.slice(1, 5).map((item) => (
              <a key={item.href} href={item.href} style={linkStyle}>{item.label}</a>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Canonical Workspace Routes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shellWorkspaceRoutes.map((item) => (
              <a key={item.href} href={item.href} style={linkStyle}>{item.label}</a>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Compatibility Routes</div>
          <div style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 12 }}>
            Legacy customer intake and status surfaces remain available for continuity,
            but the canonical FCA shell routes above should be used first.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shellCompatibilityRoutes.map((item) => (
              <a key={item.href} href={item.href} style={linkStyle}>{item.label}</a>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Production Next Step</div>
          <div style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 12 }}>
            Ready for a founder-led rollout conversation, pilot implementation, or production planning discussion.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {shellProductionActions.map((action) => (
              <a key={action.href} href={action.href} style={ctaStyles[action.variant]}>
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
