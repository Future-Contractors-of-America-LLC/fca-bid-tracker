import { portalCardStyle, portalTokens } from "../portalDesignTokens";

const STEPS = [
  {
    title: "1. Create a real opportunity",
    detail: "Portal → Bids → Add your first real opportunity. Use a package you are actually pursuing — not seeded demo data.",
    href: "/portal/bids",
    label: "Open Bids",
  },
  {
    title: "2. Run Auricrux on that bid",
    detail: "Select the bid → Run with Auricrux. This executes intake, briefing, and teach-back on your spine.",
    href: "/portal/bids",
    label: "Run operator",
  },
  {
    title: "3. Walk the commercial pipeline",
    detail: "Portal → Pipeline → qualify, award to project, estimate, invoice, payment on the same job.",
    href: "/portal/pipeline",
    label: "Open Pipeline",
  },
  {
    title: "4. Register files and briefings",
    detail: "Portal → Files → register artifacts, link evidence, generate plan briefing on the active project.",
    href: "/portal/files",
    label: "Open Files",
  },
];

export default function FounderOperatingGuide({ bidsCount = 0, companyName = "Your workspace" }) {
  return (
    <div style={{ ...portalCardStyle, marginBottom: 16, border: "2px solid #1d4ed8" }}>
      <div style={{ color: "#1d4ed8", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
        First customer operating guide
      </div>
      <h2 style={{ margin: "0 0 8px", color: portalTokens.primaryInk }}>{companyName} — production workspace</h2>
      <p style={{ margin: "0 0 16px", color: "#475569", lineHeight: 1.7 }}>
        Your account is production, not a demo sandbox. {bidsCount ? `You have ${bidsCount} live opportunit${bidsCount === 1 ? "y" : "ies"} on the spine.` : "Start by creating your first real bid below."}
        {" "}What works today: bids, pipeline, files, Auricrux execute/teach on those surfaces. Finance depth and field modules are still expanding.
      </p>
      <div style={{ display: "grid", gap: 12 }}>
        {STEPS.map((step) => (
          <div key={step.title} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
            <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>{step.title}</div>
            <p style={{ margin: "0 0 10px", color: "#475569", lineHeight: 1.6, fontSize: 14 }}>{step.detail}</p>
            <a href={step.href} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
              {step.label} →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
