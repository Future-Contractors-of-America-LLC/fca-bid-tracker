export default function CustomerProductLaunchpad({ session, title = "Open live product surfaces" }) {
  if (!session?.authenticated) return null;

  const products = session.enabledProducts || {
    saas: true,
    lms: true,
    auricrux: true,
  };

  const cards = [
    {
      key: "saas",
      label: "SaaS workspace",
      href: "/portal/platform",
      cta: "Open SaaS Workspace",
      enabled: products.saas,
      detail: "Launch the live platform dashboard, portal workspace, bids, files, messages, billing, support, and admin surfaces.",
    },
    {
      key: "lms",
      label: "Academy / LMS",
      href: "/academy",
      cta: "Open Academy / LMS",
      enabled: products.lms,
      detail: "Launch the live academy product for onboarding, safety readiness, field continuity, and workforce enablement.",
    },
    {
      key: "auricrux",
      label: "Auricrux guidance",
      href: "/portal/auricrux",
      cta: "Open Auricrux",
      enabled: products.auricrux,
      detail: "Launch the live Auricrux guidance surface for blockers, next actions, continuity guidance, and operating-state narration.",
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
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Authenticated product launchpad</div>
      <h2 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h2>
      <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 14 }}>
        {session.workspaceLabel} can open real product surfaces directly from this authenticated customer session across SaaS workspace, Academy / LMS, and Auricrux.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {cards.map((card) => (
          <div key={card.key} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#111827" }}>
              {card.enabled ? "Enabled" : "Pending"}
            </div>
            <div style={{ color: "#475569", lineHeight: 1.6, marginBottom: 12 }}>{card.detail}</div>
            <a
              href={card.href}
              style={{
                display: "inline-block",
                textDecoration: "none",
                background: card.enabled ? "#111827" : "#cbd5e1",
                color: card.enabled ? "#fff" : "#475569",
                padding: "10px 14px",
                borderRadius: 10,
                fontWeight: 700,
                pointerEvents: card.enabled ? "auto" : "none",
              }}
            >
              {card.cta}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
