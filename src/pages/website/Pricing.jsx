import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import ExecutiveSignalBar from "../../components/ExecutiveSignalBar";
import CommercialReadinessPanel from "../../components/CommercialReadinessPanel";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import PublicCtaRow from "../../components/PublicCtaRow";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicOperationsStrip from "../../components/PublicOperationsStrip";
import { pricingTiers, publicActionCatalog, publicBodyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { publicPricingMessaging } from "../../systemContinuity";
import { cardStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle } from "../../publicShellStyles";

const rolloutSteps = [
  "Confirm contractor fit, pilot scope, and current operating friction.",
  "Walk the live FCA experience from public entry through workspace, platform dashboard, portal, academy, and bid continuity.",
  "Select the rollout tier that matches readiness, team size, and continuity needs.",
  "Close on the next deployment action and rollout planning path.",
];

const pricingContinuityItems = [
  {
    label: "Rollout path",
    value: "Plans map to operating readiness",
    detail: "Pricing now reads as deployment sequencing rather than a detached brochure table.",
  },
  {
    label: "Commercial state",
    value: "Walkthrough before checkout",
    detail: "The route keeps founder review, workspace validation, and rollout fit visible before commercial next steps.",
  },
  {
    label: "Shared narrative",
    value: "Public shell stays product-aware",
    detail: "Pricing continues the same platform and academy continuity story instead of restarting from zero.",
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
        <PublicCtaRow actions={publicBodyCtaSets.pricingHero} />
      </div>

      <FounderJourneyStrip
        currentJourney="conversion"
        title={publicPricingMessaging.journey.title}
        detail={publicPricingMessaging.journey.detail}
        ctaHref="/contact"
        ctaLabel={publicActionCatalog.contact.label}
      />

      <ExecutiveSignalBar mode="public" nextHref="/contact" nextLabel={publicActionCatalog.contact.label} />

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

      <div style={{ marginBottom: 24 }}>
        <CustomerTrustPanel
          eyebrow={publicPricingMessaging.trust.eyebrow}
          title={publicPricingMessaging.trust.title}
          detail={publicPricingMessaging.trust.detail}
          items={[
            {
              title: "Pilot quickly",
              detail: "Start with guided setup and a practical walkthrough of the workspace and portal flows.",
            },
            {
              title: "Expand with confidence",
              detail: "Add communication, billing, and training continuity as your team grows into the platform.",
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
        detail="Pricing is framed as a continuity-aware rollout surface that keeps approval, revenue risk, and deployment readiness visible before a live conversation."
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

      <div style={responsiveGrid(260)}>
        {pricingTiers.map((tier) => (
          <div key={tier.name} style={cardStyle}>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>{tier.name}</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 12 }}>{tier.price}</div>
            <p style={{ color: "#4b5563", lineHeight: 1.6 }}>{tier.detail}</p>
            <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginBottom: 0 }}>
              {tier.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>How to choose a plan</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
            Use these tiers to frame the conversation around operational maturity, rollout depth, and continuity needs. The objective is to match your team to the right production path, not force a generic self-serve checkout.
          </p>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Immediate next actions</h2>
          <PublicCtaRow actions={publicBodyCtaSets.pricingImmediate} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
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
