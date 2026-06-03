import { shellJourney } from "../websiteShell";

const stripStyle = {
  border: "1px solid #dbe3ef",
  background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
  borderRadius: 16,
  padding: 16,
  marginTop: 18,
  marginBottom: 24,
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const stepBaseStyle = {
  textDecoration: "none",
  borderRadius: 12,
  padding: 12,
  border: "1px solid #dbe3ef",
  background: "#ffffff",
  color: "#111827",
};

export default function FounderJourneyStrip({
  currentJourney = "public",
  title = "Customer journey",
  detail = "Move through one connected path from public entry into workspace continuity, operating visibility, and rollout planning.",
  ctaHref = "/portal/platform",
  ctaLabel = "Open unified platform state",
}) {
  return (
    <div style={stripStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Customer path</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h2>
          <div style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860 }}>{detail}</div>
        </div>
        <a
          href={ctaHref}
          style={{
            textDecoration: "none",
            background: "#111827",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 10,
            fontWeight: 700,
          }}
        >
          {ctaLabel}
        </a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {shellJourney.map((step, index) => {
          const isActive = step.key === currentJourney;
          return (
            <a
              key={step.key}
              href={step.href}
              style={{
                ...stepBaseStyle,
                border: isActive ? "1px solid #2563eb" : stepBaseStyle.border,
                background: isActive ? "#eff6ff" : stepBaseStyle.background,
              }}
            >
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: isActive ? "#2563eb" : "#64748b", fontWeight: 700, marginBottom: 6 }}>
                Step {index + 1}
              </div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{step.label}</div>
              <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{step.href}</div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
