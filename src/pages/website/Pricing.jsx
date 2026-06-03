import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import ExecutiveSignalBar from "../../components/ExecutiveSignalBar";
import CommercialReadinessPanel from "../../components/CommercialReadinessPanel";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import { pricingTiers, shellJourney } from "../../websiteShell";
import { cardStyle, ctaLightStyle, ctaPrimaryStyle, ctaSecondaryStyle, heroButtonRowStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle } from "../../publicShellStyles";

const rolloutSteps = [
  "Confirm contractor fit, pilot scope, and current operating friction.",
  "Walk the live FCA shell from public entry through workspace, platform dashboard, portal, academy, and bid continuity.",
  "Select the rollout tier that matches readiness, team size, and continuity needs.",
  "Close on founder review, next deployment action, and production planning path.",
];

export default function Pricing() {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="FCA Production Planning"
        title="Production rollout planning"
        subtitle="This page is structured to support a real rollout conversation: pilot scope, operating readiness, founder review, and the next production action inside the FCA shell."
        primaryHref="/contact"
        primaryLabel="Request Founder Review"
        secondaryHref="/platform"
        secondaryLabel="Platform Overview"
        journey={shellJourney}
        currentJourney="conversion"
      />

      <div style={{ ...heroCardStyle, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Production planning flow</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>Move from pricing into rollout readiness</h2>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <FcaBrandMark compact />
            <AuricruxBrandMark compact />
          </div>
        </div>
        <p style={{ lineHeight: 1.7, color: "#334155", maxWidth: 860, marginBottom: 0 }}>
          The strongest motion here is not a static price sheet. It is a guided production conversation that ties scope to the live shell, platform dashboard, portal continuity, academy readiness, and Auricrux-guided next actions.
        </p>
        <div style={heroButtonRowStyle}>
          <a href="/contact" style={ctaPrimaryStyle}>Request Founder Review</a>
          <a href="/portal/platform" style={ctaSecondaryStyle}>Open Platform Dashboard</a>
          <a href="/login" style={ctaLightStyle}>Open FCA Workspace</a>
        </div>
      </div>

      <FounderJourneyStrip
        currentJourney="conversion"
        title="Pricing now sits inside the same founder journey as the rest of the shell"
        detail="This route no longer behaves like a detached price sheet. It shows where pricing fits in the path from public framing into workspace continuity, platform visibility, and founder review."
        ctaHref="/contact"
        ctaLabel="Convert to founder review"
      />

      <ExecutiveSignalBar mode="public" nextHref="/contact" nextLabel="Convert to founder review" />

      <CommercialReadinessPanel
        title="Rollout pricing now reflects live commercial state"
        detail="Pricing is now framed as a continuity-aware rollout surface that keeps approval, revenue risk, and deployment readiness visible before a founder conversation."
        primaryHref="/contact"
        primaryLabel="Request Founder Review"
        secondaryHref="/portal/platform"
        secondaryLabel="Review Live Workspace State"
      />

      <div style={{ ...twoColumnGridStyle, marginBottom: 24, marginTop: 24 }}>
        <div style={{ ...cardStyle, background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
          <h2 style={{ marginTop: 0 }}>Founder rollout checklist</h2>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8, marginBottom: 0, color: "#334155" }}>
            {rolloutSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <WorkspaceSnapshotCard
          title="Pricing now references live shell state"
          detail="This planning surface now points directly at persisted tenant, project, and Auricrux continuity so rollout conversations stay attached to the operating workspace."
          ctaHref="/portal/platform"
          ctaLabel="Review platform state before founder call"
        />
      </div>

      <div style={responsiveGrid(260)}>
        {pricingTiers.map((tier) => (
          <div key={tier.name} style={cardStyle}>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>{tier.name}</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 12 }}>{tier.price}</div>
            <p style={{ color: "#4b5563", lineHeight: 1.6 }}>{tier.detail}</p>
            <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginBottom: 0 }}>
              {tier.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>How to position the tiers</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
            Use these tiers to frame the conversation around operational maturity, rollout depth, and continuity needs. The immediate objective is to match the contractor to the right production path, not to force a generic self-serve checkout motion.
          </p>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Immediate next actions</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <a href="/contact" style={ctaPrimaryStyle}>Request Founder Review</a>
            <a href="/portal/platform" style={ctaSecondaryStyle}>Open Platform Dashboard</a>
            <a href="/portal" style={ctaLightStyle}>Open Portal Workspace</a>
          </div>
        </div>
      </div>

      <PublicActionRail
        title="Finish pricing with the same standardized public next steps"
        detail="Pricing now closes with the same shared action rail as the rest of the public shell so production planning, workspace entry, academy continuity, and founder review remain aligned."
      />

      <ShellFooter />
    </div>
  );
}
