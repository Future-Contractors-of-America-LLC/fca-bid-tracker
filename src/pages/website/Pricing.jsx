import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import ExecutiveSignalBar from "../../components/ExecutiveSignalBar";
import CommercialReadinessPanel from "../../components/CommercialReadinessPanel";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicOperationsStrip from "../../components/PublicOperationsStrip";
import ProductProofSection from "../../components/ProductProofSection";
import { executiveSignalCtaSets, founderJourneyCtaSets, pricingTiers, publicActionCatalog, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { publicPricingMessaging } from "../../systemContinuity";
import { cardStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle, ctaPrimaryStyle } from "../../publicShellStyles";

const rolloutSteps = [
  "Confirm contractor fit, pilot scope, and current operating friction.",
  "Walk the live FCA experience from public entry through workspace, platform dashboard, portal, academy, and bid continuity.",
  "Select the rollout tier that matches readiness, team size, product depth, and communications needs.",
  "Close on the next deployment action, pricing path, and rollout planning sequence.",
];

const pricingContinuityItems = [
  {
    label: "Rollout path",
    value: "Plans map to operating readiness",
    detail: "Pricing now reads as deployment sequencing rather than a detached brochure table.",
  },
  {
    label: "Commercial state",
    value: "Actual price + actual products",
    detail: "The route now keeps concrete monthly pricing and included customer products visible before the next commercial step.",
  },
  {
    label: "Shared narrative",
    value: "Public shell stays product-aware",
    detail: "Pricing continues the same platform, academy, portal, and communications continuity story instead of restarting from zero.",
  },
];

const pricingProductProof = [
  {
    title: "Validate live operating state",
    detail: "Open the platform dashboard during pricing review so commercial discussion stays attached to product proof.",
    href: "/portal/platform",
    label: "Open Platform Dashboard",
  },
  {
    title: "Show customer workspace depth",
    detail: "Use the portal shell to demonstrate the product that the rollout tiers are funding and sequencing.",
    href: "/portal",
    label: "Open Portal Workspace",
  },
  {
    title: "Prove bid continuity",
    detail: "Bring the canonical bid route into the conversation so pilot and rollout scope are tied to a real production flow.",
    href: "/bid-entry",
    label: "Open Bid Entry",
  },
  {
    title: "Keep academy and comms in scope",
    detail: "Training, lecture continuity, and communications routing stay inside the same product story, which makes rollout planning more credible.",
    href: "/academy",
    label: "Open Academy",
  },
];

const productPackages = [
  {
    title: "FCA SaaS Workspace",
    detail: "Projects, bids, files, billing, support, admin, and dashboard continuity for daily contractor operations.",
  },
  {
    title: "Customer Portal",
    detail: "Customer-facing visibility into projects, files, statuses, messages, and next actions inside the same workspace.",
  },
  {
    title: "Academy / LMS",
    detail: "Onboarding, safety reinforcement, workforce readiness, and lecture continuity tied directly to delivery rollout.",
  },
  {
    title: "Auricrux + Comms",
    detail: "Guided next actions plus routed chat, SMS, phone, email, Teams, conference, and lecture channels according to plan depth.",
  },
];

export default function Pricing() {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow={publicPricingMessaging.header.eyebrow}
        title={publicPricingMessaging.header.title}
        subtitle={publicPricingMessaging.header.subtitle}
        primaryHref={shellHeaderCtaSets.conversion.primaryHref}
        primaryLabel={shellHeaderCtaSets.conversion.primaryLabel}
        secondaryHref={shellHeaderCtaSets.conversion.secondaryHref}
        secondaryLabel={shellHeaderCtaSets.conversion.secondaryLabel}
        journey={shellJourney}
        currentJourney="conversion"
      />

      <div style={{ ...heroCardStyle, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Production planning flow</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>{publicPricingMessaging.hero.title}</h2>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <FcaBrandMark compact />
            <AuricruxBrandMark compact />
          </div>
        </div>
        <p style={{ lineHeight: 1.7, color: "#334155", maxWidth: 860, marginBottom: 0 }}>
          {publicPricingMessaging.hero.detail}
        </p>
      </div>

      <FounderJourneyStrip
        currentJourney="conversion"
        title={publicPricingMessaging.journey.title}
        detail={publicPricingMessaging.journey.detail}
        ctaHref={founderJourneyCtaSets.conversion.href}
        ctaLabel={founderJourneyCtaSets.conversion.label}
      />

      <ExecutiveSignalBar mode="public" nextHref={executiveSignalCtaSets.conversion.href} nextLabel={executiveSignalCtaSets.conversion.label} />

      <div style={{ marginBottom: 24 }}>
        <PublicOperationsStrip
          eyebrow="Pricing continuity strip"
          title="Pricing is now framed as rollout control, not isolated packaging"
          detail="The pricing route now carries a shared operating strip so commercial review stays tied to workspace readiness, founder walkthrough, and production next actions."
          statusLabel="Commercial posture"
          statusValue="Rollout review recommended"
          items={pricingContinuityItems}
          primaryHref="/contact"
          primaryLabel="Open Contact & Rollout"
          secondaryHref="/portal/platform"
          secondaryLabel="Open Platform Dashboard"
        />
      </div>

      <ProductProofSection
        eyebrow="Pricing product proof"
        title="Pricing now closes against visible product, not promise-only packaging"
        detail="The route now keeps dashboard, workspace, bid, academy, and communications proof in view so rollout conversations stay anchored to the actual FCA product."
        highlights={pricingProductProof}
      />

      <div style={{ marginBottom: 24, marginTop: 24 }}>
        <CustomerTrustPanel
          eyebrow={publicPricingMessaging.trust.eyebrow}
          title={publicPricingMessaging.trust.title}
          detail={publicPricingMessaging.trust.detail}
          items={[
            {
              title: "Pilot quickly",
              detail: "Start with guided setup and a practical walkthrough of the workspace, portal, and communications flows.",
            },
            {
              title: "Expand with confidence",
              detail: "Add billing, training, and broader channel continuity as your team grows into the platform.",
            },
            {
              title: "Plan a broader rollout",
              detail: "Use a larger rollout path when multiple teams, workflows, or operating units need to stay aligned.",
            },
          ]}
        />
      </div>

      <CommercialReadinessPanel
        title="Rollout planning reflects live system state"
        detail="Pricing is framed as a continuity-aware rollout surface that keeps approval, revenue risk, product depth, and communications readiness visible before a live conversation."
        primaryHref="/contact"
        primaryLabel={publicActionCatalog.contact.label}
        secondaryHref={publicActionCatalog.platform.href}
        secondaryLabel="Open Platform Dashboard"
      />

      <div style={{ ...twoColumnGridStyle, marginBottom: 24, marginTop: 24 }}>
        <div style={{ ...cardStyle, background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
          <h2 style={{ marginTop: 0 }}>Rollout checklist</h2>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8, marginBottom: 0, color: "#334155" }}>
            {rolloutSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <WorkspaceSnapshotCard
          title={publicPricingMessaging.snapshot.title}
          detail={publicPricingMessaging.snapshot.detail}
          ctaHref={publicActionCatalog.platform.href}
          ctaLabel="Open Platform Dashboard"
        />
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Actual customer products included in FCA rollout</h2>
        <div style={responsiveGrid(220)}>
          {productPackages.map((item) => (
            <div key={item.title} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{item.title}</div>
              <div style={{ color: "#475569", lineHeight: 1.7 }}>{item.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={responsiveGrid(260)}>
        {pricingTiers.map((tier) => (
          <div key={tier.name} style={cardStyle}>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>{tier.name}</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 12 }}>{tier.price}</div>
            <p style={{ color: "#4b5563", lineHeight: 1.6 }}>{tier.detail}</p>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Included products</div>
              <div style={{ color: "#111827", lineHeight: 1.7 }}>{tier.products.join(" · ")}</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Included communications</div>
              <div style={{ color: "#111827", lineHeight: 1.7 }}>{tier.comms.join(" · ")}</div>
            </div>

            <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
              {tier.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <a href={tier.ctaHref} style={ctaPrimaryStyle}>{tier.ctaLabel}</a>
          </div>
        ))}
      </div>

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>How to choose a plan</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
            Use these tiers to frame the conversation around operational maturity, rollout depth, communications coverage, and continuity needs. The objective is to match your team to the right production path, not force a generic self-serve checkout.
          </p>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Immediate next actions</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 0, color: "#4b5563" }}>
            Review the rollout path, then move into contact, pricing fit, and platform review through the shared action surfaces above instead of repeating the same CTA cluster again here.
          </p>
        </div>
      </div>

      <PublicActionRail
        title={publicPricingMessaging.actionRail.title}
        detail={publicPricingMessaging.actionRail.detail}
      />

      <ShellFooter />
    </div>
  );
}
