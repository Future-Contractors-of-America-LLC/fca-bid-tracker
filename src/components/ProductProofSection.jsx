import { cardStyle, ctaPrimaryStyle, responsiveGrid } from "../publicShellStyles";

const defaultHighlights = [
  {
    title: "Platform dashboard",
    detail:
      "Show the live operating summary for tenant, project, blockers, academy continuity, and executive next actions.",
    href: "/portal/platform",
    label: "Open Platform Dashboard",
  },
  {
    title: "Portal workspace",
    detail:
      "Move directly into projects, files, messages, bids, billing, support, and admin surfaces without leaving the FCA shell.",
    href: "/portal",
    label: "Open Portal Workspace",
  },
  {
    title: "Bid continuity",
    detail:
      "Use the canonical FCA bid entry and status routes so sales, intake, and follow-through remain product-visible.",
    href: "/bid-entry",
    label: "Open Bid Entry",
  },
  {
    title: "Academy continuity",
    detail:
      "Keep workforce readiness and customer delivery attached to the same operating story instead of splitting training off as a side tool.",
    href: "/academy",
    label: "Open Academy",
  },
];

export default function ProductProofSection({
  eyebrow = "Product proof",
  title = "The public site now proves the product instead of only describing it",
  detail = "These routes keep live product movement visible so buyers can validate FCA as an operating system, not a brochure.",
  highlights = defaultHighlights,
}) {
  return (
    <section style={{ marginTop: 24 }}>
      <div
        style={{
          ...cardStyle,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          border: "1px solid #1e3a8a",
        }}
      >
        <div style={{ color: "#93c5fd", fontWeight: 700, marginBottom: 8 }}>{eyebrow}</div>
        <h2 style={{ marginTop: 0, marginBottom: 12, color: "#ffffff" }}>{title}</h2>
        <p style={{ marginTop: 0, marginBottom: 0, color: "#dbeafe", lineHeight: 1.7 }}>{detail}</p>
      </div>

      <div style={{ ...responsiveGrid(240), marginTop: 16 }}>
        {highlights.map((item) => (
          <div key={`${item.title}-${item.href}`} style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>{item.title}</h3>
            <p style={{ color: "#475569", lineHeight: 1.6 }}>{item.detail}</p>
            <a href={item.href} style={ctaPrimaryStyle}>
              {item.label}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
