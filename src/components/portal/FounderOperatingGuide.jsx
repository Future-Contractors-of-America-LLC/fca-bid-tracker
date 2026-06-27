import { portalCardStyle, portalTokens } from "../portalDesignTokens";

const REVENUE_PATHS = [
  {
    title: "Sell Academy (your lane as an instructor)",
    detail: "Trade school students and programs buy courses/pathways. Store → checkout → auto-enroll → first module. Pitch your school network — you do not need active construction bids.",
    href: "/academy/store",
    label: "Open Academy Store",
  },
  {
    title: "Sell Contractor Command (SaaS)",
    detail: "Contractors buy workspace pilots ($2,500) or monthly plans. They run bids — you operate FCA as vendor. Pricing → checkout → workspace activation.",
    href: "/pricing",
    label: "Open pricing",
  },
  {
    title: "Operate Auricrux on customer work",
    detail: "When a SaaS customer is onboarded, run execute/teach on their bids and files — not on fake demo packages.",
    href: "/portal/auricrux",
    label: "Open Auricrux operator",
  },
  {
    title: "Verify commerce end-to-end",
    detail: "Buy one course with your email, confirm enrollment, open module 1. If any step fails, that is the priority fix — not more demo polish.",
    href: "/checkout?program=electrical-apprenticeship-level-1",
    label: "Test academy checkout",
  },
];

export default function FounderOperatingGuide({ bidsCount = 0, companyName = "Your workspace" }) {
  return (
    <div style={{ ...portalCardStyle, marginBottom: 16, border: "2px solid #1d4ed8" }}>
      <div style={{ color: "#1d4ed8", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
        FCA revenue operating guide
      </div>
      <h2 style={{ margin: "0 0 8px", color: portalTokens.primaryInk }}>{companyName} — founder operator</h2>
      <p style={{ margin: "0 0 16px", color: "#475569", lineHeight: 1.7 }}>
        You are not customer #1 as an active GC. You are founder #1: sell Academy to students and schools, sell Contractor Command to contractors, and run Auricrux across real paying tenants.
        {bidsCount ? ` ${bidsCount} opportunit${bidsCount === 1 ? "y" : "ies"} on your spine.` : ""}
      </p>
      <div style={{ display: "grid", gap: 12 }}>
        {REVENUE_PATHS.map((step) => (
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
