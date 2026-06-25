import { brandIdentity } from "../brandIdentity";
import { auricruxPersona } from "../config/auricruxPersona";

const CRUX_MARK_SRC = "/brand/auricrux/auricrux-crux-mark.svg";

/**
 * Auricrux avatar — canonical crux mark with live state cues.
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

  const ringColor =
    state === "speaking"
      ? colors.primary
      : state === "listening"
        ? "#22c55e"
        : state === "thinking"
          ? "#6366f1"
          : colors.primarySoft;

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
        @keyframes auricrux-glow {
          0%, 100% { opacity: 0.45; box-shadow: 0 0 0 0 rgba(212, 154, 34, 0.35); }
          50% { opacity: 0.85; box-shadow: 0 0 18px 4px rgba(212, 154, 34, 0.25); }
        }
        @keyframes auricrux-listen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 16px 3px rgba(34, 197, 94, 0.35); }
        }
        @keyframes auricrux-think {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .auricrux-avatar__frame {
          position: relative;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          animation: auricrux-breathe 4.2s ease-in-out infinite;
          transform-origin: center bottom;
          border: 3px solid ${ringColor};
          background: radial-gradient(circle at 50% 35%, #fff4d1 0%, #0f172a 72%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auricrux-avatar--speaking .auricrux-avatar__frame {
          animation: auricrux-breathe 3s ease-in-out infinite, auricrux-glow 1.8s ease-in-out infinite;
        }
        .auricrux-avatar--listening .auricrux-avatar__frame {
          animation: auricrux-breathe 5s ease-in-out infinite, auricrux-listen 2.2s ease-in-out infinite;
        }
        .auricrux-avatar--thinking .auricrux-avatar__frame {
          animation: auricrux-breathe 5.5s ease-in-out infinite, auricrux-think 2.8s ease-in-out infinite;
        }
        .auricrux-avatar__mark {
          display: block;
          object-fit: contain;
        }
      `}</style>

      <div
        className="auricrux-avatar__frame"
        style={{ width: size, height: size, padding: size * 0.12 }}
      >
        <img
          className="auricrux-avatar__mark"
          src={CRUX_MARK_SRC}
          alt=""
          width={Math.round(size * 0.76)}
          height={Math.round(size * 0.76)}
          draggable={false}
        />
      </div>

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
