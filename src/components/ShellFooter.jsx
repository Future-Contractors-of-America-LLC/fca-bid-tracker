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
    detail: "Inspect the hosted verification artifact directly when validating runtime truth.",
  },
  {
    href: "/contact",
    label: "Request guided onboarding",
    detail: "Route prospects into a credible onboarding path instead of an internal testing path.",
  },
  {
    href: "/portal/platform",
    label: "Open platform workspace",
    detail: "Move directly into the canonical FCA portal experience.",
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
          </div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>
            FCA Customer Journey
          </div>
          <div style={{ color: "#4b5563", lineHeight: 1.7 }}>
            Explore the contractor lifecycle through public entry, platform framing, workspace visibility,
            academy enablement, and guided next actions.
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
            Compatibility intake and status routes remain available for continuity, while canonical FCA shell routes remain primary.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shellCompatibilityRoutes.map((item) => (
              <a key={item.href} href={item.href} style={linkStyle}>{item.label}</a>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Legal</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a href="/terms" style={linkStyle}>Terms of Service</a>
            <a href="/privacy" style={linkStyle}>Privacy Policy</a>
            <a href="/refunds" style={linkStyle}>Refunds & Billing</a>
            <a href="/ip" style={linkStyle}>Intellectual Property</a>
          </div>
          <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, marginTop: 16 }}>
            Copyright (c) 2026 Future Contractors of America LLC. FCA and Auricrux are trademarks of Future Contractors of America LLC.
          </p>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Verification and Access</div>
          <div style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 12 }}>
            Use these routes to validate runtime truth, request onboarding, or enter the canonical portal path.
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
            Every route should close on a clear action: open workspace, review platform state, or schedule a guided walkthrough.
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
