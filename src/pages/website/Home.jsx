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
import { cardStyle, pageShellStyle } from "../../publicShellStyles";

export default function Home() {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="FCA Contractor Workspace"
        title="Future Contractors of America"
        subtitle="A connected workspace for bids, customer updates, project visibility, workforce readiness, and guided next steps."
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
        title="Start with a clear customer path"
        detail="Public entry guides visitors into platform overview, workspace access, customer portal visibility, academy readiness, and rollout planning without switching narratives."
        ctaHref="/login"
        ctaLabel="Enter FCA workspace"
      />

      <PublicCtaRow actions={publicBodyCtaSets.home} />

      <div style={{ marginTop: 28 }}>
        <CustomerTrustPanel
          title="Built to support day-to-day contractor work"
          detail="FCA helps teams keep customers informed, organize delivery, and make the next step clear across bids, projects, communications, and training."
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <WorkspaceSnapshotCard
          title="See how the workspace stays connected"
          detail="The home page previews the same tenant, project, and Auricrux state that carries through the platform dashboard and portal routes."
          ctaHref="/login"
          ctaLabel="Enter workspace with continuity"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Platform Overview</h3>
          <p>See how FCA brings bids, delivery, communication, and training into one connected system.</p>
          <a href="/platform">View platform page</a>
        </div>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Auricrux Guidance</h3>
          <p>See how the operating layer keeps next actions and continuity visible across the workspace.</p>
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
        title="Take the next step with FCA"
        detail="This shared rail keeps workspace entry, platform visibility, academy continuity, and guided walkthrough options visible at the bottom of each route so the next step stays clear."
      />

      <ShellFooter />
    </div>
  );
}
