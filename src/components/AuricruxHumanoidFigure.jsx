import { useId } from "react";
import { brandIdentity } from "../brandIdentity";

const stateEyeColors = {
  idle: null,
  listening: "#22c55e",
  thinking: "#6366f1",
  speaking: null,
};

/**
 * Original Auricrux humanoid sigil — geometric operator artwork, not a real person.
 */
export default function AuricruxHumanoidFigure({ size = 120, state = "idle" }) {
  const uid = useId().replace(/:/g, "");
  const { colors } = brandIdentity.auricrux;
  const eyeColor = stateEyeColors[state] || colors.primary;
  const glowOpacity =
    state === "speaking" ? 0.35 : state === "listening" ? 0.28 : state === "thinking" ? 0.22 : 0.12;
  const glowColor =
    state === "listening" ? "#22c55e" : state === "thinking" ? "#6366f1" : colors.primary;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Auricrux humanoid operator sigil"
    >
      <defs>
        <radialGradient
          id={`${uid}-bg`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(60 62) rotate(90) scale(58)"
        >
          <stop stopColor="#1e293b" />
          <stop offset="1" stopColor="#0f172a" />
        </radialGradient>
        <linearGradient id={`${uid}-shoulder`} x1="20" y1="72" x2="100" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8A5A12" />
          <stop offset="0.45" stopColor={colors.primary} />
          <stop offset="1" stopColor={colors.primaryDark} />
        </linearGradient>
        <linearGradient id={`${uid}-helmet`} x1="36" y1="24" x2="84" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE8AA" />
          <stop offset="0.55" stopColor={colors.primary} />
          <stop offset="1" stopColor="#5A320A" />
        </linearGradient>
        <linearGradient id={`${uid}-crux`} x1="60" y1="82" x2="60" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF4D1" />
          <stop offset="1" stopColor="#B77912" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="58" fill={`url(#${uid}-bg)`} />
      <circle cx="60" cy="48" r="34" fill={glowColor} fillOpacity={glowOpacity} />

      <path
        d="M16 88L30 68H90L104 88V110H16V88Z"
        fill={`url(#${uid}-shoulder)`}
        stroke="#4B3208"
        strokeWidth="1.5"
      />
      <path d="M22 88L34 72H86L98 88" stroke="#FFF3C8" strokeOpacity="0.35" strokeWidth="1.5" />

      <path d="M38 76H82L88 96H32L38 76Z" fill="#111827" stroke={colors.primary} strokeWidth="1.5" />

      <path
        d="M60 82L66 90V96L60 102L54 96V90L60 82Z"
        fill={`url(#${uid}-crux)`}
        stroke={colors.primaryDark}
        strokeWidth="1.2"
      />
      <path d="M60 96V104" stroke={colors.primaryDark} strokeWidth="4" strokeLinecap="round" />
      <path d="M52 99H68" stroke={colors.primaryDark} strokeWidth="4" strokeLinecap="round" />

      <rect x="52" y="62" width="16" height="14" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1" />

      <path
        d="M60 26C43 26 34 40 34 54C34 68 43 74 60 74C77 74 86 68 86 54C86 40 77 26 60 26Z"
        fill={`url(#${uid}-helmet)`}
        stroke="#B77912"
        strokeWidth="2"
      />
      <path d="M44 42H76L73 58H47L44 42Z" fill="#0f172a" fillOpacity="0.88" stroke="#334155" strokeWidth="1" />

      <rect x="48" y="47" width="11" height="3.5" rx="1.75" fill={eyeColor} />
      <rect x="61" y="47" width="11" height="3.5" rx="1.75" fill={eyeColor} />

      <path d="M60 32L63 38L60 44L57 38L60 32Z" fill="#FFF4D1" stroke={colors.primaryDark} strokeWidth="1" />
      <circle cx="60" cy="38" r="9" stroke="#FFE9A4" strokeOpacity="0.45" strokeWidth="1" />

      <path d="M36 52L44 48" stroke="#FFF3C8" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M84 52L76 48" stroke="#FFF3C8" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
