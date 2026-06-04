import JourneyStrip from "./JourneyStrip";
import FcaBrandMark from "./FcaBrandMark";
import AuricruxPresenceLayer from "./AuricruxPresenceLayer";
import PublicTopNav from "./PublicTopNav";
import { ctaLightStyle, ctaPrimaryStyle } from "../publicShellStyles";

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
  showTopNav = true,
  topNavMode = "public",
}) {
  return (
    <>
      {showTopNav ? <PublicTopNav mode={topNavMode} /> : null}

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
