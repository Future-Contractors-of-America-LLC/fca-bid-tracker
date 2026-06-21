import FcaBrandMark from "../../components/FcaBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicActionRail from "../../components/PublicActionRail";
import ProductProofSection from "../../components/ProductProofSection";
import PublicPackageRouteGroupsPanel from "../../components/PublicPackageRouteGroupsPanel";
import PublicCtaRow from "../../components/PublicCtaRow";
import {
  platformJourneyPath,
  platformModules,
  publicRouteCtas,
  shellJourney,
} from "../../websiteShell";
import { saasOperationalPathways } from "../../productBlueprint";
import { cardStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle } from "../../publicShellStyles";

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
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="FCA Platform"
        title="One contractor lifecycle operating system"
        subtitle="One operating system for the full contractor lifecycle — from first lead through closeout, billing, and workforce training."
        primaryHref={publicRouteCtas.platform.primaryHref}
        primaryLabel={publicRouteCtas.platform.primaryLabel}
        secondaryHref={publicRouteCtas.platform.secondaryHref}
        secondaryLabel={publicRouteCtas.platform.secondaryLabel}
        journey={shellJourney}
        currentJourney="platform"
      />

      <div style={heroCardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
          <div style={{ color: "#2563eb", fontWeight: 700 }}>Platform overview</div>
          <FcaBrandMark compact />
        </div>
        <h2 style={{ marginTop: 0 }}>Built to feel like one connected system because the slices are actually reachable</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860, marginBottom: 12 }}>
          FCA helps contractor teams move from opportunity to delivery with real workflows for bids, estimates, proposals, projects, files, billing, support, Academy, and Auricrux guidance.
        </p>
        <PublicCtaRow
          actions={[
            { href: "/login?seeded=1", label: "Open Live Test Login", variant: "primary" },
            { href: "/academy/catalog", label: "Open Academy Catalog", variant: "secondary" },
          ]}
        />
      </div>

      <ProductProofSection
        eyebrow="Live product proof"
        title="Every claim points to a real route"
        detail="Open the same surfaces your team uses in production — qualification, estimates, projects, and training."
        highlights={platformConstructionProof}
      />

      <div style={{ marginTop: 24 }}>
        <PublicPackageRouteGroupsPanel
          eyebrow="Platform modules"
          title="Route groups behind the operating system"
          detail="SaaS, portal, Academy, Auricrux, and revenue continuity — all reachable from one shell."
        />
      </div>

      <div style={{ marginTop: 24, ...cardStyle }}>
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
              detail: "Opportunities, estimates, proposals, projects, files, communications, support, and billing — connected.",
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

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>How customers move through FCA</h2>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8 }}>
            {platformJourneyPath.map((item) => (
              <li key={item.step}>
                {item.prefix} <a href={item.href}>{item.label}</a>{item.suffix ? ` ${item.suffix}` : null}
              </li>
            ))}
            <li>Continue into Academy or Auricrux guidance without losing context.</li>
          </ol>
        </div>
        <WorkspaceSnapshotCard
          title="Live workspace preview"
          detail="See tenant and project context before you sign in."
          ctaHref="/login?seeded=1"
          ctaLabel="Open Live Test Login"
        />
      </div>

      <PublicActionRail
        title="Keep exploring the FCA platform"
        detail="Clear next steps from every public page into the product experience."
      />

      <ShellFooter />
    </div>
  );
}
