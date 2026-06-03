import FcaBrandMark from "../../components/FcaBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import ExecutiveSignalBar from "../../components/ExecutiveSignalBar";
import CommercialReadinessPanel from "../../components/CommercialReadinessPanel";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import { contactPaths, shellJourney } from "../../websiteShell";
import { cardStyle, ctaLightStyle, ctaPrimaryStyle, ctaSecondaryStyle, pageShellStyle, twoColumnGridStyle } from "../../publicShellStyles";

const checklistStyle = {
  margin: 0,
  paddingLeft: 20,
  lineHeight: 1.8,
  color: "#334155",
};

export default function Contact() {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="FCA Contact"
        title="Move from interest to founder review"
        subtitle="This contact surface is structured around the immediate sales objective: converting interest into a founder-led review, pilot conversation, or broader platform assessment."
        primaryHref="/login"
        primaryLabel="Open FCA Workspace"
        secondaryHref="/pricing"
        secondaryLabel="Pricing"
        journey={shellJourney}
        currentJourney="conversion"
      />

      <div style={{ marginBottom: 20, display: "flex", justifyContent: "flex-end" }}>
        <FcaBrandMark compact />
      </div>

      <FounderJourneyStrip
        currentJourney="conversion"
        title="Founder review now closes the same journey opened on public entry"
        detail="This route makes the conversion path explicit so founder review feels like the natural outcome of platform framing, workspace continuity, and live operating-state validation."
        ctaHref="mailto:hello@futurecontractorsofamerica.com?subject=Founder%20Review%20Request"
        ctaLabel="Send founder review request"
      />

      <ExecutiveSignalBar mode="public" nextHref="/portal/platform" nextLabel="Review live operating state" />

      <CommercialReadinessPanel
        title="Founder review begins from real operating context"
        detail="Contact is now framed as a conversion surface that inherits the same approval, revenue, and rollout readiness state shown across Auricrux, platform, portal, and academy routes."
        primaryHref="mailto:hello@futurecontractorsofamerica.com?subject=Founder%20Review%20Request"
        primaryLabel="Send Founder Review Request"
        secondaryHref="/portal/platform"
        secondaryLabel="Open Platform Dashboard"
      />

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <WorkspaceSnapshotCard
            title="Founder review starts from real shell state"
            detail="This conversion page now reinforces that the review is not a disconnected pitch deck flow. Tenant, project, and Auricrux continuity already exist before the walkthrough begins."
            ctaHref="/portal/platform"
            ctaLabel="Open unified platform dashboard"
          />

          <div style={{ ...cardStyle, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
            <h2 style={{ marginTop: 0 }}>What happens in the founder review</h2>
            <ol style={checklistStyle}>
              <li>Frame the FCA platform story from the public shell.</li>
              <li>Show persisted workspace continuity before entry.</li>
              <li>Open the platform dashboard to summarize tenant, project, support, academy, and admin state.</li>
              <li>Transition into portal, academy, and bid routes based on customer fit.</li>
              <li>Close on pilot scope, rollout path, and next production action.</li>
            </ol>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {contactPaths.map((path) => (
            <div key={path.title} style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>{path.title}</h3>
              <p style={{ color: "#4b5563", lineHeight: 1.6 }}>{path.detail}</p>
              <a href={path.cta} style={ctaPrimaryStyle}>
                {path.label}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Immediate founder CTA</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
          For this stage of the product, the strongest conversion path is still a direct founder-led review. This page supports that motion while the underlying platform continues to harden.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <a href="/login" style={ctaPrimaryStyle}>Open FCA Workspace</a>
          <a href="/portal/platform" style={ctaSecondaryStyle}>Open Platform Dashboard</a>
          <a href="mailto:hello@futurecontractorsofamerica.com?subject=Founder%20Review%20Request" style={ctaLightStyle}>Request Founder Review</a>
        </div>
      </div>

      <PublicActionRail
        title="Close founder-review conversion with the same shared public action rail"
        detail="Even at the conversion endpoint, the route now preserves the same workspace, platform, academy, and founder-review actions as the rest of the shell so the narrative stays unified."
      />

      <ShellFooter />
    </div>
  );
}
