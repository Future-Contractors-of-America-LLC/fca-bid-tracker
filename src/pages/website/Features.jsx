import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import PublicCtaRow from "../../components/PublicCtaRow";
import { homeCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { cardStyle, pageShellStyle, responsiveGrid } from "../../publicShellStyles";

const pillars = [
  {
    title: "Structured onboarding",
    detail: "Account-based intake creates a reliable start for every client engagement and posts directly to Auricrux-Central.",
  },
  {
    title: "Unified operating view",
    detail: "Project status, files, billing, messages, and audit history stay connected in one branded workspace.",
  },
  {
    title: "Auricrux system control",
    detail: "Auricrux preserves next actions, continuity, and execution quality across the full customer lifecycle.",
  },
  {
    title: "Academy-ready workforce",
    detail: "Electrical apprenticeship L1-L10 and launch classrooms train teams inside the same product surface.",
  },
  {
    title: "Mobile parity",
    detail: "iOS and Android apps reach the same central backend for intake, projects, academy, billing, and support.",
  },
  {
    title: "Revenue continuity",
    detail: "Pilot and startup checkout lanes connect intake to Stripe while preserving workspace login afterward.",
  },
];

export default function Features() {
  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow="Why FCA"
        title="Designed for contractors who need growth without operational chaos"
        subtitle="FCA Contractor Command combines SaaS delivery, Academy training, Auricrux guidance, and customer-facing continuity in one system."
        primaryHref="/intake"
        primaryLabel="Apply Now"
        secondaryHref="/portal/platform"
        secondaryLabel="Open Platform Dashboard"
        journey={shellJourney}
        currentJourney="conversion"
      />

      <section style={{ ...responsiveGrid, marginBottom: 24 }}>
        {pillars.map((item) => (
          <article key={item.title} style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>{item.title}</h3>
            <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 0 }}>{item.detail}</p>
          </article>
        ))}
      </section>

      <PublicCtaRow actions={homeCtaSets.productionClose} />
      <ShellFooter />
    </div>
  );
}
