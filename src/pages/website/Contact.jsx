import FcaBrandMark from "../../components/FcaBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import ExecutiveSignalBar from "../../components/ExecutiveSignalBar";
import CommercialReadinessPanel from "../../components/CommercialReadinessPanel";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import PublicCtaRow from "../../components/PublicCtaRow";
import { contactPaths, publicBodyCtaSets, publicRouteCtas, shellJourney } from "../../websiteShell";
import { cardStyle, pageShellStyle, twoColumnGridStyle } from "../../publicShellStyles";

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
        title="Talk with FCA about your rollout"
        subtitle="This contact surface helps customers move from interest into a walkthrough, pilot conversation, or broader rollout assessment."
        primaryHref={publicRouteCtas.conversion.primaryHref}
        primaryLabel={publicRouteCtas.conversion.primaryLabel}
        secondaryHref={publicRouteCtas.conversion.secondaryHref}
        secondaryLabel={publicRouteCtas.conversion.secondaryLabel}
        journey={shellJourney}
        currentJourney="conversion"
      />

      <div style={{ marginBottom: 20, display: "flex", justifyContent: "flex-end" }}>
        <FcaBrandMark compact />
      </div>

      <FounderJourneyStrip
        currentJourney="conversion"
        title="A walkthrough should feel like the natural next step"
        detail="This route makes the next step explicit so a live conversation feels like the natural outcome of platform framing, workspace continuity, and operating-state validation."
        ctaHref="mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Walkthrough%20Request"
        ctaLabel="Schedule a walkthrough"
      />

      <ExecutiveSignalBar mode="public" nextHref="/portal/platform" nextLabel="Review live operating state" />

      <CommercialReadinessPanel
        title="Your walkthrough begins from real operating context"
        detail="Contact is framed as a customer-ready conversion surface that inherits the same approval, revenue, and rollout readiness state shown across Auricrux, platform, portal, and academy routes."
        primaryHref="mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Walkthrough%20Request"
        primaryLabel="Schedule a Walkthrough"
        secondaryHref="/portal/platform"
        secondaryLabel="Open Platform Dashboard"
      />

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <WorkspaceSnapshotCard
            title="Walkthroughs start from real shell state"
            detail="This conversion page reinforces that the review is not a disconnected pitch-deck flow. Tenant, project, and Auricrux continuity already exist before the walkthrough begins."
            ctaHref="/portal/platform"
            ctaLabel="Open unified platform dashboard"
          />

          <div style={{ ...cardStyle, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
            <h2 style={{ marginTop: 0 }}>What happens in a walkthrough</h2>
            <ol style={checklistStyle}>
              <li>Frame the FCA platform story from the public shell.</li>
              <li>Show persisted workspace continuity before entry.</li>
              <li>Open the platform dashboard to summarize tenant, project, support, academy, and admin state.</li>
              <li>Transition into portal, academy, and bid routes based on your team's fit.</li>
              <li>Close on pilot scope, rollout path, and the next production action.</li>
            </ol>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {contactPaths.map((path) => (
            <div key={path.title} style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>{path.title}</h3>
              <p style={{ color: "#4b5563", lineHeight: 1.6 }}>{path.detail}</p>
              <a href={path.cta} style={{ display: "inline-block", textDecoration: "none", background: "#111827", color: "#fff", padding: "10px 14px", borderRadius: 10, fontWeight: 700 }}>
                {path.label}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Immediate CTA</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
          The strongest conversion path is still a direct walkthrough of the live FCA workspace. This page supports that motion while the platform continues to harden.
        </p>
        <PublicCtaRow actions={publicBodyCtaSets.contactImmediate} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
      </div>

      <PublicActionRail
        title="Close with the same shared next steps"
        detail="Even at the conversion endpoint, the route preserves the same workspace, platform, academy, and walkthrough actions as the rest of the site so the experience stays unified."
      />

      <ShellFooter />
    </div>
  );
}
