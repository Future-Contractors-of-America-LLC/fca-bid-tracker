import FcaBrandMark from "../../components/FcaBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import ExecutiveSignalBar from "../../components/ExecutiveSignalBar";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import CustomerTrustPanel from "../../components/CustomerTrustPanel";
import PublicOperationsStrip from "../../components/PublicOperationsStrip";
import ProductProofSection from "../../components/ProductProofSection";
import CommercialReadinessPanel from "../../components/CommercialReadinessPanel";
import PublicCtaRow from "../../components/PublicCtaRow";
import PublicPackageRouteGroupsPanel from "../../components/PublicPackageRouteGroupsPanel";
import {
  executiveSignalCtaSets,
  founderJourneyCtaSets,
  platformJourneyPath,
  platformLinkedProductAreas,
  platformModules,
  publicRouteCtas,
  shellJourney,
} from "../../websiteShell";
import { saasOperationalPathways, websiteEnterpriseProof } from "../../productBlueprint";
import { cardStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle } from "../../publicShellStyles";

const platformContinuityItems = [
  {
    label: "Workspace path",
    value: "Public route to live dashboard",
    detail: "Platform framing now points directly into the unified dashboard instead of stopping at generic feature copy.",
  },
  {
    label: "Customer signal",
    value: "Portal, academy, and comms stay linked",
    detail: "Operational visibility, communication, and training readiness remain part of one platform story.",
  },
  {
    label: "Slice truth",
    value: "Real SaaS and LMS routes are reachable",
    detail: "Bids, estimates, proposals, projects, files, billing, support, Auricrux, and academy all exist as reachable route groups.",
  },
];

const platformConstructionProof = [
  {
    title: "Opportunity qualification",
    detail: "Use the bid route to show a real qualification board, estimate routing, and award-to-project handoff.",
    href: "/portal/bids",
    label: "Open Qualification Board",
  },
  {
    title: "Estimate and proposal progression",
    detail: "Use estimate and proposal routes to show pricing progression instead of abstract product claims.",
    href: "/portal/estimates",
    label: "Open Estimate Workflow",
  },
  {
    title: "Project and document control",
    detail: "Show projects, files, audit, and support as one operating spine.",
    href: "/portal/projects",
    label: "Open Project Command",
  },
  {
    title: "Academy depth",
    detail: "Open the Academy catalog to show track-complete classroom offerings tied to live portal routes.",
    href: "/academy/catalog",
    label: "Open Academy Catalog",
  },
];

export default function Platform() {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="FCA Platform"
        title="One contractor lifecycle operating system"
        subtitle="FCA now exposes real route-level product slices for qualification, estimates, proposals, projects, files, billing, support, Academy, and Auricrux instead of stopping at shell language."
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
        <h2 style={{ marginTop: 0 }}>Built to feel like one connected system because the slices are actually reachable</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860, marginBottom: 12 }}>
          FCA helps contractor teams move from opportunity to delivery with real reachable workflows for bids, estimates, proposals, projects, files, billing, support, Academy, and Auricrux guidance.
        </p>
        <PublicCtaRow
          actions={[
            { href: "/login?seeded=1", label: "Open Live Test Login", variant: "primary" },
            { href: "/academy/catalog", label: "Open Academy Catalog", variant: "secondary" },
          ]}
        />
      </div>

      <FounderJourneyStrip
        currentJourney="platform"
        title="Platform framing should lead customers into the real product experience"
        detail="This route now points into the already-existing product slices so site language matches repo truth."
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
          primaryHref="/login?seeded=1"
          primaryLabel="Open Live Test Login"
          secondaryHref="/portal/platform"
          secondaryLabel="Open Platform Dashboard"
        />
      </div>

      <ProductProofSection
        eyebrow="Construction product proof"
        title="Platform language now reflects actual construction operations"
        detail="The product path now speaks directly to qualification, estimate progression, project control, file governance, billing continuity, and Academy depth."
        highlights={platformConstructionProof}
      />

      <div style={{ marginTop: 24 }}>
        <PublicPackageRouteGroupsPanel
          eyebrow="Platform package route truth"
          title="Platform now exposes the exact route groups behind the operating system claim"
          detail="The platform surface now uses the same package-to-route truth as pricing, home, login, and contact so product depth stays route-backed instead of descriptive-only."
        />
      </div>

      <div style={{ marginTop: 24, ...cardStyle }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Real SaaS pathways</div>
        <h2 style={{ marginTop: 0 }}>FCA now presents route groups around real contractor work</h2>
        <div style={{ ...responsiveGrid(240), marginTop: 16 }}>
          {saasOperationalPathways.map((pathway) => (
            <div key={pathway.title} style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#f8fbff" }}>
              <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>{pathway.audience}</div>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{pathway.title}</h3>
              <p style={{ color: "#475569", lineHeight: 1.7 }}>{pathway.outcome}</p>
              <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155" }}>
                {pathway.modules.map((module) => (
                  <li key={module}>{module}</li>
                ))}
              </ul>
              <a href={pathway.href} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{pathway.ctaLabel}</a>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <CommercialReadinessPanel
          title="Commercial and rollout readiness"
          detail="The public platform route now connects commercial packaging, rollout readiness, communications continuity, and live product access so revenue conversations stay attached to real operating surfaces."
          primaryHref="/login?seeded=1"
          primaryLabel="Open Live Test Login"
          secondaryHref="/portal/platform"
          secondaryLabel="Open Platform Dashboard"
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
              detail: "Keep opportunities, estimates, proposals, projects, files, communications, support, and billing connected instead of scattered across separate tools.",
            },
            {
              title: "Stay ahead of blockers",
              detail: "See approvals, document gaps, billing readiness, communications posture, and next steps before they turn into delays.",
            },
            {
              title: "Support rollout and training",
              detail: "Tie onboarding, academy access, safety reinforcement, lecture delivery, and field readiness into the same operating flow.",
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
            <li>Continue into the Academy catalog or Auricrux guidance without losing tenant and workflow context.</li>
          </ol>
        </div>
        <WorkspaceSnapshotCard
          title="Public proof of workspace continuity"
          detail="The public platform page previews live workspace context so the site narrative stays connected to the working portal experience."
          ctaHref="/login?seeded=1"
          ctaLabel="Open Live Test Login"
        />
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Enterprise-ready website proof</h2>
        <div style={{ ...responsiveGrid(240), gap: 16 }}>
          {websiteEnterpriseProof.map((item) => (
            <div key={item.title} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 0 }}>{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Linked product areas</h2>
        <div style={{ ...responsiveGrid(220), gap: 12 }}>
          {platformLinkedProductAreas.map((item) => (
            <a key={item.href} href={item.href} style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>
              {item.label}
            </a>
          ))}
          <a href="/academy/catalog" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Academy Catalog</a>
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
