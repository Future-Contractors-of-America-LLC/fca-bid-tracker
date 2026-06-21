import FcaBrandMark from "../../components/FcaBrandMark";
import MarketingPageShell from "../../components/MarketingPageShell";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import ProductProofSection from "../../components/ProductProofSection";
import {
  platformModules,
  publicRouteCtas,
} from "../../websiteShell";
import { saasOperationalPathways } from "../../productBlueprint";
import { cardStyle, responsiveGrid } from "../../publicShellStyles";

const platformConstructionProof = [
  {
    title: "Opportunity qualification",
    detail: "Qualification board, estimate routing, and award-to-project handoff.",
    href: "/portal/bids",
    label: "Open Qualification Board",
  },
  {
    title: "Estimate and proposal progression",
    detail: "Pricing workflow from estimate through customer-ready proposal.",
    href: "/portal/estimates",
    label: "Open Estimate Workflow",
  },
  {
    title: "Project and document control",
    detail: "Projects, files, audit, and support in one operating spine.",
    href: "/portal/projects",
    label: "Open Project Command",
  },
  {
    title: "Academy depth",
    detail: "Training tracks tied to live portal routes.",
    href: "/academy/catalog",
    label: "Open Academy Catalog",
  },
];

export default function Platform() {
  return (
    <MarketingPageShell
      eyebrow="FCA Platform"
      title="One contractor lifecycle operating system"
      subtitle="One operating system for the full contractor lifecycle - from first lead through closeout, billing, and workforce training."
      primaryHref={publicRouteCtas.platform.primaryHref}
      primaryLabel={publicRouteCtas.platform.primaryLabel}
      secondaryHref={publicRouteCtas.platform.secondaryHref}
      secondaryLabel={publicRouteCtas.platform.secondaryLabel}
    >
      <div style={{ ...cardStyle, marginBottom: 24, borderTop: "3px solid #2563eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
          <div style={{ color: "#2563eb", fontWeight: 700 }}>Platform overview</div>
          <FcaBrandMark compact />
        </div>
        <p style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860, marginBottom: 0 }}>
          FCA helps contractor teams move from opportunity to delivery with real workflows for bids, estimates, proposals, projects, files, billing, support, Academy, and Auricrux guidance.
        </p>
      </div>

      <ProductProofSection
        eyebrow="Live product proof"
        title="Every claim points to a real route"
        detail="Open the same surfaces your team uses in production - qualification, estimates, projects, and training."
        highlights={platformConstructionProof}
      />

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Contractor pathways</div>
        <h2 style={{ marginTop: 0 }}>Route groups around real work</h2>
        <div style={{ ...responsiveGrid(240), marginTop: 16 }}>
          {saasOperationalPathways.map((pathway) => (
            <div key={pathway.title} style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#f8fbff" }}>
              <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>{pathway.audience}</div>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{pathway.title}</h3>
              <p style={{ color: "#475569", lineHeight: 1.7 }}>{pathway.outcome}</p>
              <a href={pathway.href} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{pathway.ctaLabel}</a>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <CustomerTrustPanel
          eyebrow="Why teams use FCA"
          title="A clearer path from bids to delivery"
          detail="Stay aligned, reduce follow-up work, and give customers better visibility into what happens next."
          items={[
            {
              title: "Track work in one place",
              detail: "Opportunities, estimates, proposals, projects, files, communications, support, and billing - connected.",
            },
            {
              title: "Stay ahead of blockers",
              detail: "See approvals, document gaps, billing readiness, and next steps before they become delays.",
            },
            {
              title: "Support rollout and training",
              detail: "Onboarding, academy access, safety reinforcement, and field readiness in the same flow.",
            },
          ]}
        />
      </div>

      <div style={{ ...responsiveGrid(220), marginTop: 28 }}>
        {platformModules.map((module) => (
          <div key={module.title} style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>{module.title}</h3>
            <p style={{ color: "#4b5563", lineHeight: 1.6, marginBottom: 0 }}>{module.detail}</p>
          </div>
        ))}
      </div>
    </MarketingPageShell>
  );
}
