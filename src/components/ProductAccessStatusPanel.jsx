export default function ProductAccessStatusPanel({ session, stateMeta }) {
  const sessionProducts = session?.enabledProducts;
  const stateProducts = stateMeta?.enabledProducts;

  if (!session?.authenticated && !stateProducts) return null;

  const products = {
    saas: sessionProducts?.saas ?? stateProducts?.saas ?? true,
    lms: sessionProducts?.lms ?? stateProducts?.lms ?? true,
    auricrux: sessionProducts?.auricrux ?? stateProducts?.auricrux ?? true,
  };

  const cards = [
    {
      label: "SaaS workspace",
      status: products.saas ? "Enabled" : "Pending",
      detail: "Portal workspace, bids, files, messages, billing, support, admin, and dashboard continuity.",
    },
    {
      label: "Academy / LMS",
      status: products.lms ? "Enabled" : "Pending",
      detail: "Training tracks, safety readiness, onboarding continuity, and workforce enablement.",
    },
    {
      label: "Auricrux guidance",
      status: products.auricrux ? "Enabled" : "Pending",
      detail: "Next actions, blocker visibility, continuity guidance, and operating-state narration across the shell.",
    },
  ];

  return (
    <div
      style={{
        border: "1px solid #dbe3ef",
        borderRadius: 16,
        padding: 18,
        background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
        boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
        marginBottom: 24,
      }}
    >
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live customer product access</div>
      <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 14 }}>
        {(session?.workspaceLabel || stateMeta?.customerWorkspaceLabel || "Authenticated workspace")} is authenticated as {(session?.role || stateMeta?.customerRole || "Owner / Admin")}. This customer session has live product continuity across SaaS workspace, Academy/LMS, and Auricrux guidance.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {cards.map((card) => (
          <div key={card.label} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#111827" }}>{card.status}</div>
            <div style={{ color: "#475569", lineHeight: 1.6 }}>{card.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
