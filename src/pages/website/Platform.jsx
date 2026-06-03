import FcaBrandMark from "../../components/FcaBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import ExecutiveSignalBar from "../../components/ExecutiveSignalBar";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import { platformModules, publicRouteCtas, shellJourney } from "../../websiteShell";
import { cardStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle } from "../../publicShellStyles";

export default function Platform() {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="FCA Platform"
        title="One contractor lifecycle operating system"
        subtitle="FCA is designed as a unified operating surface for bids, portal visibility, project follow-through, workforce enablement, and guided execution."
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
        <h2 style={{ marginTop: 0 }}>Built to feel like one connected system</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860 }}>
          FCA helps contractor teams move from opportunity to delivery with better visibility into bids, customer updates, files, billing steps, and workforce readiness.
        </p>
      </div>

      <FounderJourneyStrip
        currentJourney="platform"
        title="Platform framing should lead customers into the product experience"
        detail="This route shows the same connected customer journey used across the public site so platform framing leads naturally into workspace, portal, academy, and rollout planning."
        ctaHref="/login"
        ctaLabel="Continue to workspace login"
      />

      <ExecutiveSignalBar mode="public" nextHref="/portal" nextLabel="Enter customer workspace" />

      <div style={{ marginTop: 24 }}>
        <CustomerTrustPanel
          eyebrow="Why teams use FCA"
          title="A clearer path from bids to delivery"
          detail="The platform is organized to help contractor teams stay aligned, reduce follow-up work, and give customers better visibility into what is happening next."
          items={[
            {
              title: "Track work in one place",
              detail: "Keep opportunities, projects, files, and customer communication connected instead of scattered across separate tools.",
            },
            {
              title: "Stay ahead of blockers",
              detail: "See approvals, billing readiness, and next steps before they turn into delays.",
            },
            {
              title: "Support rollout and training",
              detail: "Tie onboarding, academy access, and field readiness into the same operating flow.",
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
            <li>Start on the public home page and review the FCA platform overview.</li>
            <li>Enter through <a href="/login">workspace login</a>.</li>
            <li>Open the <a href="/portal">customer portal</a> for visibility into projects, files, and communications.</li>
            <li>Continue into <a href="/portal/academy">academy continuity</a> for onboarding and workforce readiness.</li>
            <li>Use the <a href="/portal/platform">platform dashboard</a> to summarize tenant, project, support, and admin state in one view.</li>
            <li>Follow Auricrux guidance to keep next actions visible across the system.</li>
          </ol>
        </div>
        <WorkspaceSnapshotCard
          title="Public proof of workspace continuity"
          detail="The public platform page previews live workspace context so the site narrative stays connected to the working portal experience."
          ctaHref="/portal/platform"
          ctaLabel="Open unified platform dashboard"
        />
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Linked product areas</h2>
        <div style={{ ...responsiveGrid(220), gap: 12 }}>
          <a href="/portal" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Customer Portal Workspace</a>
          <a href="/portal/platform" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Unified Platform Dashboard</a>
          <a href="/academy" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>FCA Academy</a>
          <a href="/bid-entry/" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Bid Entry Tool</a>
          <a href="/bid-status/" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Bid Status Tool</a>
        </div>
      </div>

      <PublicActionRail
        title="Keep exploring the FCA platform"
        detail="Platform pages should end with the same clear actions used across the public site so the route never feels detached from the product experience."
      />

      <ShellFooter />
    </div>
  );
}
