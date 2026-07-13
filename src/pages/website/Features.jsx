import MarketingPageShell from "../../components/MarketingPageShell";
import { cardStyle, responsiveGrid } from "../../publicShellStyles";

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
    detail: "Job cost, contractor books, invoices, and payment follow-through keep money attached to the work.",
  },
  {
    title: "Academy-ready workforce",
    detail: "1,245 apprenticeship, certification, degree, licensure, and CTE programs live inside the same product your team uses on jobs.",
  },
  {
    title: "Mobile companion",
    detail: "The FCA mobile app reaches the same platform for leads, jobs, billing, and support — Android first, with iOS following App Store signing.",
  },
];

const buyerBenefits = [
  {
    title: "Win work faster",
    detail: "Capture leads, qualify bids, estimate, and send proposals without bouncing between tools.",
  },
  {
    title: "Run jobs cleanly",
    detail: "Projects, schedules, field photos, RFIs, and closeout stay linked to the same job record.",
  },
  {
    title: "Get paid with less friction",
    detail: "Create invoices, deliver bills, and track collections from the same workspace your crews already use.",
  },
  {
    title: "Train the same workforce",
    detail: "Academy and CTE sit beside the work — not in a disconnected LMS.",
  },
];

export default function Features() {
  return (
    <MarketingPageShell
      eyebrow="Why FCA"
      title="Built for contractors who need growth without operational chaos"
      subtitle="One contractor platform for sales, delivery, billing, and training — so your team stops stitching tools together."
      primaryHref="/intake"
      primaryLabel="Get started"
      secondaryHref="/platform"
      secondaryLabel="See the platform"
      illustrationKey="features"
    >
      <section style={{ ...cardStyle, marginBottom: 20, borderTop: "3px solid #2563eb" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>What customers buy</div>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>A complete contractor workspace</h2>
        <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 14 }}>
          This public site explains the product. After you sign in, your live workspace is where your team creates jobs, files, schedules, invoices, and training progress.
        </p>
        <div style={{ ...responsiveGrid(220), marginBottom: 0 }}>
          {buyerBenefits.map((item) => (
            <article key={item.title} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fbff" }}>
              <h3 style={{ marginTop: 0, marginBottom: 6, fontSize: "1rem" }}>{item.title}</h3>
              <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.55, marginBottom: 0 }}>{item.detail}</p>
            </article>
          ))}
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
