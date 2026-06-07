import AuricruxBrandMark from "./AuricruxBrandMark";
import AuricruxPresenceLayer from "./AuricruxPresenceLayer";
import DeploymentStatusBeacon from "./DeploymentStatusBeacon";
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

const continuityLinks = [
  {
    href: "/live-shell-verification.html",
    label: "Open raw live verification",
    detail: "Bypass the React shell and inspect the hosted verification artifact directly.",
  },
  {
    href: "/login?seeded=1",
    label: "Open seeded login",
    detail: "Start a guided public test-account flow without needing manual credential entry.",
  },
  {
    href: "/login?seeded=1&autologin=1&next=/portal/platform",
    label: "Open direct platform workspace",
    detail: "Jump directly into the authenticated platform route for live walkthrough and revenue demos.",
  },
  {
    href: "/api/customer-login",
    label: "Open customer login API",
    detail: "Confirm the Static Web App Functions surface is reachable from the public host.",
  },
];

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
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Continuity Launchpad</div>
          <div style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 12 }}>
            When the public shell looks stale, use these routes to verify hosted artifacts,
            authenticate into the demo workspace faster, and confirm function continuity
            without relying on deeper navigation.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {continuityLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: "none",
                  border: "1px solid #dbe3ef",
                  borderRadius: 12,
                  padding: 12,
                  background: "#f8fafc",
                }}
              >
                <div style={{ color: "#111827", fontWeight: 700, marginBottom: 4 }}>{item.label}</div>
                <div style={{ color: "#4b5563", lineHeight: 1.6 }}>{item.detail}</div>
              </a>
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

        <DeploymentStatusBeacon />
      </div>
    </div>
  );
}
