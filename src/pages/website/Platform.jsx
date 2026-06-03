import FcaBrandMark from "../../components/FcaBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import { platformModules, shellJourney } from "../../websiteShell";
import { cardStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle } from "../../publicShellStyles";

export default function Platform() {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="FCA Platform"
        title="One contractor lifecycle operating system"
        subtitle="FCA is being shaped as a unified operating surface for sales, portal visibility, project follow-through, workforce enablement, and Auricrux-guided execution."
        primaryHref="/login"
        primaryLabel="Open FCA Workspace"
        secondaryHref="/pricing"
        secondaryLabel="View Pricing"
        journey={shellJourney}
        currentJourney="platform"
      />

      <div style={heroCardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
          <div style={{ color: "#2563eb", fontWeight: 700 }}>Platform story</div>
          <FcaBrandMark compact />
        </div>
        <h2 style={{ marginTop: 0 }}>Built to feel like one connected system</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860 }}>
          The current shell is designed for founder-led sales conversations and believable customer walkthroughs. It shows how FCA can carry a contractor from public entry into login, portal operations, bid visibility, academy continuity, and Auricrux-guided next actions without fragmenting the experience.
        </p>
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
          <h2 style={{ marginTop: 0 }}>Current founder walkthrough</h2>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Start on the public home page and frame the FCA platform story.</li>
            <li>Enter through <a href="/login">workspace login</a>.</li>
            <li>Show the <a href="/portal">customer portal</a> and module continuity.</li>
            <li>Transition into <a href="/portal/academy">academy continuity</a>.</li>
            <li>Open the <a href="/portal/platform">platform dashboard</a> to summarize tenant, project, support, and admin state in one view.</li>
            <li>Use the Auricrux dock to narrate next actions and system visibility.</li>
          </ol>
        </div>
        <WorkspaceSnapshotCard
          title="Public proof of workspace continuity"
          detail="The public platform page now previews live shell context so the sales narrative stays connected to the working portal experience."
          ctaHref="/portal/platform"
          ctaLabel="Open unified platform dashboard"
        />
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Linked product surfaces</h2>
        <div style={{ ...responsiveGrid(220), gap: 12 }}>
          <a href="/portal" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Customer Portal Workspace</a>
          <a href="/portal/platform" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Unified Platform Dashboard</a>
          <a href="/academy" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>FCA Academy</a>
          <a href="/bid-entry/" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Bid Entry Tool</a>
          <a href="/bid-status/" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Bid Status Tool</a>
        </div>
      </div>

      <ShellFooter />
    </div>
  );
}
