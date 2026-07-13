import MarketingPageShell from "../../components/MarketingPageShell";
import { cardStyle, responsiveGrid } from "../../publicShellStyles";
import {
  CAPABILITY_DOMAINS,
  CAPABILITIES,
  buildAuricruxCapabilityBrief,
} from "../../capabilityCatalog";

const pillars = [
  {
    title: "Structured onboarding",
    detail: "Account-based intake creates a reliable start for every client engagement and routes straight into your workspace.",
  },
  {
    title: "End-to-end job control",
    detail: "Leads, bids, estimates, projects, RFIs, change orders, field tasks, punch, scheduling, and closeout stay connected in one workspace.",
  },
  {
    title: "Plans, design, and immersive review",
    detail: "Plan rooms, design markup, and immersive/WebXR review sit beside delivery — not as a separate stack.",
  },
  {
    title: "Finance and billing",
    detail: "Job cost, FCA Books finance surfaces, pay apps, and billing continuity keep money attached to the work.",
  },
  {
    title: "Academy-ready workforce",
    detail: "1,245 apprenticeship, certification, degree, licensure, and CTE programs live inside the same product your team uses on jobs.",
  },
  {
    title: "Mobile companion (Android first)",
    detail: "The FCA mobile app reaches the same Track A platform for leads, jobs, billing, and support. iOS App Store release follows signing completion.",
  },
];

export default function Features() {
  const brief = buildAuricruxCapabilityBrief();

  return (
    <MarketingPageShell
      eyebrow="Why FCA"
      title="Designed for contractors who need growth without operational chaos"
      subtitle="If construction software, AI, or computers can beneficially do it — FCA claims it, makes it obvious, and Auricrux teaches, advises, and automates it."
      primaryHref="/intake"
      primaryLabel="Get started"
      secondaryHref="/login?next=/portal/capabilities"
      secondaryLabel="See all capabilities"
      illustrationKey="features"
    >
      <section style={{ ...cardStyle, marginBottom: 20, borderTop: "3px solid #2563eb" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Construction OS coverage</div>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>
          {brief.total} capabilities across {brief.domains} domains
        </h2>
        <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 14 }}>
          {brief.doctrine} After sign-in, open the searchable directory at /portal/capabilities. Customize how your account acts at /portal/profile.
        </p>
        <div style={{ ...responsiveGrid(200), marginBottom: 0 }}>
          {CAPABILITY_DOMAINS.map((domain) => {
            const count = CAPABILITIES.filter((item) => item.domain === domain.id).length;
            return (
              <article key={domain.id} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fbff" }}>
                <h3 style={{ marginTop: 0, marginBottom: 6, fontSize: "1rem" }}>{domain.label}</h3>
                <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.55, marginBottom: 8 }}>{domain.summary}</p>
                <div style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13 }}>{count} capabilities</div>
              </article>
            );
          })}
        </div>
        <div style={{ marginTop: 16 }}>
          <a href="/login?next=/portal/capabilities" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
            Sign in → open capability directory →
          </a>
        </div>
      </section>

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
