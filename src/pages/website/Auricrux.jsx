import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import MarketingPageShell from "../../components/MarketingPageShell";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicPackageRouteGroupsPanel from "../../components/PublicPackageRouteGroupsPanel";
import {
  auricruxCapabilities,
  auricruxWalkthroughPath,
  publicRouteCtas,
} from "../../websiteShell";
import { cardStyle, twoColumnGridStyle } from "../../publicShellStyles";

const operatingSteps = [
  "Knows your live bids, projects, and training progress — not generic FAQ answers.",
  "Tells your team exactly what to do next on every job.",
  "Works across estimating, delivery, billing, Academy, and support.",
  "Available on every page — click Ask Auricrux to start.",
];

export default function AuricruxPage() {
  return (
    <MarketingPageShell
      eyebrow="Auricrux AI Operator"
      title="Your AI operator for bids, jobs, billing, and training"
      subtitle="Auricrux answers questions, recommends next steps, and keeps your team moving — inside Contractor Command and Academy."
      primaryHref={publicRouteCtas.auricrux.primaryHref}
      primaryLabel={publicRouteCtas.auricrux.primaryLabel}
      secondaryHref={publicRouteCtas.auricrux.secondaryHref}
      secondaryLabel={publicRouteCtas.auricrux.secondaryLabel}
      illustrationKey="auricrux"
    >
      <div style={{ ...cardStyle, marginBottom: 24, borderTop: "3px solid #2563eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Always on, always in context</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>Auricrux works inside your live workspace</h2>
          </div>
          <AuricruxBrandMark />
        </div>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>
          Ask Auricrux what to do next on any bid, project, or training module. It reads your tenant state and gives actionable guidance — not generic marketing copy.
        </p>
      </div>

      <CustomerTrustPanel
        eyebrow="Why contractors use Auricrux"
        title="Close more work and deliver with less friction"
        detail="Auricrux helps owners, estimators, project coordinators, and field leads stay aligned without chasing updates across disconnected tools."
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

      <PublicPackageRouteGroupsPanel
        eyebrow="Intelligence coverage"
        title="Auricrux reads every governed route group"
        detail="Insight panels attach to projects, files, finance, field, academy, and admin surfaces across the FCA portal."
      />
    </MarketingPageShell>
  );
}
