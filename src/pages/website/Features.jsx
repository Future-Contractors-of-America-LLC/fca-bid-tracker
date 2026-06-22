import MarketingPageShell from "../../components/MarketingPageShell";
import { cardStyle, responsiveGrid } from "../../publicShellStyles";

const pillars = [
  {
    title: "Structured onboarding",
    detail: "Account-based intake creates a reliable start for every client engagement and routes straight into your workspace.",
  },
  {
    title: "Unified operating view",
    detail: "Project status, files, billing, messages, and audit history stay connected in one branded workspace.",
  },
  {
    title: "Guided execution",
    detail: "FCA preserves next actions, continuity, and execution quality across the full customer lifecycle.",
  },
  {
    title: "Academy-ready workforce",
    detail: "Apprenticeship, certification, and supervisor training live inside the same product your team uses on jobs.",
  },
  {
    title: "Mobile parity",
    detail: "Native iOS and Android apps reach the same platform for leads, jobs, plans, billing, and support.",
  },
  {
    title: "Revenue continuity",
    detail: "Pilot and startup activation connect intake to billing while preserving workspace login afterward.",
  },
];

export default function Features() {
  return (
    <MarketingPageShell
      eyebrow="Why FCA"
      title="Designed for contractors who need growth without operational chaos"
      subtitle="Contractor Command combines SaaS delivery, Academy training, guided operations, and customer-facing continuity in one system."
      primaryHref="/intake"
      primaryLabel="Get started"
      secondaryHref="/platform"
      secondaryLabel="See the platform"
    >
      <section style={{ ...responsiveGrid(), marginBottom: 8 }}>
        {pillars.map((item) => (
          <article key={item.title} style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>{item.title}</h3>
            <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 0 }}>{item.detail}</p>
          </article>
        ))}
      </section>
    </MarketingPageShell>
  );
}
