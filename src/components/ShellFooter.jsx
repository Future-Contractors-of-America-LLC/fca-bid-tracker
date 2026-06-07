import AuricruxBrandMark from "./AuricruxBrandMark";
import AuricruxPresenceLayer from "./AuricruxPresenceLayer";
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
      <div style={{ marginBottom: 18 }}>
        <AuricruxPresenceLayer
          surfaceLabel="Auricrux embedded in footer"
          title="Auricrux now anchors the close of every shell layer"
          detail="The footer no longer ends as passive navigation only. Auricrux remains active at the bottom of the experience so the user exits every route with live operational guidance."
          primaryHref="/portal/platform"
          primaryLabel="Open Platform Dashboard"
          secondaryHref="/academy"
          secondaryLabel="Open Academy"
          compact
        />
      </div>

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
            FCA Customer Journey
          </div>
          <div style={{ color: "#4b5563", lineHeight: 1.7 }}>
            Use this shell to explore the full contractor lifecycle: public entry,
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
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Recommended Next Actions</div>
          <div style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 12 }}>
            Every public route closes on the same clear actions: open workspace,
            review platform state, or schedule a guided walkthrough.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {shellProductionActions.map((action) => (
              <a key={action.href} href={action.href} style={ctaStyles[action.variant]}>
                {action.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Deployment Verification</div>
          <div style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 12 }}>
            Public deployment now exposes a build manifest plus live API routes so deployment drift is easier to detect without opening the repository.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a href="/deployment-status.json" style={linkStyle}>Open deployment manifest</a>
            <a href="/api/auricrux" style={linkStyle}>Open Auricrux API health</a>
            <a href="/api/customer-login" style={linkStyle}>Open customer login API route</a>
          </div>
        </div>
      </div>
    </div>
  );
}
