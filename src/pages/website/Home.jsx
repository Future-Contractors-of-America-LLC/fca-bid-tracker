import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import { shellJourney } from "../../websiteShell";
import { cardStyle, ctaLightStyle, ctaPrimaryStyle, pageShellStyle } from "../../publicShellStyles";

const secondaryStyle = {
  ...ctaLightStyle,
  background: "#f3f4f6",
  border: "1px solid #d1d5db",
};

export default function Home() {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="FCA + Auricrux Unified Shell"
        title="Future Contractors of America"
        subtitle="Unified contractor lifecycle platform for sales, portal operations, bid visibility, workforce readiness, and Auricrux-guided execution."
        primaryHref="/login"
        primaryLabel="Enter FCA Workspace"
        secondaryHref="/platform"
        secondaryLabel="Explore Platform"
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

      <div style={{ marginTop: 20 }}>
        <a href="/login" style={{ ...ctaPrimaryStyle, marginRight: 12, marginTop: 12 }}>Enter FCA Workspace</a>
        <a href="/platform" style={{ ...secondaryStyle, marginRight: 12, marginTop: 12 }}>Platform Overview</a>
        <a href="/auricrux" style={{ ...secondaryStyle, marginRight: 12, marginTop: 12 }}>Meet Auricrux</a>
        <a href="/pricing" style={{ ...secondaryStyle, marginTop: 12 }}>Production Planning</a>
      </div>

      <div style={{ marginTop: 28 }}>
        <WorkspaceSnapshotCard
          title="Public entry now reflects real workspace continuity"
          detail="The home page now previews the same persisted tenant, project, and Auricrux state that carries through the platform dashboard and portal routes."
          ctaHref="/login"
          ctaLabel="Enter workspace with continuity"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Platform Story</h3>
          <p>Show FCA as one connected operating system instead of a standalone tool.</p>
          <a href="/platform">View platform page</a>
        </div>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Auricrux Layer</h3>
          <p>Frame the intelligence layer that keeps next actions and continuity visible across the shell.</p>
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
          <h3 style={{ marginTop: 0 }}>Production Conversion</h3>
          <p>Move from shell visibility into rollout planning, founder review, and production implementation.</p>
          <div style={{ marginTop: 10 }}>
            <a href="/pricing">Planning</a>
            <span style={{ margin: "0 8px" }}>•</span>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </div>

      <ShellFooter />
    </div>
  );
}
