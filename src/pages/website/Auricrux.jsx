import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import MarketingPageShell from "../../components/MarketingPageShell";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import {
  auricruxCapabilities,
  auricruxWalkthroughPath,
  publicRouteCtas,
} from "../../websiteShell";
import { cardStyle, twoColumnGridStyle } from "../../publicShellStyles";

const operatingSteps = [
  "Reads your live tenant, project, and bid state - not static marketing pages.",
  "Surfaces the recommended next action so teams know what to do next.",
  "Stays with you across dashboard, portal, Academy, support, and admin.",
  "Feels active and operational - not a brochure.",
];

export default function AuricruxPage() {
  return (
    <MarketingPageShell
      eyebrow="Auricrux Guidance"
      title="Auricrux stays active across the FCA experience"
      subtitle="The visible guidance layer that reads state, explains continuity, recommends next actions, and keeps teams aligned across the workspace."
      primaryHref={publicRouteCtas.auricrux.primaryHref}
      primaryLabel={publicRouteCtas.auricrux.primaryLabel}
      secondaryHref={publicRouteCtas.auricrux.secondaryHref}
      secondaryLabel={publicRouteCtas.auricrux.secondaryLabel}
      illustrationKey="auricrux"
    >
      <div style={{ ...cardStyle, marginBottom: 24, borderTop: "3px solid #2563eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Guided visibility</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>Auricrux is part of the product experience</h2>
          </div>
          <AuricruxBrandMark />
        </div>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>
          Auricrux keeps tenant, project, route, and next-step context visible as users move through estimating, approvals, document control, billing follow-through, and workforce readiness.
        </p>
      </div>

      <CustomerTrustPanel
        eyebrow="What Auricrux improves"
        title="Guidance that helps contractor teams stay aligned"
        detail="Auricrux helps teams understand what needs attention next without forcing owners, estimators, project coordinators, or field leads to piece the workflow together on their own."
        items={[
          {
            title: "Clarify next steps",
            detail: "Highlight approvals, missing documents, billing readiness, and customer follow-ups before they become delays.",
          },
          {
            title: "Preserve continuity",
            detail: "Carry context between bids, projects, files, billing, Academy, and support without losing thread.",
          },
          {
            title: "Support rollout",
            detail: "Help new teams learn the workspace faster with contextual guidance tied to live routes.",
          },
        ]}
      />

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>What makes it operational</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9, marginBottom: 0 }}>
            {operatingSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Core capabilities</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9, marginBottom: 0 }}>
            {auricruxCapabilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Where customers see it</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9, marginBottom: 0 }}>
            <li>Persistent dock across the experience</li>
            <li>Platform dashboard next-action visibility</li>
            <li>Portal route guidance and continuity</li>
            <li>Academy coaching continuity</li>
            <li>Support and admin context</li>
          </ul>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Suggested walkthrough path</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {auricruxWalkthroughPath.map((item) => (
              <a
                key={item.step}
                href={item.href}
                style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}
              >
                {item.step}. {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </MarketingPageShell>
  );
}
