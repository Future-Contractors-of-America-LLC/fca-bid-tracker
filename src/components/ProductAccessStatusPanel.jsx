import { resolvePlanPreset } from "../pricingPlans";
import { portalButtonSecondary, portalCardStyle, portalEyebrowStyle, portalTokens } from "../portalDesignTokens";

function summarizeEnabledComms(enabledComms = {}) {
  return Object.entries(enabledComms)
    .filter(([, enabled]) => enabled !== false)
    .map(([key]) => key)
    .join(", ") || "None enabled";
}

const productLinks = {
  saas: { href: "/portal/platform", label: "Open workspace" },
  lms: { href: "/portal/academy", label: "Open Academy" },
  auricrux: { href: "/portal/auricrux", label: "Get guidance" },
};

export default function ProductAccessStatusPanel({ session, stateMeta }) {
  const sessionProducts = session?.enabledProducts;
  const stateProducts = stateMeta?.enabledProducts;
  const sessionComms = session?.enabledComms;
  const stateComms = stateMeta?.enabledComms;
  const selectedPlanKey = session?.selectedPlan || stateMeta?.selectedPlan || "startup";
  const selectedPlan = resolvePlanPreset(selectedPlanKey);

  if (!session?.authenticated && !stateProducts) return null;

  const products = {
    saas: sessionProducts?.saas ?? stateProducts?.saas ?? true,
    lms: sessionProducts?.lms ?? stateProducts?.lms ?? true,
    auricrux: sessionProducts?.auricrux ?? stateProducts?.auricrux ?? true,
  };

  const enabledComms = {
    chat: sessionComms?.chat ?? stateComms?.chat ?? true,
    sms: sessionComms?.sms ?? stateComms?.sms ?? true,
    phone: sessionComms?.phone ?? stateComms?.phone ?? true,
    email: sessionComms?.email ?? stateComms?.email ?? true,
    teams: sessionComms?.teams ?? stateComms?.teams ?? true,
    conference: sessionComms?.conference ?? stateComms?.conference ?? true,
    lecture: sessionComms?.lecture ?? stateComms?.lecture ?? true,
  };

  const cards = [
    {
      key: "plan",
      label: "Your plan",
      status: `${selectedPlan.name} · ${selectedPlan.price}`,
      detail: `Billed as ${selectedPlan.billingModel.toLowerCase()}. Change plans anytime from profile or billing.`,
      href: "/portal/plans",
      linkLabel: "View plans",
    },
    {
      key: "saas",
      label: "Workspace",
      status: products.saas ? "Included" : "Not enabled",
      detail: "Pipeline, projects, files, billing, and daily operations.",
      href: productLinks.saas.href,
      linkLabel: productLinks.saas.label,
      enabled: products.saas,
    },
    {
      key: "lms",
      label: "Academy",
      status: products.lms ? "Included" : "Not enabled",
      detail: "Training tracks, safety, onboarding, and certifications.",
      href: productLinks.lms.href,
      linkLabel: productLinks.lms.label,
      enabled: products.lms,
    },
    {
      key: "auricrux",
      label: "Auricrux",
      status: products.auricrux ? "Included" : "Not enabled",
      detail: "What to do next, blockers, and where to go in the workspace.",
      href: productLinks.auricrux.href,
      linkLabel: productLinks.auricrux.label,
      enabled: products.auricrux,
    },
    {
      key: "comms",
      label: "Message channels",
      status: summarizeEnabledComms(enabledComms),
      detail: "Chat, SMS, phone, email, Teams, conference, and lecture.",
      href: "/portal/messages",
      linkLabel: "Open messages",
      enabled: true,
    },
  ];

  return (
    <section style={{ ...portalCardStyle, marginBottom: 24, borderLeft: `4px solid ${portalTokens.primary}`, background: portalTokens.primarySoft }}>
      <div style={portalEyebrowStyle}>Your FCA access</div>
      <h2 style={{ margin: "6px 0 8px", fontSize: "1.15rem" }}>One ecosystem — workspace, academy, Auricrux</h2>
      <p style={{ color: portalTokens.body, lineHeight: 1.65, marginTop: 0, marginBottom: 14, fontSize: 14 }}>
        FCA Contractor Command is a single product. Purchases activate capabilities on one tenant spine.
        {(session?.workspaceLabel || stateMeta?.customerWorkspaceLabel || "Your workspace")} · signed in as {(session?.role || stateMeta?.customerRole || "Owner / Admin")}.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {cards.map((card) => (
          <article key={card.key} style={{ border: `1px solid ${portalTokens.border}`, borderRadius: 12, padding: 14, background: portalTokens.panel }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: portalTokens.muted, fontWeight: 700, marginBottom: 6 }}>
              {card.label}
            </div>
            <div style={{ fontSize: card.key === "comms" ? 15 : 20, fontWeight: 700, marginBottom: 8, color: portalTokens.ink, textTransform: card.key === "comms" ? "none" : "initial" }}>
              {card.status}
            </div>
            <p style={{ color: portalTokens.body, lineHeight: 1.6, marginTop: 0, marginBottom: 10, fontSize: 13 }}>{card.detail}</p>
            {card.href ? (
              <a href={card.enabled === false ? "/portal/profile" : card.href} style={portalButtonSecondary}>
                {card.linkLabel}
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
