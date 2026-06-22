import MarketingPageShell from "../../components/MarketingPageShell";
import { cardStyle, responsiveGrid } from "../../publicShellStyles";

const programs = [
  {
    title: "Contractor Command Pilot",
    detail: "Guided 30-day launch for teams moving from fragmented tools into one FCA workspace.",
    href: "/intake?plan=pilot",
    label: "Start pilot intake",
  },
  {
    title: "Startup Workspace",
    detail: "Self-serve activation for owner-led teams ready for bids, projects, files, billing, and academy continuity.",
    href: "/intake?plan=startup",
    label: "Start startup intake",
  },
  {
    title: "Growth Team Program",
    detail: "Increase bid conversion, estimate packaging, and customer handoff quality across sales and delivery.",
    href: "/contact",
    label: "Discuss growth rollout",
  },
  {
    title: "Scaled Rollout Program",
    detail: "Standardize delivery across business units with portal, audit, support, and academy governance.",
    href: "/contact",
    label: "Book rollout walkthrough",
  },
  {
    title: "Academy Apprenticeship Track",
    detail: "Trade apprenticeship pathways with live LMS tracking across certification and field readiness.",
    href: "/academy",
    label: "Open Academy",
  },
  {
    title: "Guided Operations",
    detail: "Embedded guidance across intake, field operations, billing, and customer communications.",
    href: "/auricrux",
    label: "Learn about Auricrux",
  },
];

export default function Solutions() {
  return (
    <MarketingPageShell
      eyebrow="Programs"
      title="Program options that match team maturity and growth goals"
      subtitle="Every program routes into the same FCA product surface on web and mobile - leads, jobs, plans, billing, and training in one place."
      primaryHref="/intake"
      primaryLabel="Get started"
      secondaryHref="/contact"
      secondaryLabel="Talk to our team"
    >
      <section style={{ ...responsiveGrid(), marginBottom: 8 }}>
        {programs.map((item) => (
          <article key={item.title} style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>{item.title}</h3>
            <p style={{ color: "#475569", lineHeight: 1.7 }}>{item.detail}</p>
            <a href={item.href} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
              {item.label}
            </a>
          </article>
        ))}
      </section>
    </MarketingPageShell>
  );
}
