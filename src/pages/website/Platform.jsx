import FcaBrandMark from "../../components/FcaBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import ExecutiveSignalBar from "../../components/ExecutiveSignalBar";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicOperationsStrip from "../../components/PublicOperationsStrip";
import {
  executiveSignalCtaSets,
  founderJourneyCtaSets,
  platformJourneyPath,
  platformLinkedProductAreas,
  platformModules,
  publicRouteCtas,
  shellJourney,
} from "../../websiteShell";
import { cardStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle } from "../../publicShellStyles";

const platformContinuityItems = [
  {
    label: "Workspace path",
    value: "Public route to live dashboard",
    detail: "Platform framing now points directly into the unified dashboard instead of stopping at generic feature copy.",
  },
  {
    label: "Customer signal",
    value: "Portal and academy stay linked",
    detail: "Operational visibility, communication, and training readiness remain part of one platform story.",
  },
  {
    label: "Founder review",
    value: "Conversion path stays visible",
    detail: "A platform reader can move straight into rollout review, workspace entry, or product validation without route drift.",
  },
];

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
        <p style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860, marginBottom: 0 }}>
          FCA helps contractor teams move from opportunity to delivery with better visibility into bids, customer updates, files, billing steps, and workforce readiness.
        </p>
      </div>

      <FounderJourneyStrip
        currentJourney="platform"
        title="Platform framing should lead customers into the product experience"
        detail="This route shows the same connected customer journey used across the public site so platform framing leads naturally into workspace, portal, academy, and rollout planning."
        ctaHref={founderJourneyCtaSets.publicPlatform.href}
        ctaLabel={founderJourneyCtaSets.publicPlatform.label}
      />

      <ExecutiveSignalBar mode="public" nextHref={executiveSignalCtaSets.publicPlatform.href} nextLabel={executiveSignalCtaSets.publicPlatform.label} />

      <div style={{ marginTop: 24 }}>
        <PublicOperationsStrip
          eyebrow="Platform continuity strip"
          title="Platform messaging now mirrors the working shell"
          detail="This route now carries the same operational posture used deeper in FCA so buyers move from explanation to live product state without losing context."
          statusLabel="Route posture"
          statusValue="Conversion continuity active"
          items={platformContinuityItems}
          primaryHref="/portal/platform"
          primaryLabel="Open Platform Dashboard"
          secondaryHref="/contact"
          secondaryLabel="Open Contact & Rollout"
        />
      </div>

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
            {platformJourneyPath.map((item) => (
              <li key={item.step}>
                {item.prefix} <a href={item.href}>{item.label}</a>{item.suffix ? ` ${item.suffix}` : null}
              </li>
            ))}
            <li>Follow Auricrux guidance to keep next actions visible across the system.</li>
          </ol>
        </div>
        <WorkspaceSnapshotCard
          title="Public proof of workspace continuity"
          detail="The public platform page previews live workspace context so the site narrative stays connected to the working portal experience."
          ctaHref="/portal/platform"
          ctaLabel="Open Platform Dashboard"
        />
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Linked product areas</h2>
        <div style={{ ...responsiveGrid(220), gap: 12 }}>
          {platformLinkedProductAreas.map((item) => (
            <a key={item.href} href={item.href} style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>
              {item.label}
            </a>
          ))}
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
