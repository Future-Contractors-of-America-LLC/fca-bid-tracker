import { useEffect } from "react";

import ShellHeader from "./ShellHeader";
import ShellFooter from "./ShellFooter";
import PublicActionRail from "./PublicActionRail";
import { publicRouteCtas, shellJourney } from "../websiteShell";
import { cardStyle, ctaLightStyle, ctaPrimaryStyle, ctaSecondaryStyle, pageShellStyle } from "../publicShellStyles";

export default function LegacyRouteBridge({
  eyebrow,
  title,
  subtitle,
  requestedPath,
  targetHref,
  targetLabel,
  companionHref,
  companionLabel,
  autoRedirectMs = 1200,
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.assign(targetHref);
    }, autoRedirectMs);

    return () => window.clearTimeout(timer);
  }, [autoRedirectMs, targetHref]);

  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        primaryHref={targetHref}
        primaryLabel={targetLabel}
        secondaryHref={publicRouteCtas.workspace.secondaryHref}
        secondaryLabel={publicRouteCtas.workspace.secondaryLabel}
        journey={shellJourney}
        currentJourney="workspace"
      />

      <div style={{ ...cardStyle, marginTop: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "#2563eb", marginBottom: 10 }}>
          Legacy route bridge active
        </div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>This action now has a supported shell bridge</h2>
        <p style={{ color: "#475569", lineHeight: 1.7, marginTop: 0 }}>
          We detected a shorthand or legacy path and are forwarding you into the compatible FCA surface instead of letting the shell fall through to a dead end.
        </p>
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #dbe3ef",
            background: "#f8fbff",
            color: "#0f172a",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
            fontSize: 13,
            wordBreak: "break-word",
          }}
        >
          Requested path: {requestedPath}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
          <a href={targetHref} style={ctaPrimaryStyle}>{targetLabel}</a>
          <a href="/portal" style={ctaSecondaryStyle}>Open Portal Workspace</a>
          <a href="/" style={ctaLightStyle}>Return Home</a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Primary continuity route</h3>
          <p style={{ color: "#475569", lineHeight: 1.7 }}>
            Use the canonical bridge first so customer traffic stays inside the supported shell before dropping into the legacy utility.
          </p>
          <a href={targetHref} style={ctaPrimaryStyle}>{targetLabel}</a>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Companion route</h3>
          <p style={{ color: "#475569", lineHeight: 1.7 }}>
            Keep the related customer action available so visitors can switch between entry and status without searching for older links.
          </p>
          <a href={companionHref} style={ctaSecondaryStyle}>{companionLabel}</a>
        </div>
      </div>

      <PublicActionRail
        title="Legacy compatibility is preserved"
        detail="This bridge keeps older bid buttons operational while the public shell remains the primary guided customer experience."
      />

      <ShellFooter />
    </div>
  );
}
