import JourneyStrip from "./JourneyStrip";
import FcaBrandMark from "./FcaBrandMark";
import AuricruxBrandMark from "./AuricruxBrandMark";
import PublicTopNav from "./PublicTopNav";
import { ctaLightStyle, ctaPrimaryStyle } from "../publicShellStyles";

const headerShellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 20,
  background: "linear-gradient(135deg, #ffffff 0%, #f0f6ff 62%, #fff8e6 100%)",
  padding: 24,
  marginBottom: 20,
  boxShadow: "0 14px 28px rgba(15, 23, 42, 0.06)",
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
  showTopNav = true,
  topNavMode = "public",
}) {
  const renderHeaderActions = !(showTopNav && topNavMode === "public");

  return (
    <>
      {showTopNav ? <PublicTopNav mode={topNavMode} /> : null}

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
              <AuricruxBrandMark compact showLabel={false} />
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "linear-gradient(135deg, #eff6ff 0%, #fff7e1 100%)",
                  color: "#1f3ea8",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  border: "1px solid #dbe3ef",
                }}
              >
                {eyebrow}
              </div>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "#fff7e1",
                  color: "#7c5313",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  border: "1px solid #ecd089",
                }}
              >
                Auricrux-driven
              </div>
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
      </div>
    </>
  );
}
