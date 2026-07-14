import FcaBrandMark from "../../components/FcaBrandMark";
import MarketingPageShell from "../../components/MarketingPageShell";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicPackageRouteGroupsPanel from "../../components/PublicPackageRouteGroupsPanel";
import ProductProofSection from "../../components/ProductProofSection";
import {
  platformModules,
} from "../../websiteShell";
import { saasOperationalPathways } from "../../productBlueprint";
import { cardStyle, responsiveGrid } from "../../publicShellStyles";

const platformConstructionProof = [
  {
    title: "Opportunity qualification",
    detail: "Qualification board, estimate routing, and award-to-project handoff.",
    href: "/job-board",
    label: "Open job board",
  },
  {
    title: "Estimate and proposal progression",
    detail: "Pricing workflow from estimate through customer-ready proposal.",
    href: "/features",
    label: "See estimate workflow",
  },
  {
    title: "Project and document control",
    detail: "Projects, files, audit, and support in one connected workspace.",
    href: "/platform",
    label: "See project command",
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
      title="One platform for the full contractor lifecycle"
      subtitle="From first lead through closeout, billing, and workforce training — sign in to do the work, not just read about it."
      primaryHref="/intake"
      primaryLabel="Get started"
      secondaryHref="/login"
      secondaryLabel="Sign in to workspace"
      illustrationKey="platform"
    >
      <div style={{ ...cardStyle, marginBottom: 24, borderTop: "3px solid #2563eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
          <div style={{ color: "#2563eb", fontWeight: 700 }}>Public site vs live workspace</div>
          <FcaBrandMark compact />
        </div>
        <p style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860, marginBottom: 12 }}>
          This page sells the product. Your signed-in workspace is where you create bids, upload files, schedule crews, send invoices, and assign Academy courses.
        </p>
        <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/login?next=/portal/platform" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Sign in → open workspace</a>
          <a href="/login?next=/portal/billing" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Sign in → create an invoice</a>
          <a href="/login?next=/portal/files" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Sign in → manage files</a>
        </div>
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

      <PublicPackageRouteGroupsPanel
        eyebrow="SaaS route groups"
        title="Portal modules buyers activate after checkout"
        detail="Authenticated workspace routes for pipeline, projects, field, finance, academy, and admin control."
      />
    </MarketingPageShell>
  );
}
