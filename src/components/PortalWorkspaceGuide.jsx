import { portalButtonSecondary, portalCardStyle, portalEyebrowStyle, portalTokens } from "../portalDesignTokens";

const guideSteps = [
  {
    step: "1",
    title: "Set up your account",
    detail: "Confirm company, plan, and which products are turned on for your team.",
    href: "/portal/profile",
    label: "Open profile",
  },
  {
    step: "2",
    title: "Work your pipeline",
    detail: "Qualify leads, track bids, and move awarded work into active projects.",
    href: "/portal/pipeline",
    label: "Open pipeline",
  },
  {
    step: "3",
    title: "Run the job",
    detail: "Files, RFIs, change orders, field tasks, and closeout live on the project.",
    href: "/portal/projects",
    label: "Open projects",
  },
  {
    step: "4",
    title: "Handle money",
    detail: "Payments, job costs, pay apps, and banking in FCA Books.",
    href: "/portal/finance",
    label: "Open finance",
  },
  {
    step: "5",
    title: "Ask Auricrux",
    detail: "Not sure what to do? Auricrux shows blockers, next steps, and where to click.",
    href: "/portal/auricrux",
    label: "Open Auricrux",
  },
  {
    step: "6",
    title: "Train your crew",
    detail: "Assign Academy tracks for onboarding, safety, and field skills.",
    href: "/portal/academy",
    label: "Open Academy",
  },
];

export default function PortalWorkspaceGuide({ compact = false }) {
  return (
    <section style={{ ...portalCardStyle, marginBottom: 16, borderLeft: `4px solid ${portalTokens.primary}` }}>
      <div style={portalEyebrowStyle}>Getting started</div>
      <h2 style={{ margin: "6px 0 8px", fontSize: compact ? "1.05rem" : "1.2rem" }}>
        How to use FCA — follow this sequence
      </h2>
      <p style={{ color: portalTokens.body, lineHeight: 1.6, marginTop: 0, marginBottom: 14, fontSize: 14 }}>
        Start with setup, move work through pipeline and projects, then use Auricrux whenever you need direction.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {guideSteps.map((item) => (
          <article
            key={item.step}
            style={{
              border: `1px solid ${portalTokens.border}`,
              borderRadius: 12,
              padding: 14,
              background: portalTokens.panel,
            }}
          >
            <div style={{ fontWeight: 800, color: portalTokens.primaryInk, marginBottom: 6 }}>Step {item.step}</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
            <p style={{ color: portalTokens.body, fontSize: 13, lineHeight: 1.55, marginTop: 0, marginBottom: 10 }}>{item.detail}</p>
            <a href={item.href} style={portalButtonSecondary}>{item.label}</a>
          </article>
        ))}
      </div>
    </section>
  );
}
