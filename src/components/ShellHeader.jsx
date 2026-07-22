import JourneyStrip from "./JourneyStrip";
import PublicTopNav from "./PublicTopNav";
import { ctaLightStyle, ctaPrimaryStyle } from "../publicShellStyles";
import { portalEyebrowStyle, portalTokens } from "../portalDesignTokens";

const headerShellStyle = {
  border: `1px solid ${portalTokens.border}`,
  borderRadius: portalTokens.radiusLg,
  background: portalTokens.panel,
  padding: "22px 24px",
  marginBottom: 18,
  boxShadow: portalTokens.shadowMd,
};

const compactTitleStyle = {
  padding: "12px 0 4px",
  marginBottom: 12,
};

const titleStyle = {
  margin: 0,
  fontSize: "clamp(1.35rem, 2.2vw, 1.75rem)",
  lineHeight: 1.2,
  letterSpacing: "-0.02em",
  color: portalTokens.ink,
  overflowWrap: "anywhere",
};

const subtitleStyle = {
  marginTop: 6,
  marginBottom: 0,
  color: portalTokens.body,
  lineHeight: 1.5,
  maxWidth: 640,
  fontSize: 14,
  overflowWrap: "anywhere",
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
  showJourney = false,
}) {
  const renderHeaderActions = topNavMode === "portal"
    ? Boolean(primaryHref && primaryLabel)
    : !(showTopNav && topNavMode === "public") && !compact;
  const showEyebrow = Boolean(eyebrow);

  return (
    <>
      {showTopNav ? <PublicTopNav mode={topNavMode} /> : null}

      {compact ? (
        <div style={compactTitleStyle}>
          {showEyebrow ? <div style={{ ...portalEyebrowStyle, marginBottom: title || subtitle ? 6 : 0 }}>{eyebrow}</div> : null}
          {title ? <h1 style={titleStyle}>{title}</h1> : null}
          {subtitle ? <p style={subtitleStyle}>{subtitle}</p> : null}
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
              marginBottom: showJourney ? 16 : 0,
            }}
          >
            <div style={{ maxWidth: 720, minWidth: 0 }}>
              {showEyebrow ? <div style={{ ...portalEyebrowStyle, marginBottom: 8 }}>{eyebrow}</div> : null}
              <h1 style={{ ...titleStyle, marginBottom: subtitle ? 8 : 0 }}>{title}</h1>
              {subtitle ? <p style={{ ...subtitleStyle, marginTop: 0 }}>{subtitle}</p> : null}
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

          {showJourney ? <JourneyStrip items={journey} current={currentJourney} /> : null}
        </div>
      )}
    </>
  );
}
