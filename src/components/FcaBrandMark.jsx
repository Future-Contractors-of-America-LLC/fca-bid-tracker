import { brandIdentity } from "../brandIdentity";

/** Canonical SVG sources: brand-assets/fca/ and brand-assets/auricrux/ (trademark registration specimens). */
export default function FcaBrandMark({
  compact = false,
  showTagline = true,
  /** Top-nav mark: icon only (or icon + small FCA) so long brand strings are not duplicated. */
  iconOnly = false,
  showWordmark = true,
}) {
  const iconSize = iconOnly ? 32 : compact ? 46 : 62;
  const wordmarkSize = compact ? 28 : 38;
  const { colors } = brandIdentity.fca;
  const renderWordmark = showWordmark && !iconOnly;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: iconOnly ? 0 : compact ? 12 : 16,
        flexWrap: "wrap",
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="fcaBrandBlue" x1="22" y1="12" x2="98" y2="108" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8CB2FF" />
            <stop offset="0.48" stopColor={colors.primary} />
            <stop offset="1" stopColor={colors.primaryDark} />
          </linearGradient>
          <linearGradient id="fcaBrandBlueDark" x1="38" y1="48" x2="88" y2="108" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3F6BEE" />
            <stop offset="1" stopColor="#2445B3" />
          </linearGradient>
        </defs>
        <path d="M60 10L104 35V84L83 96V46L60 32L37 46V96L16 84V35L60 10Z" fill="url(#fcaBrandBlue)" />
        <path d="M60 10V32L83 46L104 35L60 10Z" fill="#A8C4FF" fillOpacity="0.98" />
        <path d="M37 46L60 32V10L16 35L37 46Z" fill="#73A0FF" fillOpacity="0.95" />
        <path d="M37 46V96L60 82V59L37 46Z" fill="url(#fcaBrandBlueDark)" fillOpacity="0.97" />
        <path d="M83 46V96L60 82V59L83 46Z" fill="#4874F5" fillOpacity="0.9" />
        <path d="M45 55L60 46L75 55V68L60 77L45 68V55Z" fill="#091221" fillOpacity="0.96" />
      </svg>

      {renderWordmark ? (
        <div>
          <div
            style={{
              fontSize: wordmarkSize,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: "0.05em",
              color: colors.ink,
            }}
          >
            FCA
          </div>
          {showTagline ? (
            <div
              style={{
                marginTop: 6,
                fontSize: compact ? 10 : 12,
                letterSpacing: "0.13em",
                textTransform: "uppercase",
                fontWeight: 800,
                color: "#334155",
                lineHeight: 1.25,
              }}
            >
              Future Contractors<br />of America
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
