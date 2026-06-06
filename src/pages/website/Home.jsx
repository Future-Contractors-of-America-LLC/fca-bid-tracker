import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import PublicCtaRow from "../../components/PublicCtaRow";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicOperationsStrip from "../../components/PublicOperationsStrip";
import ProductProofSection from "../../components/ProductProofSection";
import { filterVisibleActions } from "../../ctaBehavior";
import { homeCtaSets, publicSurfaceLinks, publicRouteCtas, shellJourney } from "../../websiteShell";
import { publicHomeMessaging } from "../../systemContinuity";
import { cardStyle, ctaPrimaryStyle, pageShellStyle } from "../../publicShellStyles";

const homeContinuityItems = [
  {
    label: "Customer path",
    value: "Home now leads into live product state",
    detail: "The first route now keeps workspace entry, platform state, and rollout review visible instead of acting like a standalone brochure page.",
  },
  {
    label: "Narrative continuity",
    value: "Platform, Auricrux, and Academy stay linked",
    detail: "The home page now reinforces one connected system story across product explanation, operations, and training follow-through.",
  },
  {
    label: "Next action",
    value: "Clear conversion motion remains active",
    detail: "Visitors can move directly into workspace, platform review, or rollout planning without losing context.",
  },
];

const homeProductProof = [
  {
    title: "Open the live dashboard story",
    detail: "Go from the public shell into the unified platform dashboard and show real operating continuity instead of stopping at marketing copy.",
    href: "/portal/platform",
    label: "Open Platform Dashboard",
  },
  {
    title: "Enter the customer workspace",
    detail: "Use the login and portal path to demonstrate project, file, message, bid, billing, and support continuity.",
    href: "/portal",
    label: "Open Portal Workspace",
  },
  {
    title: "Walk the bid product",
    detail: "Move directly into the canonical FCA bid intake route so the product shows a real customer movement path from the home page.",
    href: "/bid-entry",
    label: "Open Bid Entry",
  },
  {
    title: "Keep training attached",
    detail: "Open academy continuity from the same shell so workforce readiness remains part of the product story.",
    href: "/academy",
    label: "Open Academy",
  },
];

export default function Home() {
  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname;
  const visibleSurfaceLinks = filterVisibleActions(publicSurfaceLinks, currentPath);

  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow={publicHomeMessaging.header.eyebrow}
        title={publicHomeMessaging.header.title}
        subtitle={publicHomeMessaging.header.subtitle}
        primaryHref={publicRouteCtas.public.primaryHref}
        primaryLabel={publicRouteCtas.public.primaryLabel}
        secondaryHref={publicRouteCtas.public.secondaryHref}
        secondaryLabel={publicRouteCtas.public.secondaryLabel}
        journey={shellJourney}
        currentJourney="public"
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "center",
          marginTop: 8,
          padding: "14px 16px",
          border: "1px solid #dbe3ef",
          borderRadius: 18,
          background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
        }}
      >
        <FcaBrandMark />
        <AuricruxBrandMark />
      </div>

      <FounderJourneyStrip
        currentJourney="public"
        title={publicHomeMessaging.journey.title}
        detail={publicHomeMessaging.journey.detail}
        ctaHref={publicHomeMessaging.journey.ctaHref}
        ctaLabel={publicHomeMessaging.journey.ctaLabel}
      />

      <div style={{ marginTop: 24 }}>
        <PublicOperationsStrip
          eyebrow="Home continuity strip"
          title="Home now opens the same operating story used deeper in FCA"
          detail="The public entry route now carries the same continuity posture as platform, pricing, contact, and billing so the product story starts in a live operational direction."
          statusLabel="Entry posture"
          statusValue="Unified shell continuity active"
          items={homeContinuityItems}
          primaryHref="/login"
          primaryLabel="Open FCA Workspace"
          secondaryHref="/portal/platform"
          secondaryLabel="Open Platform Dashboard"
        />
      </div>

      <ProductProofSection
        eyebrow="Home product proof"
        title="The home page now demonstrates real FCA product movement"
        detail="Visitors can validate the dashboard, workspace, bid routes, and academy continuity directly from the public shell instead of relying on abstract claims."
        highlights={homeProductProof}
      />

      <div style={{ marginTop: 28 }}>
        <CustomerTrustPanel
          title={publicHomeMessaging.trust.title}
          detail={publicHomeMessaging.trust.detail}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <WorkspaceSnapshotCard
          title={publicHomeMessaging.snapshot.title}
          detail={publicHomeMessaging.snapshot.detail}
          ctaHref="/login"
          ctaLabel={publicHomeMessaging.snapshot.ctaLabel}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 24 }}>
        {visibleSurfaceLinks.map((item) => (
          <div key={item.key} style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>{item.title}</h3>
            <p>{item.detail}</p>
            <a href={item.href} style={ctaPrimaryStyle}>{item.ctaLabel}</a>
          </div>
        ))}

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>FCA Bid Product</h3>
          <p>Use the canonical FCA bid routes first for customer continuity and production rollout planning.</p>
          <PublicCtaRow actions={homeCtaSets.bidProduct} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch", marginTop: 10 }} />
          <p style={{ marginTop: 12, color: "#4b5563", lineHeight: 1.6 }}>
            Legacy customer links remain available only for compatibility and redirect continuity.
          </p>
          <PublicCtaRow actions={homeCtaSets.legacyCompatibility} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch", marginTop: 8 }} />
        </div>
      </div>

      <PublicActionRail
        title={publicHomeMessaging.actionRail.title}
        detail={publicHomeMessaging.actionRail.detail}
      />

      <ShellFooter />
    </div>
  );
}
