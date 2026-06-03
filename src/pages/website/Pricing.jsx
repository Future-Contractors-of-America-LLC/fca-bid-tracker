import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import ExecutiveSignalBar from "../../components/ExecutiveSignalBar";
import CommercialReadinessPanel from "../../components/CommercialReadinessPanel";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import PublicCtaRow from "../../components/PublicCtaRow";
import { pricingTiers, publicBodyCtaSets, publicRouteCtas, shellJourney } from "../../websiteShell";
import { cardStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle } from "../../publicShellStyles";

const rolloutSteps = [
  "Confirm contractor fit, pilot scope, and current operating friction.",
  "Walk the live FCA shell from public entry through workspace, platform dashboard, portal, academy, and bid continuity.",
  "Select the rollout tier that matches readiness, team size, and continuity needs.",
  "Close on the next deployment action and rollout planning path.",
];

export default function Pricing() {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="FCA Plans & Rollout"
        title="Production rollout planning"
        subtitle="This page supports a real rollout conversation: pilot scope, operating readiness, guided setup, and the next production action inside the FCA shell."
        primaryHref={publicRouteCtas.conversion.primaryHref}
        primaryLabel={publicRouteCtas.conversion.primaryLabel}
        secondaryHref={publicRouteCtas.conversion.secondaryHref}
        secondaryLabel={publicRouteCtas.conversion.secondaryLabel}
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
          This is more than a static price sheet. It is a guided rollout conversation that ties scope to the live shell, platform dashboard, portal continuity, academy readiness, and Auricrux-guided next actions.
        </p>
        <PublicCtaRow actions={publicBodyCtaSets.pricingHero} />
      </div>

      <FounderJourneyStrip
        currentJourney="conversion"
        title="Plans should connect directly to rollout decisions"
        detail="This route does not behave like a detached price sheet. It shows where plans fit in the path from public framing into workspace continuity, platform visibility, and rollout planning."
        ctaHref="/contact"
        ctaLabel="Schedule a walkthrough"
      />

      <ExecutiveSignalBar mode="public" nextHref="/contact" nextLabel="Schedule a walkthrough" />

      <CommercialReadinessPanel
        title="Rollout planning reflects live system state"
        detail="Pricing is framed as a continuity-aware rollout surface that keeps approval, revenue risk, and deployment readiness visible before a live conversation."
        primaryHref="/contact"
        primaryLabel="Schedule a Walkthrough"
        secondaryHref="/portal/platform"
        secondaryLabel="Review Live Workspace State"
      />

      <div style={{ ...twoColumnGridStyle, marginBottom: 24, marginTop: 24 }}>
        <div style={{ ...cardStyle, background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
          <h2 style={{ marginTop: 0 }}>Rollout checklist</h2>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8, marginBottom: 0, color: "#334155" }}>
            {rolloutSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <WorkspaceSnapshotCard
          title="Pricing references live shell state"
          detail="This planning surface points directly at persisted tenant, project, and Auricrux continuity so rollout conversations stay attached to the operating workspace."
          ctaHref="/portal/platform"
          ctaLabel="Review platform state before your call"
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
          <h2 style={{ marginTop: 0 }}>How to choose a plan</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
            Use these tiers to frame the conversation around operational maturity, rollout depth, and continuity needs. The objective is to match your team to the right production path, not force a generic self-serve checkout.
          </p>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Immediate next actions</h2>
          <PublicCtaRow actions={publicBodyCtaSets.pricingImmediate} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
        </div>
      </div>

      <PublicActionRail
        title="Finish planning with a clear next step"
        detail="Pricing closes with the same shared action rail as the rest of the public site so rollout planning, workspace entry, academy continuity, and walkthrough options remain aligned."
      />

      <ShellFooter />
    </div>
  );
}
