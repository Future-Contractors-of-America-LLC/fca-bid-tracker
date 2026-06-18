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
import PricingActionCenter from "../../components/PricingActionCenter";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import useCustomerSession from "../../hooks/useCustomerSession";
import { publicPackageRouteGroups } from "../../publicPackageRouteGroups";
import { executiveSignalCtaSets, founderJourneyCtaSets, pricingTiers, publicActionCatalog, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { publicPricingMessaging } from "../../systemContinuity";
import { cardStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle, ctaPrimaryStyle } from "../../publicShellStyles";

const rolloutSteps = [
  "Confirm contractor fit, pilot scope, and current operating friction.",
  "Walk the live FCA experience from public entry through workspace, bids, estimates, projects, files, billing, Academy, support, and Auricrux guidance.",
  "Select the rollout tier that matches readiness, team size, product depth, communications needs, and post-handover continuity posture.",
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
    value: "Plans map to real slices",
    detail: "Pricing now explicitly points buyers into reachable SaaS, LMS, and Auricrux surfaces.",
  },
  {
    label: "Shared narrative",
    value: "Public shell stays product-aware",
    detail: "Pricing continues the same platform, academy, portal, communications, warranty, and referral continuity story instead of restarting from zero.",
  },
];

const pricingProductProof = [
  { title: "Validate live platform state", detail: "Open the platform dashboard during pricing review so commercial discussion stays attached to product proof.", href: "/portal/platform", label: "Open Platform Dashboard" },
  { title: "Show qualification and estimate depth", detail: "Use bids and estimates to prove there is real SaaS depth behind the plan being sold.", href: "/portal/bids", label: "Open Qualification Board" },
  { title: "Show customer workspace depth", detail: "Use the portal shell to demonstrate the product that the rollout tiers are funding and sequencing.", href: "/portal", label: "Open Portal Workspace" },
  { title: "Keep academy in scope", detail: "Training, degree, licensure, certification, apprenticeship, and how-to tracks remain inside the same product story.", href: "/academy/catalog", label: "Open Academy Catalog" },
  { title: "Show recurring service and advocacy lanes", detail: "Use warranty and referral continuity to prove the revenue story continues after handoff instead of ending at project delivery.", href: "/warranty", label: "Open Warranty Continuity" },
];

const academyInnovationSpotlight = [
  {
    title: "Not add-on training — operational training",
    detail: "FCA Academy is built into the same workspace flow as SaaS execution, so teams learn in the exact context where work is happening.",
  },
  {
    title: "Licensure, apprenticeship, and certification pathways",
    detail: "Academy supports role progression from onboarding through advanced operational leadership rather than simple feature tutorials.",
  },
  {
    title: "Auricrux-guided learning continuity",
    detail: "Auricrux links blockers in operations to targeted training pathways, then guides the team back into execution with reduced friction.",
  },
  {
    title: "Retention and growth engine",
    detail: "Academy increases customer stickiness and team capability over time, making it a core innovation and revenue stabilizer, not optional content.",
  },
];

