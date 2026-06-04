import JourneyStrip from "./JourneyStrip";
import FcaBrandMark from "./FcaBrandMark";
import AuricruxPresenceLayer from "./AuricruxPresenceLayer";
import AuricruxNavHint from "./AuricruxNavHint";
import { shellPrimaryNav } from "../websiteShell";
import { ctaLightStyle, ctaPrimaryStyle } from "../publicShellStyles";

const baseLinkStyle = {
  textDecoration: "none",
  color: "#111827",
  fontWeight: 600,
  padding: "8px 10px",
  borderRadius: 10,
  minHeight: 40,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  textAlign: "center",
};

export default function ShellHeader({
  eyebrow = "FCA Unified Shell",
  title,
  subtitle,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  journey,
  currentJourney,
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          alignItems: "flex-start",
          marginBottom: 28,
        }}
      >
        <div style={{ maxWidth: 760, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <FcaBrandMark compact />
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                background: "#eff6ff",
                color: "#2563eb",
                fontWeight: 800,
                letterSpacing: "0.04em",
              }}
            >
              {eyebrow}
            </div>
          </div>
          <h1 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h1>
          {subtitle ? (
            <p style={{ marginTop: 0, color: "#4b5563", lineHeight: 1.6 }}>
              {subtitle}
            </p>
          ) : null}
          <JourneyStrip items={journey} current={currentJourney} />
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "stretch",
            justifyContent: "flex-end",
            minWidth: 0,
          }}
        >
          {shellPrimaryNav.map((item) => {
            const isActive = item.journeyKey === currentJourney;
            return (
              <div key={item.href} style={{ minWidth: 0, maxWidth: 220 }}>
                <a
                  href={item.href}
                  style={{
                    ...baseLinkStyle,
                    background: isActive ? "#eff6ff" : "transparent",
                    color: isActive ? "#1d4ed8" : "#111827",
                    border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
                  }}
                >
                  {item.label}
                </a>
                <AuricruxNavHint item={item} />
              </div>
            );
          })}
          {secondaryHref && secondaryLabel ? (
            <a href={secondaryHref} style={ctaLightStyle}>
              {secondaryLabel}
            </a>
          ) : null}
          {primaryHref && primaryLabel ? (
            <a href={primaryHref} style={ctaPrimaryStyle}>
              {primaryLabel}
            </a>
          ) : null}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <AuricruxPresenceLayer
          surfaceLabel="Auricrux embedded in header"
          title="Auricrux is present before the user takes the next action"
          detail="Header state now carries Auricrux forward as an active operating layer instead of leaving guidance to isolated route bodies or the dock alone."
          primaryHref={primaryHref || "/portal/platform"}
          primaryLabel={primaryLabel || "Open Platform Dashboard"}
          secondaryHref={secondaryHref || "/portal/messages"}
          secondaryLabel={secondaryLabel || "Open Messages"}
          compact
        />
      </div>
    </>
  );
}
