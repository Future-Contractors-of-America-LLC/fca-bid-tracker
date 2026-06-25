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
  padding: "8px 0 4px",
  marginBottom: 14,
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

  return (
    <>
      {showTopNav ? <PublicTopNav mode={topNavMode} /> : null}

      {compact ? (
        <div style={compactTitleStyle}>
          {eyebrow ? <div style={{ ...portalEyebrowStyle, marginBottom: title || subtitle ? 6 : 0 }}>{eyebrow}</div> : null}
          {title ? <h1 style={{ margin: 0 }}>{title}</h1> : null}
          {subtitle ? (
            <p style={{ marginTop: 8, marginBottom: 0, color: portalTokens.body, lineHeight: 1.55, maxWidth: 680, fontSize: 15 }}>
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
              marginBottom: showJourney ? 16 : 0,
            }}
          >
            <div style={{ maxWidth: 720, minWidth: 0 }}>
              <div style={{ ...portalEyebrowStyle, marginBottom: 8 }}>{eyebrow}</div>
              <h1 style={{ marginTop: 0, marginBottom: subtitle ? 8 : 0 }}>{title}</h1>
              {subtitle ? (
                <p style={{ marginTop: 0, color: portalTokens.body, lineHeight: 1.55, marginBottom: 0, fontSize: 15, maxWidth: 640 }}>
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

          {showJourney ? <JourneyStrip items={journey} current={currentJourney} /> : null}
        </div>
      )}
    </>
  );
}
