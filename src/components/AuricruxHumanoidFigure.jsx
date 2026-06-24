/**
 * Inline SVG humanoid figure for Auricrux avatar states.
 */
export default function AuricruxHumanoidFigure({ state = "idle", size = 120 }) {
  const eyeGlow = state === "listening" ? "#22c55e" : state === "thinking" ? "#6366f1" : "#fbbf24";
  const chestGlow = state === "speaking" ? "rgba(212, 154, 34, 0.55)" : "rgba(212, 154, 34, 0.2)";

  return (
    <svg
      className="auricrux-avatar__figure"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="auricrux-head" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <linearGradient id="auricrux-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="#0f172a" />
      <ellipse cx="60" cy="78" rx="28" ry="34" fill="url(#auricrux-body)" />
      <ellipse cx="60" cy="72" rx="14" ry="18" fill={chestGlow} />
      <circle cx="60" cy="38" r="22" fill="url(#auricrux-head)" />
      <ellipse cx="52" cy="36" rx="4" ry="5" fill={eyeGlow} />
      <ellipse cx="68" cy="36" rx="4" ry="5" fill={eyeGlow} />
      <path d="M54 46 Q60 50 66 46" stroke="#7c5313" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="38" y="58" width="10" height="28" rx="5" fill="#334155" />
      <rect x="72" y="58" width="10" height="28" rx="5" fill="#334155" />
      {state === "thinking" ? (
        <circle cx="88" cy="24" r="3" fill="#6366f1" opacity="0.9">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      ) : null}
      {state === "speaking" ? (
        <ellipse cx="60" cy="48" rx="6" ry="3" fill="#d49a22" opacity="0.7">
          <animate attributeName="ry" values="2;4;2" dur="0.8s" repeatCount="indefinite" />
        </ellipse>
      ) : null}
    </svg>
  );
}
