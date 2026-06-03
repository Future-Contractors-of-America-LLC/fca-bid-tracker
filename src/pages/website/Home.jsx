import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import PublicCtaRow from "../../components/PublicCtaRow";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import { publicBodyCtaSets, publicRouteCtas, shellJourney } from "../../websiteShell";
import { publicHomeMessaging } from "../../systemContinuity";
import { cardStyle, pageShellStyle } from "../../publicShellStyles";

export default function Home() {
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

      <PublicCtaRow actions={publicBodyCtaSets.home} />

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
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Platform Overview</h3>
          <p>See how FCA keeps bids, project visibility, communication, and training connected in one operating system.</p>
          <a href="/platform">View platform page</a>
        </div>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Auricrux Guidance</h3>
          <p>See how the operating layer keeps next steps, customer visibility, and execution continuity clear.</p>
          <a href="/auricrux">View Auricrux page</a>
        </div>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Customer Portal</h3>
          <p>Projects, files, notifications, billing follow-through, and customer-facing visibility.</p>
          <a href="/portal">Open customer workspace</a>
        </div>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>FCA Academy</h3>
          <p>Training pathways, certification progress, and workforce readiness tied to the same customer journey.</p>
          <a href="/academy">Open academy workspace</a>
        </div>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>FCA Bid Product</h3>
          <p>Use the canonical FCA bid routes first for customer continuity and production rollout planning.</p>
          <div style={{ marginTop: 10 }}>
            <a href="/bid-entry/">Open Bid Entry</a>
            <span style={{ margin: "0 8px" }}>•</span>
            <a href="/bid-status/">Open Bid Status</a>
          </div>
          <p style={{ marginTop: 12, color: "#4b5563", lineHeight: 1.6 }}>
            Legacy customer links remain available only for compatibility and redirect continuity.
          </p>
          <div style={{ marginTop: 8 }}>
            <a href="/fca-customer-entry/index.html">Legacy intake route</a>
            <span style={{ margin: "0 8px" }}>•</span>
            <a href="/fca-customer-status/index.html">Legacy status route</a>
          </div>
        </div>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Plans & Rollout</h3>
          <p>Move from interest into rollout planning, guided setup, and next implementation steps.</p>
          <div style={{ marginTop: 10 }}>
            <a href="/pricing">Plans</a>
            <span style={{ margin: "0 8px" }}>•</span>
            <a href="/contact">Contact</a>
          </div>
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
