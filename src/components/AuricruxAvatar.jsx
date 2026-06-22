import { brandIdentity } from "../brandIdentity";
import { auricruxPersona } from "../config/auricruxPersona";

/**
 * Auricrux humanoid avatar — relatable field operator, executive presence.
 * state: idle | listening | thinking | speaking
 */
export default function AuricruxAvatar({
  state = "idle",
  size = 120,
  showCaption = true,
  compact = false,
}) {
  const { colors } = brandIdentity.auricrux;
  const caption =
    state === "speaking"
      ? auricruxPersona.speakingLabel
      : state === "listening"
        ? auricruxPersona.listeningLabel
        : state === "thinking"
          ? auricruxPersona.thinkingLabel
          : auricruxPersona.idleLabel;

  return (
    <div
      className={`auricrux-avatar auricrux-avatar--${state}`}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: compact ? 6 : 10,
      }}
      aria-label={`${auricruxPersona.name} avatar, ${caption}`}
    >
      <style>{`
        @keyframes auricrux-breathe {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2px) scale(1.012); }
        }
        @keyframes auricrux-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          96% { transform: scaleY(0.08); }
        }
        @keyframes auricrux-speak {
          0%, 100% { transform: scaleY(1); }
          25% { transform: scaleY(0.82); }
          50% { transform: scaleY(1.05); }
          75% { transform: scaleY(0.88); }
        }
        @keyframes auricrux-nod {
          0%, 100% { transform: rotate(0deg); }
          40% { transform: rotate(-2deg); }
          70% { transform: rotate(1.5deg); }
        }
        @keyframes auricrux-glow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.65; }
        }
        .auricrux-avatar__figure {
          animation: auricrux-breathe 4.2s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .auricrux-avatar--speaking .auricrux-avatar__figure {
          animation: auricrux-breathe 3s ease-in-out infinite, auricrux-nod 2.4s ease-in-out infinite;
        }
        .auricrux-avatar--listening .auricrux-avatar__figure {
          animation: auricrux-breathe 5s ease-in-out infinite, auricrux-nod 3.5s ease-in-out infinite;
        }
        .auricrux-avatar--thinking .auricrux-avatar__figure {
          animation: auricrux-breathe 5.5s ease-in-out infinite;
        }
        .auricrux-avatar__eyes {
          transform-origin: center;
          animation: auricrux-blink 5.5s infinite;
        }
        .auricrux-avatar--speaking .auricrux-avatar__jaw {
          transform-origin: center 78%;
          animation: auricrux-speak 0.42s ease-in-out infinite;
        }
        .auricrux-avatar--thinking .auricrux-avatar__eyes {
          animation: none;
          transform: translateY(-1px);
        }
        .auricrux-avatar__halo {
          animation: auricrux-glow 3s ease-in-out infinite;
        }
      `}</style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="auricrux-avatar__figure"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="auricruxAvatarHalo" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor={colors.primarySoft} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="auricruxSkin" x1="40" y1="30" x2="80" y2="90">
            <stop stopColor="#C68642" />
            <stop offset="1" stopColor="#8D5524" />
          </linearGradient>
          <linearGradient id="auricruxVest" x1="20" y1="70" x2="100" y2="110">
            <stop stopColor={colors.primary} />
            <stop offset="1" stopColor={colors.primaryDark} />
          </linearGradient>
          <linearGradient id="auricruxHat" x1="30" y1="8" x2="90" y2="40">
            <stop stopColor="#FACC15" />
            <stop offset="1" stopColor="#CA8A04" />
          </linearGradient>
        </defs>

        <circle cx="60" cy="62" r="54" fill="url(#auricruxAvatarHalo)" className="auricrux-avatar__halo" />

        <path
          d="M22 88 C28 72, 42 68, 60 68 C78 68, 92 72, 98 88 L98 112 L22 112 Z"
          fill="url(#auricruxVest)"
          stroke={colors.primaryDark}
          strokeWidth="1.5"
        />
        <path d="M38 78 H82" stroke="#FFF7E1" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
        <path d="M42 86 H76" stroke="#FFF7E1" strokeWidth="2" strokeLinecap="round" opacity="0.55" />

        <rect x="52" y="62" width="16" height="14" rx="4" fill="url(#auricruxSkin)" />

        <ellipse cx="60" cy="48" rx="22" ry="24" fill="url(#auricruxSkin)" />

        <path
          d="M32 36 C34 22, 48 14, 60 14 C72 14, 86 22, 88 36 L92 40 L28 40 Z"
          fill="url(#auricruxHat)"
          stroke="#92400E"
          strokeWidth="1.2"
        />
        <rect x="26" y="38" width="68" height="5" rx="2" fill="#EAB308" stroke="#92400E" strokeWidth="0.8" />

        <g className="auricrux-avatar__eyes">
          <ellipse cx="50" cy="46" rx="3.2" ry="4" fill="#2C1803" />
          <ellipse cx="70" cy="46" rx="3.2" ry="4" fill="#2C1803" />
          <circle cx="51" cy="45" r="1" fill="#fff" opacity="0.7" />
          <circle cx="71" cy="45" r="1" fill="#fff" opacity="0.7" />
        </g>
        <path d="M48 52 Q60 58 72 52" stroke="#5A320A" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />

        <g className="auricrux-avatar__jaw">
          <path d="M52 54 Q60 62 68 54 L66 58 Q60 64 54 58 Z" fill="#7C4A2d" opacity="0.35" />
        </g>

        <circle cx="60" cy="82" r="7" fill={colors.primarySoft} stroke={colors.primaryDark} strokeWidth="1" />
        <path
          d="M60 76 L63 82 L69 83 L64 87 L66 93 L60 90 L54 93 L56 87 L51 83 L57 82 Z"
          fill={colors.primaryDark}
          opacity="0.85"
        />
      </svg>

      {showCaption ? (
        <div style={{ textAlign: "center", maxWidth: size + 40 }}>
          <div
            style={{
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: colors.primaryDark,
              fontSize: compact ? 10 : 11,
            }}
          >
            {auricruxPersona.name}
          </div>
          <div style={{ color: "#64748b", fontSize: compact ? 11 : 12, lineHeight: 1.4, marginTop: 2 }}>
            {caption}
          </div>
        </div>
      ) : null}
    </div>
  );
}
