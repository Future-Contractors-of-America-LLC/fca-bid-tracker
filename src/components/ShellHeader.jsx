import JourneyStrip from "./JourneyStrip";
import { shellPrimaryNav } from "../websiteShell";

const baseLinkStyle = {
  textDecoration: "none",
  color: "#111827",
  fontWeight: 600,
  padding: "8px 10px",
  borderRadius: 10,
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
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        alignItems: "flex-start",
        marginBottom: 28,
      }}
    >
      <div style={{ maxWidth: 760 }}>
        <p style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>
          {eyebrow}
        </p>
        <h1 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h1>
        {subtitle ? (
          <p style={{ marginTop: 0, color: "#4b5563", lineHeight: 1.6 }}>
            {subtitle}
          </p>
        ) : null}
        <JourneyStrip items={journey} current={currentJourney} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {shellPrimaryNav.map((item) => {
          const isActive = item.journeyKey === currentJourney;
          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                ...baseLinkStyle,
                background: isActive ? "#eff6ff" : "transparent",
                color: isActive ? "#1d4ed8" : "#111827",
                border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
              }}
            >
              {item.label}
            </a>
          );
        })}
        {secondaryHref && secondaryLabel ? (
          <a
            href={secondaryHref}
            style={{
              ...baseLinkStyle,
              background: "#f8fafc",
              border: "1px solid #dbe3ef",
            }}
          >
            {secondaryLabel}
          </a>
        ) : null}
        {primaryHref && primaryLabel ? (
          <a
            href={primaryHref}
            style={{
              textDecoration: "none",
              background: "#111827",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            {primaryLabel}
          </a>
        ) : null}
      </div>
    </div>
  );
}
