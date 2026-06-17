import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import ExecutiveSignalBar from "../../components/ExecutiveSignalBar";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import BuildExpansionCommandDeck from "../../components/BuildExpansionCommandDeck";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicCtaRow from "../../components/PublicCtaRow";
import PublicOperationsStrip from "../../components/PublicOperationsStrip";
import PublicPackageRouteGroupsPanel from "../../components/PublicPackageRouteGroupsPanel";
import {
  auricruxCapabilities,
  auricruxWalkthroughPath,
  executiveSignalCtaSets,
  founderJourneyCtaSets,
  publicBodyCtaSets,
  publicRouteCtas,
  shellJourney,
} from "../../websiteShell";
import { cardStyle, heroCardStyle, pageShellStyle, twoColumnGridStyle } from "../../publicShellStyles";

const operatingSteps = [
  "Read persisted tenant, project, bid, and workspace state rather than treating pages as disconnected views.",
  "Surface the current recommended action and blocker so customers and teams can see what should happen next across approvals, permits, billing, and mobilization.",
  "Maintain continuity as users move between platform dashboard, portal routes, academy, support, and admin.",
  "Keep the experience feeling active, guided, and operational rather than static or brochure-like.",
];

const auricruxContinuityItems = [
  {
    label: "Guidance layer",
    value: "Auricrux now mirrors public-shell continuity",
    detail: "The route now explicitly carries the same operating strip used on other conversion surfaces so guidance feels embedded in the product story.",
  },
  {
    label: "System role",
    value: "Public explanation tied to live state",
    detail: "Auricrux framing now stays anchored to platform, portal, academy, and founder-review motion instead of reading like isolated brand copy.",
  },
  {
    label: "Next move",
    value: "Review dashboard or rollout path",
    detail: "The route closes toward live workspace inspection or rollout planning so customer guidance remains actionable.",
  },
];

export default function AuricruxPage() {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="Auricrux Guidance"
        title="Auricrux stays active across the FCA experience"
        subtitle="Auricrux is presented here as the visible guidance layer that reads state, explains continuity, recommends next actions, and keeps the public site connected to the working FCA workspace."
        primaryHref={publicRouteCtas.auricrux.primaryHref}
        primaryLabel={publicRouteCtas.auricrux.primaryLabel}
        secondaryHref={publicRouteCtas.auricrux.secondaryHref}
        secondaryLabel={publicRouteCtas.auricrux.secondaryLabel}
        journey={shellJourney}
        currentJourney="platform"
      />

      <div style={{ ...heroCardStyle, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Guided visibility</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>Auricrux is part of the product experience</h2>
          </div>
          <AuricruxBrandMark />
        </div>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>
          This page frames Auricrux as the active guidance layer that keeps tenant, project, route, and next-step context visible as users move through estimating, approvals, document control, billing follow-through, and workforce readiness.
        </p>
        <PublicCtaRow actions={publicBodyCtaSets.auricruxHero} />
      </div>

      <FounderJourneyStrip
        currentJourney="platform"
        title="Auricrux should support the same customer journey visible across FCA"
        detail="This route reinforces the path from public framing into workspace, portal continuity, academy readiness, and rollout planning while Auricrux explains what should happen next."
        ctaHref={founderJourneyCtaSets.publicAuricrux.href}
        ctaLabel={founderJourneyCtaSets.publicAuricrux.label}
      />

      <ExecutiveSignalBar mode="public" nextHref={executiveSignalCtaSets.publicAuricrux.href} nextLabel={executiveSignalCtaSets.publicAuricrux.label} />

      <div style={{ marginBottom: 24 }}>
        <PublicOperationsStrip
          eyebrow="Auricrux continuity strip"
          title="Auricrux now carries the same continuity posture as the rest of the shell"
          detail="This route now explicitly shares the same operating strip used across public conversion pages so the guidance layer feels connected to live product state and rollout motion."
          statusLabel="Guidance posture"
          statusValue="System continuity active"
          items={auricruxContinuityItems}
          primaryHref="/portal/platform"
          primaryLabel="Open Platform Dashboard"
          secondaryHref="/pricing"
          secondaryLabel="Plans & Rollout"
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <PublicPackageRouteGroupsPanel
          eyebrow="Auricrux package route truth"
          title="Auricrux now shows the exact route groups behind the guided system story"
          detail="The guidance-layer explanation now resolves to the same shared SaaS, portal, Academy, Auricrux/comms, and revenue continuity route groups used across the rest of the public conversion shell."
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <CustomerTrustPanel
          eyebrow="What Auricrux improves"
          title="Guidance that helps contractor teams stay aligned"
          detail="Auricrux helps teams understand what needs attention next without forcing owners, estimators, project coordinators, or field leads to piece the workflow together on their own."
          items={[
            {
              title: "Clarify next steps",
              detail: "Make approvals, RFIs, submittals, follow-ups, and rollout actions easier to see across the workspace.",
            },
            {
              title: "Preserve continuity",
              detail: "Keep portal, communications, files, billing, and academy activity connected instead of fragmented.",
            },
            {
              title: "Support customer confidence",
              detail: "Show a guided experience that feels active and understandable during walkthroughs and day-to-day use.",
            },
          ]}
        />
      </div>

      <BuildExpansionCommandDeck
        title="Build expansion now has a visible command layer"
        detail="This page shows that the FCA build is expanding as one governed system across automation, SaaS continuity, website conversion, academy readiness, and communications follow-through."
        primaryHref="/portal/platform"
        primaryLabel="Open Platform Dashboard"
        secondaryHref="/pricing"
        secondaryLabel="Plans & Rollout"
      />

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>What Auricrux is doing in FCA</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {auricruxCapabilities.map((item) => (
                <div key={item} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...cardStyle, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
            <h2 style={{ marginTop: 0 }}>How Auricrux behaves in the product</h2>
            <ol style={{ paddingLeft: 20, lineHeight: 1.8, marginBottom: 0, color: "#334155" }}>
              {operatingSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <WorkspaceSnapshotCard
          title="Auricrux is tied to live workspace continuity"
          detail="This page references the same persisted tenant, project, and Auricrux state used across the platform dashboard and portal surfaces so the guidance story stays believable."
          ctaHref="/portal/platform"
          ctaLabel="Open Platform Dashboard"
        />
      </div>

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Where customers see it</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9, marginBottom: 0 }}>
            <li>Persistent dock across the experience</li>
            <li>Platform dashboard next-action visibility</li>
            <li>Portal route guidance and continuity</li>
            <li>Academy coaching continuity</li>
            <li>Support and admin context</li>
            <li>Customer walkthrough support</li>
          </ul>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Suggested walkthrough path</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {auricruxWalkthroughPath.map((item) => (
              <a
                key={item.step}
                href={item.href}
                style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}
              >
                {item.step}. {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Why this matters</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          Auricrux makes FCA feel active rather than static. Instead of showing disconnected pages, FCA can demonstrate a guidance layer that gives context, next actions, and continuity as customers move between preconstruction, project execution, training, support, admin, and production planning.
        </p>
      </div>

      <PublicActionRail
        title="Close the Auricrux story with clear next steps"
        detail="This page ends in the same clear next steps as the rest of the public site so guidance, platform state, and conversion stay aligned."
      />

      <ShellFooter />
    </div>
  );
}
