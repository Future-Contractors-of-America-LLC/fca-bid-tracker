export default function AuricruxDesignInsight({ intelligence, onAskAuricrux }) {
  if (!intelligence) return null;
  return (
    <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "linear-gradient(180deg, #fffbeb 0%, #fff 100%)" }}>
      <div style={{ color: "#92400e", fontWeight: 700, marginBottom: 8 }}>Auricrux Design Intelligence</div>
      <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>{intelligence.nextAction}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
        <Metric label="Markups" value={intelligence.counts?.markups ?? 0} />
        <Metric label="Takeoffs" value={intelligence.counts?.takeoffs ?? 0} />
        <Metric label="Open punch" value={intelligence.counts?.openPunch ?? 0} />
      </div>
      <button
        type="button"
        onClick={onAskAuricrux}
        style={{ border: "1px solid #d97706", background: "#fef3c7", color: "#92400e", borderRadius: 10, padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}
      >
        Ask Auricrux about this sheet
      </button>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ border: "1px solid #fde68a", borderRadius: 10, padding: 10, background: "#fff" }}>
      <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{value}</div>
    </div>
  );
}
