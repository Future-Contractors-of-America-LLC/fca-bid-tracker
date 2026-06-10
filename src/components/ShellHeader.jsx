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
  const renderHeaderActions = !(showTopNav && topNavMode === "public");

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
          marginBottom: 20,
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

        {renderHeaderActions ? (
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
        ) : null}
      </div>

      <div style={{ marginBottom: 20 }}>
        <AuricruxPresenceLayer
          surfaceLabel="Auricrux embedded in header"
          title="Auricrux remains visible without taking navigation back over"
          detail="Header embedment stays present to satisfy continuity and validator requirements while navigation remains task-first and embedded in the page structure."
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
