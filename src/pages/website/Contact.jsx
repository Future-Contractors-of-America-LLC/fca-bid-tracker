import FcaBrandMark from "../../components/FcaBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import ExecutiveSignalBar from "../../components/ExecutiveSignalBar";
import CommercialReadinessPanel from "../../components/CommercialReadinessPanel";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import PublicCtaRow from "../../components/PublicCtaRow";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import { contactPaths, publicActionCatalog, publicBodyCtaSets, publicRouteCtas, shellJourney } from "../../websiteShell";
import { publicContactMessaging } from "../../systemContinuity";
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
        eyebrow={publicContactMessaging.header.eyebrow}
        title={publicContactMessaging.header.title}
        subtitle={publicContactMessaging.header.subtitle}
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
        title={publicContactMessaging.journey.title}
        detail={publicContactMessaging.journey.detail}
        ctaHref={publicActionCatalog.walkthrough.href}
        ctaLabel={publicActionCatalog.walkthrough.label}
      />

      <ExecutiveSignalBar mode="public" nextHref={publicActionCatalog.platform.href} nextLabel="Review live workspace state" />

      <div style={{ marginBottom: 24 }}>
        <CustomerTrustPanel
          eyebrow={publicContactMessaging.trust.eyebrow}
          title={publicContactMessaging.trust.title}
          detail={publicContactMessaging.trust.detail}
          items={[
            {
              title: "See the real workspace",
              detail: "Walk through the platform, portal, and academy routes instead of a disconnected slide deck.",
            },
            {
              title: "Focus on your team's fit",
              detail: "Use the conversation to match your team size, process, and rollout needs to the right next step.",
            },
            {
              title: "Leave with a practical plan",
              detail: "End with a clear pilot, rollout, or follow-up action instead of an open-ended discussion.",
            },
          ]}
        />
      </div>

      <CommercialReadinessPanel
        title="Your walkthrough begins from real operating context"
        detail="Contact is framed as a customer-ready conversion surface that inherits the same approval, revenue, and rollout readiness state shown across Auricrux, platform, portal, and academy routes."
        primaryHref={publicActionCatalog.walkthrough.href}
        primaryLabel={publicActionCatalog.walkthrough.label}
        secondaryHref={publicActionCatalog.platform.href}
        secondaryLabel={publicActionCatalog.platform.label}
      />

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <WorkspaceSnapshotCard
            title={publicContactMessaging.snapshot.title}
            detail={publicContactMessaging.snapshot.detail}
            ctaHref={publicActionCatalog.platform.href}
            ctaLabel={publicContactMessaging.snapshot.ctaLabel}
          />

          <div style={{ ...cardStyle, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
            <h2 style={{ marginTop: 0 }}>What happens in a walkthrough</h2>
            <ol style={checklistStyle}>
              <li>Review the FCA platform story from the public site.</li>
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
        <h2 style={{ marginTop: 0 }}>{publicContactMessaging.immediate.title}</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
          {publicContactMessaging.immediate.detail}
        </p>
        <PublicCtaRow actions={publicBodyCtaSets.contactImmediate} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
      </div>

      <PublicActionRail
        title={publicContactMessaging.actionRail.title}
        detail={publicContactMessaging.actionRail.detail}
      />

      <ShellFooter />
    </div>
  );
}