export default function Pricing() {
  const { session, login } = useCustomerSession();

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
        <p style={{ lineHeight: 1.7, color: "#334155", maxWidth: 860, marginBottom: 0 }}>{publicPricingMessaging.hero.detail}</p>
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
          detail="The pricing route now carries a shared operating strip so commercial review stays tied to workspace readiness, founder walkthrough, production next actions, and lifecycle revenue continuity."
          statusLabel="Commercial posture"
          statusValue="Auricrux-governed rollout review recommended"
          items={pricingContinuityItems}
          primaryHref="/contact"
          primaryLabel="Open Contact & Rollout"
          secondaryHref="/portal/platform"
          secondaryLabel="Open Platform Dashboard"
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <PricingActionCenter session={session} login={login} />
      </div>

      <CommercialContinuityFeed title="Pricing and rollout memory" detail="Recent pricing activations, plan promotions, revenue-shaping workspace changes, recurring-service continuity posture, and referral-ready lifecycle transitions stay visible here so commercial continuity is durable across pricing, contact, login, and portal routes." />

      <ProductProofSection
        eyebrow="Pricing product proof"
        title="Pricing now closes against visible product, not promise-only packaging"
        detail="The route now keeps dashboard, bids, estimates, academy, communications, warranty, and referral proof in view so rollout conversations stay anchored to the actual FCA product and its revenue lifecycle."
        highlights={pricingProductProof}
      />

      <div style={{ ...cardStyle, marginTop: 24, marginBottom: 24, background: "linear-gradient(135deg, #fff7e1 0%, #ffffff 55%, #eff6ff 100%)", border: "1px solid #ecd089" }}>
        <div style={{ color: "#7c5313", fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>
          Academy innovation spotlight
        </div>
        <h2 style={{ marginTop: 0 }}>FCA Academy is a core innovation, not a side feature</h2>
        <p style={{ color: "#4b5563", lineHeight: 1.7 }}>
          Every pricing tier is now explicit about Academy depth because Academy is one of FCA’s biggest differentiators. This is where workforce capability, credential progression, and execution quality are built and maintained.
        </p>
        <div style={responsiveGrid(260)}>
          {academyInnovationSpotlight.map((item) => (
            <div key={item.title} style={{ border: "1px solid #e7c77f", borderRadius: 12, padding: 14, background: "#fffdf7" }}>
              <div style={{ color: "#7c5313", fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
              <div style={{ color: "#4b5563", lineHeight: 1.65 }}>{item.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24, marginTop: 24 }}>
        <CustomerTrustPanel
          eyebrow={publicPricingMessaging.trust.eyebrow}
          title={publicPricingMessaging.trust.title}
          detail={publicPricingMessaging.trust.detail}
          items={[
            { title: "Start at the right level", detail: "Use Startup Workspace for low-cost entry, Starter Team for early growth, Pilot for guided launch, Team/Operations for active delivery, or Growth/Scale/Enterprise for broader rollout control." },
            { title: "Expand with confidence", detail: "Add billing, training, broader channel continuity, recurring service posture, and referral growth readiness as your team grows into the platform." },
            { title: "Plan a broader rollout", detail: "Use larger rollout paths when multiple teams, workflows, or operating units need to stay aligned from delivery through post-handover retention and repeat business." },
          ]}
        />
      </div>

      <CommercialReadinessPanel
        title="Rollout planning reflects live system state"
        detail="Pricing is framed as a continuity-aware rollout surface that keeps approval, revenue risk, product depth, communications readiness, recurring-service posture, and real session activation visible before a live conversation."
        primaryHref="/contact"
        primaryLabel={publicActionCatalog.contact.label}
        secondaryHref={publicActionCatalog.platform.href}
        secondaryLabel="Open Platform Dashboard"
      />

      <div style={{ ...twoColumnGridStyle, marginBottom: 24, marginTop: 24 }}>
        <div style={{ ...cardStyle, background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
          <h2 style={{ marginTop: 0 }}>Rollout checklist</h2>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8, marginBottom: 0, color: "#334155" }}>
            {rolloutSteps.map((step) => <li key={step}>{step}</li>)}
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
          {publicPackageRouteGroups.map((item) => (
            <div key={item.title} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#fff" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{item.title}</div>
              <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>{item.detail}</div>
              <div style={{ display: "grid", gap: 8 }}>
                {item.routes.map((route) => (
                  <a key={`${item.key}-${route.href}`} href={route.href} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
                    {route.label}
                  </a>
                ))}
              </div>
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

            <div style={{ marginBottom: 12, border: "1px solid #e7c77f", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "#7c5313", fontWeight: 800, marginBottom: 6 }}>Best for</div>
              <div style={{ color: "#4b3208", lineHeight: 1.7 }}>{tier.bestFor}</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Included products</div>
              <div style={{ color: "#111827", lineHeight: 1.7 }}>{tier.products.join(" · ")}</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Included communications</div>
              <div style={{ color: "#111827", lineHeight: 1.7 }}>{tier.comms.join(" · ")}</div>
            </div>

            <div style={{ marginBottom: 12, border: "1px solid #ecd089", borderRadius: 10, padding: 10, background: "#fffaf0" }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "#7c5313", fontWeight: 800, marginBottom: 6 }}>Academy included</div>
              <div style={{ color: "#4b3208", lineHeight: 1.7 }}>{tier.academyAccess}</div>
            </div>

            <div style={{ marginBottom: 12, border: "1px solid #ecd089", borderRadius: 10, padding: 10, background: "#fffaf0" }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "#7c5313", fontWeight: 800, marginBottom: 6 }}>Auricrux role</div>
              <div style={{ color: "#4b3208", lineHeight: 1.7 }}>{tier.auricruxRole}</div>
            </div>

            <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
              {tier.includes.map((item) => <li key={item}>{item}</li>)}
            </ul>

            <a href={tier.ctaHref} style={ctaPrimaryStyle} target={tier.checkoutUrl ? "_blank" : undefined} rel={tier.checkoutUrl ? "noopener noreferrer" : undefined}>{tier.ctaLabel}</a>
          </div>
        ))}
      </div>

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>How to choose a plan</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
            Use these tiers to frame the conversation around operational maturity, rollout depth, communications coverage, Academy impact, continuity needs, and post-handover growth posture. The objective is to match your team to the right production path, not force a generic self-serve checkout.
          </p>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Immediate next actions</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 0, color: "#4b5563" }}>
            Review the rollout path, activate a real workspace if you are ready to move, then continue into contact, pricing fit, Academy depth, recurring-service posture, referral-readiness, and platform review through the shared action surfaces above.
          </p>
        </div>
      </div>

      <PublicActionRail title={publicPricingMessaging.actionRail.title} detail={publicPricingMessaging.actionRail.detail} />

      <ShellFooter />
    </div>
  );
}
