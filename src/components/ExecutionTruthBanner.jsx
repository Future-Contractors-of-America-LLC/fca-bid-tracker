const tones = {
  info: {
    border: "1px solid #bfdbfe",
    background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
    eyebrow: "#1d4ed8",
    text: "#334155",
    chipBg: "#dbeafe",
    chipText: "#1e3a8a",
  },
  warning: {
    border: "1px solid #fcd34d",
    background: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)",
    eyebrow: "#b45309",
    text: "#4b5563",
    chipBg: "#fef3c7",
    chipText: "#92400e",
  },
};

export default function ExecutionTruthBanner({
  title,
  status,
  source,
  whatIsLive = [],
  whatIsNotLiveYet = [],
  tone = "info",
}) {
  const palette = tones[tone] || tones.info;

  return (
    <section
      style={{
        border: palette.border,
        background: palette.background,
        borderRadius: 16,
        padding: 18,
        boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: palette.eyebrow, fontWeight: 800, marginBottom: 6 }}>Execution truth</div>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: 22 }}>{title}</h2>
        </div>
        {status ? (
          <div
            style={{
              borderRadius: 999,
              padding: "8px 12px",
              background: palette.chipBg,
              color: palette.chipText,
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {status}
          </div>
        ) : null}
      </div>

      <div style={{ color: palette.text, lineHeight: 1.7, marginBottom: source ? 14 : 0 }}>
        <strong>Source currently in use:</strong> {source}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <div>
          <div style={{ color: "#0f172a", fontWeight: 800, marginBottom: 8 }}>What is live</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: palette.text, lineHeight: 1.8 }}>
            {whatIsLive.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ color: "#0f172a", fontWeight: 800, marginBottom: 8 }}>What is not live yet</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: palette.text, lineHeight: 1.8 }}>
            {whatIsNotLiveYet.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
