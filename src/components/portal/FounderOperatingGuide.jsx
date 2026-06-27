import { portalCardStyle, portalTokens } from "../../portalDesignTokens";
import { isFounderSession } from "../../customerSession";

const ENTRY_OFFERS = [
  {
    title: "Academy entry SKU",
    detail: "Sell courses and pathways to schools and students. Same FCA tenant — training connects to workspace when they upgrade.",
    href: "/academy/store",
    label: "Academy store",
  },
  {
    title: "Workspace entry SKU",
    detail: "Sell Contractor Command pilots and plans to contractors. Same FCA tenant — Academy included on growth plans.",
    href: "/pricing",
    label: "Pricing and checkout",
  },
  {
    title: "Auricrux operates the ecosystem",
    detail: "Execute and teach on real customer bids, files, and enrollments — embedded across every surface.",
    href: "/portal/auricrux",
    label: "Open Auricrux operator",
  },
  {
    title: "Verify unified checkout",
    detail: "One purchase activates the right capabilities on one tenant spine — workspace, academy, or both.",
    href: "/checkout?plan=startup",
    label: "Test Startup checkout ($99/mo)",
  },
];

export default function FounderOperatingGuide({ bidsCount = 0, companyName = "Your workspace", session = null }) {
  if (!isFounderSession(session)) return null;

  return (
    <div style={{ ...portalCardStyle, marginBottom: 16, border: "2px solid #1d4ed8" }}>
      <div style={{ color: "#1d4ed8", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
        FCA Contractor Command — founder operator
      </div>
      <h2 style={{ margin: "0 0 8px", color: portalTokens.primaryInk }}>{companyName}</h2>
      <p style={{ margin: "0 0 16px", color: "#475569", lineHeight: 1.7 }}>
        FCA is one connected ecosystem: operations, workforce training, Auricrux intelligence, comms, and billing on a single tenant spine.
        You sell entry SKUs to schools and contractors — you do not operate as an active GC.
        {bidsCount ? ` ${bidsCount} opportunit${bidsCount === 1 ? "y" : "ies"} on your spine.` : ""}
      </p>
      <div style={{ display: "grid", gap: 12 }}>
        {ENTRY_OFFERS.map((step) => (
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
