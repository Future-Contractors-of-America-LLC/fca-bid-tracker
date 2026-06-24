import { portalButtonPrimary, portalCardStyle, portalEyebrowStyle, portalTokens } from "../portalDesignTokens";

export default function CustomerProductLaunchpad({
  session,
  title = "Your products",
  compact = false,
}) {
  if (!session?.authenticated) return null;

  const products = session.enabledProducts || {
    saas: true,
    lms: true,
    auricrux: true,
  };

  const cards = [
    {
      key: "saas",
      label: "Workspace",
      href: "/portal/platform",
      cta: "Open workspace",
      enabled: products.saas,
      detail: "Pipeline, projects, files, billing, and day-to-day operations.",
    },
    {
      key: "lms",
      label: "Academy",
      href: "/portal/academy",
      cta: "Open Academy",
      enabled: products.lms,
      detail: "Training tracks, safety readiness, onboarding, and certifications.",
    },
    {
      key: "auricrux",
      label: "Auricrux",
      href: "/portal/auricrux",
      cta: "Get guidance",
      enabled: products.auricrux,
      detail: "What to do next, what is blocked, and where to go in the workspace.",
    },
    {
      key: "comms",
      label: "Messages",
      href: "/portal/messages",
      cta: "Open messages",
      enabled: true,
      detail: "Team chat, email, SMS, phone, and meeting coordination.",
    },
  ];

  return (
    <section
      style={{
        ...portalCardStyle,
        marginBottom: compact ? 14 : 20,
        borderLeft: `4px solid ${portalTokens.primary}`,
        background: portalTokens.primarySoft,
      }}
    >
      <div style={portalEyebrowStyle}>Where to go</div>
      <h2 style={{ margin: "6px 0 8px", fontSize: compact ? "1.05rem" : "1.2rem" }}>{title}</h2>
      {!compact ? (
        <p style={{ color: portalTokens.body, lineHeight: 1.6, marginTop: 0, marginBottom: 14, fontSize: 14 }}>
          {session.workspaceLabel || session.company} has four product lanes. Open the one that matches what you need right now.
        </p>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {cards.map((card) => (
          <article
            key={card.key}
            style={{
              border: `1px solid ${portalTokens.border}`,
              borderRadius: 12,
              padding: 14,
              background: portalTokens.panel,
            }}
          >
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: portalTokens.muted, fontWeight: 700, marginBottom: 6 }}>
              {card.label}
            </div>
            <div style={{ fontSize: compact ? 18 : 22, fontWeight: 700, marginBottom: 8, color: portalTokens.ink }}>
              {card.enabled ? "Included" : "Pending setup"}
            </div>
            <p style={{ color: portalTokens.body, lineHeight: 1.55, marginTop: 0, marginBottom: 12, fontSize: 13 }}>{card.detail}</p>
            <a
              href={card.enabled ? card.href : "/portal/profile"}
              style={{
                ...portalButtonPrimary,
                display: "inline-block",
                background: card.enabled ? portalTokens.ink : "#cbd5e1",
                color: card.enabled ? "#fff" : "#475569",
                pointerEvents: card.enabled ? "auto" : "none",
                fontSize: 13,
                padding: "9px 12px",
              }}
            >
              {card.cta}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
