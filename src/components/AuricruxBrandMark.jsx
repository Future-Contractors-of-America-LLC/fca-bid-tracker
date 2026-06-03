import { brandIdentity } from "../brandIdentity";

export default function AuricruxBrandMark({ compact = false, showLabel = true }) {
  const iconSize = compact ? 44 : 54;
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
          <linearGradient id="auricruxGold" x1="19" y1="18" x2="101" y2="102" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFE9A6" />
            <stop offset="0.45" stopColor={colors.primary} />
            <stop offset="1" stopColor="#B77912" />
          </linearGradient>
        </defs>
        <path d="M60 18L74 24L84 36V51C84 66 73 78 60 84C47 78 36 66 36 51V36L46 24L60 18Z" fill="url(#auricruxGold)" stroke="#6B450C" strokeWidth="4" />
        <path d="M60 34L68 38L72 46V55C72 63 66 70 60 73C54 70 48 63 48 55V46L52 38L60 34Z" fill="#5B2A07" fillOpacity="0.92" />
        <path d="M22 48L10 44L18 58L10 72L26 66L40 72L34 58L40 44L22 48Z" fill="url(#auricruxGold)" stroke="#6B450C" strokeWidth="3" strokeLinejoin="round" />
        <path d="M98 48L110 44L102 58L110 72L94 66L80 72L86 58L80 44L98 48Z" fill="url(#auricruxGold)" stroke="#6B450C" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      {showLabel ? (
        <div>
          <div style={{ fontWeight: 900, letterSpacing: "0.1em", color: colors.primaryDark, textTransform: "uppercase" }}>
            Auricrux
          </div>
          <div style={{ color: "#6b7280", fontSize: compact ? 11 : 12 }}>
            Embedded operating layer
          </div>
        </div>
      ) : null}
    </div>
  );
}
