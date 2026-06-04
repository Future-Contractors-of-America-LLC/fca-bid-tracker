import AuricruxTrustInsight from "./AuricruxTrustInsight";

const panelStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  padding: 18,
  background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const itemStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
  background: "#fff",
};

const defaultItems = [
  {
    title: "Keep customers informed",
    detail: "Share project progress, files, and updates without bouncing between disconnected tools.",
  },
  {
    title: "Reduce follow-up work",
    detail: "Keep bids, approvals, messages, and billing steps visible so teams know what needs attention next.",
  },
  {
    title: "Support field readiness",
    detail: "Connect onboarding, training, and certification visibility to the same operating workflow.",
  },
];

export default function CustomerTrustPanel({
  eyebrow = "Built for contractor teams",
  title = "What FCA helps you do",
  detail = "FCA is designed to give customers and internal teams a clearer path from opportunity to delivery.",
  items = defaultItems,
}) {
  return (
    <div style={panelStyle}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>{eyebrow}</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h2>
        <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 0, maxWidth: 860 }}>{detail}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {items.map((item) => (
          <div key={item.title} style={itemStyle}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: "#111827" }}>{item.title}</div>
            <div style={{ color: "#4b5563", lineHeight: 1.6 }}>{item.detail}</div>
          </div>
        ))}
      </div>

      <AuricruxTrustInsight mode="trust" primaryHref="/portal/platform" primaryLabel="Open Platform Dashboard" />
    </div>
  );
}
