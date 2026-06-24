import JourneyStrip from "./JourneyStrip";
import PublicTopNav from "./PublicTopNav";
import AuricruxPresenceLayer from "./AuricruxPresenceLayer";
import { ctaLightStyle, ctaPrimaryStyle } from "../publicShellStyles";

const headerShellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 20,
  background: "linear-gradient(135deg, #ffffff 0%, #f0f6ff 62%, #fff8e6 100%)",
  padding: 24,
  marginBottom: 20,
  boxShadow: "0 14px 28px rgba(15, 23, 42, 0.06)",
};

const compactTitleStyle = {
  padding: "24px 0 8px",
  marginBottom: 16,
  borderBottom: "1px solid #e2e8f0",
};

export default function ShellHeader({
  eyebrow = "FCA Contractor Command",
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
  compact = false,
}) {
  const renderHeaderActions = !(showTopNav && topNavMode === "public") && !compact;

  return (
    <>
      {showTopNav ? <PublicTopNav mode={topNavMode} /> : null}

      {compact ? (
        <div style={compactTitleStyle}>
          <div style={{ color: "#64748b", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            {eyebrow}
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>{title}</h1>
          {subtitle ? (
            <p style={{ marginTop: 10, marginBottom: 0, color: "#475569", lineHeight: 1.65, maxWidth: 720 }}>
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : (
        <div style={headerShellStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
              alignItems: "flex-start",
              marginBottom: 18,
            }}
          >
            <div style={{ maxWidth: 760, minWidth: 0 }}>
              <div style={{ color: "#64748b", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                {eyebrow}
              </div>
              <h1 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h1>
              {subtitle ? (
                <p style={{ marginTop: 0, color: "#334155", lineHeight: 1.65, marginBottom: 0 }}>
                  {subtitle}
                </p>
              ) : null}
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

          <JourneyStrip items={journey} current={currentJourney} />

          {!compact && showTopNav && topNavMode === "public" ? (
            <div style={{ marginTop: 16 }}>
              {/* Auricrux embedded in header */}
              <AuricruxPresenceLayer surfaceKey="landing" compact />
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
