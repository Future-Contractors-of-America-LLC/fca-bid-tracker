import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicPackageRouteGroupsPanel from "../../components/PublicPackageRouteGroupsPanel";
import PublicCtaRow from "../../components/PublicCtaRow";
import {
  auricruxCapabilities,
  auricruxWalkthroughPath,
  publicBodyCtaSets,
  publicRouteCtas,
  shellJourney,
} from "../../websiteShell";
import { cardStyle, heroCardStyle, pageShellStyle, twoColumnGridStyle } from "../../publicShellStyles";

const operatingSteps = [
  "Reads your live tenant, project, and bid state—not static marketing pages.",
  "Surfaces the recommended next action so teams know what to do next.",
  "Stays with you across dashboard, portal, Academy, support, and admin.",
  "Feels active and operational—not a brochure.",
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
          title="Connected to your workspace"
          detail="Auricrux reads the same tenant, project, and job data you see in your dashboard—so guidance matches what is actually happening."
          ctaHref="/portal/platform"
          ctaLabel="Open your dashboard"
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

      <PublicCtaRow actions={publicBodyCtaSets.auricruxHero} style={{ marginTop: 24 }} />

      <PublicPackageRouteGroupsPanel
        eyebrow="Product depth"
        title="Where Auricrux connects across FCA"
        detail="Route groups where guidance, continuity, and next actions stay visible."
      />

      <ShellFooter />
    </div>
  );
}
