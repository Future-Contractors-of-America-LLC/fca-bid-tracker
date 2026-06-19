import { brandIdentity } from "../brandIdentity";

/** Canonical SVG sources: brand-assets/auricrux/ (trademark registration specimens). */
export default function AuricruxBrandMark({ compact = false, showLabel = true }) {
  const iconSize = compact ? 44 : 56;
  const { colors } = brandIdentity.auricrux;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 10 : 12,
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
          <radialGradient id="auricruxCoreGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 60) rotate(90) scale(58)">
            <stop stopColor="#FFF4D1" />
            <stop offset="0.5" stopColor={colors.primary} />
            <stop offset="1" stopColor="#8A5A12" />
          </radialGradient>
          <linearGradient id="auricruxEdge" x1="18" y1="18" x2="102" y2="102" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFE8AA" />
            <stop offset="1" stopColor="#B77912" />
          </linearGradient>
          <linearGradient id="auricruxCrux" x1="60" y1="34" x2="60" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2C1803" />
            <stop offset="1" stopColor="#5A320A" />
          </linearGradient>
        </defs>

        <circle cx="60" cy="60" r="52" fill="url(#auricruxCoreGlow)" stroke="url(#auricruxEdge)" strokeWidth="4" />

        <path d="M60 20L69 39L89 41L73.5 54L78 74L60 64L42 74L46.5 54L31 41L51 39L60 20Z" fill="#FFF3C8" fillOpacity="0.35" />

        <path d="M60 33L66 45L79 46L69 55L72 68L60 62L48 68L51 55L41 46L54 45L60 33Z" fill="#FFE9A4" fillOpacity="0.7" stroke="#7C5313" strokeWidth="2" />

        <path d="M60 40L67 49V58L60 66L53 58V49L60 40Z" fill="url(#auricruxCrux)" />
        <path d="M60 66V84" stroke="url(#auricruxCrux)" strokeWidth="7" strokeLinecap="round" />
        <path d="M47 71H73" stroke="url(#auricruxCrux)" strokeWidth="7" strokeLinecap="round" />

        <circle cx="60" cy="60" r="51" stroke="#4B3208" strokeOpacity="0.22" strokeWidth="1.5" />
      </svg>

      {showLabel ? (
        <div>
          <div style={{ fontWeight: 900, letterSpacing: "0.1em", color: colors.primaryDark, textTransform: "uppercase" }}>
            Auricrux
          </div>
          <div style={{ color: "#7c5313", fontSize: compact ? 11 : 12 }}>
            System intelligence layer
          </div>
        </div>
      ) : null}
    </div>
  );
}
