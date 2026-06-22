import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import CommercialReadinessPanel from "../../components/CommercialReadinessPanel";
import PublicActionRail from "../../components/PublicActionRail";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicPackageRouteGroupsPanel from "../../components/PublicPackageRouteGroupsPanel";
import ProductIllustration from "../../components/ProductIllustration";
import { workspaceCheckoutHref } from "../../commerceCheckout";
import { publicActionCatalog } from "../../websiteShell";
import { publicPricingMessaging } from "../../systemContinuity";
import { pricingTiers, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { cardStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle, ctaPrimaryStyle } from "../../publicShellStyles";

const rolloutSteps = [
  "Confirm contractor fit, pilot scope, and current operating friction.",
  "Walk the live FCA experience from public entry through workspace, bids, estimates, projects, files, billing, Academy, support, and Auricrux guidance.",
  "Select the rollout tier that matches readiness, team size, product depth, communications needs, and post-handover continuity posture.",
  "Close on the next deployment action, pricing path, and rollout planning sequence.",
];

export default function Pricing() {
  function tierCheckoutHref(tier) {
    if (tier.planKey) return workspaceCheckoutHref(tier.planKey);
    return null;
  }

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
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Rollout planning</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>{publicPricingMessaging.hero.title}</h2>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <FcaBrandMark compact />
            <AuricruxBrandMark compact />
          </div>
        </div>
        <p style={{ lineHeight: 1.7, color: "#334155", maxWidth: 860, marginBottom: 0 }}>{publicPricingMessaging.hero.detail}</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <ProductIllustration variant="pricing" />
      </div>

      <div style={{ marginBottom: 24 }}>
        <CustomerTrustPanel
          eyebrow={publicPricingMessaging.trust.eyebrow}
          title={publicPricingMessaging.trust.title}
          detail={publicPricingMessaging.trust.detail}
          items={[
            { title: "Start at the right level", detail: "Startup through Enterprise — match tier to team size and rollout depth." },
            { title: "Expand with confidence", detail: "Add billing, training, channel continuity, and referral readiness as you grow." },
            { title: "Academy is core", detail: "Every tier includes Academy depth — operational training, not add-on tutorials." },
          ]}
        />
      </div>

      <div style={responsiveGrid(260)}>
        {pricingTiers.map((tier) => {
          const checkoutHref = tierCheckoutHref(tier);
          const ctaHref = checkoutHref || tier.ctaHref;
          const ctaLabel = checkoutHref ? `Continue checkout — ${tier.price}` : tier.ctaLabel;

          return (
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

            <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
              {tier.includes.map((item) => <li key={item}>{item}</li>)}
            </ul>

            <a href={ctaHref} style={ctaPrimaryStyle}>{ctaLabel}</a>
          </div>
          );
        })}
      </div>

      <div style={{ ...twoColumnGridStyle, marginTop: 24, marginBottom: 24 }}>
        <div style={{ ...cardStyle, background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
          <h2 style={{ marginTop: 0 }}>Rollout checklist</h2>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8, marginBottom: 0, color: "#334155" }}>
            {rolloutSteps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </div>

        <WorkspaceSnapshotCard
          title={publicPricingMessaging.snapshot.title}
          detail={publicPricingMessaging.snapshot.detail}
          ctaHref="/platform"
          ctaLabel="Explore the platform"
        />
      </div>

      <CommercialReadinessPanel
        title="Ready to plan your rollout?"
        detail="Review live platform state, then schedule a walkthrough to match tier to your team."
        primaryHref="/contact"
        primaryLabel={publicActionCatalog.contact.label}
        secondaryHref="/platform"
        secondaryLabel="Explore the platform"
      />

      <PublicActionRail title={publicPricingMessaging.actionRail.title} detail={publicPricingMessaging.actionRail.detail} />

      <PublicPackageRouteGroupsPanel
        eyebrow="Product depth"
        title="Every route group in your rollout"
        detail="See how SaaS, portal, Academy, Auricrux, and revenue surfaces connect before you commit."
      />

      <ShellFooter />
    </div>
  );
}
