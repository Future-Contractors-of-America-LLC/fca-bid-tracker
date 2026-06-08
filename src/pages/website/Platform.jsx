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
    label: "Founder review",
    value: "Conversion path stays visible",
    detail: "A platform reader can move straight into rollout review, workspace entry, commercial packaging, or product validation without route drift.",
  },
];

const platformConstructionProof = [
  {
    title: "Estimating to operations handoff",
    detail: "Use the bid and project flow to demonstrate how opportunities, scope, approvals, and awarded work stay connected.",
    href: "/bid-entry",
    label: "Open Bid Entry",
  },
  {
    title: "Project document control",
    detail: "Show files, submittals, RFIs, and customer-visible coordination inside the same operating shell.",
    href: "/portal/files",
    label: "Open Files",
  },
  {
    title: "Customer communication continuity",
    detail: "Open the portal workspace and messages to prove the product supports real owner and customer follow-through.",
    href: "/portal/messages",
    label: "Open Messages",
  },
  {
    title: "Field readiness and training",
    detail: "Keep workforce onboarding and academy continuity attached to the same delivery story.",
    href: "/academy",
    label: "Open Academy",
  },
];

export default function Platform() {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="FCA Platform"
        title="One contractor lifecycle operating system"
        subtitle="FCA is designed as a unified operating surface for bids, portal visibility, project follow-through, workforce enablement, communications routing, and guided execution."
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
        <p style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860, marginBottom: 12 }}>
          FCA helps contractor teams move from opportunity to delivery with better visibility into bids, approvals, project files, customer updates, billing steps, workforce readiness, and communications routing.
        </p>
        <PublicCtaRow
          actions={[
            { href: "/login?seeded=1", label: "Open Live Test Login", variant: "primary" },
            { href: "/login?seeded=1&autologin=1&next=/portal/platform", label: "Instant Test Workspace", variant: "secondary" },
          ]}
        />
      </div>

      <FounderJourneyStrip
        currentJourney="platform"
        title="Platform framing should lead customers into the product experience"
        detail="This route shows the same connected customer journey used across the public site so platform framing leads naturally into workspace, portal, academy, communications, and rollout planning."
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
          secondaryHref="/login?seeded=1&autologin=1&next=/portal/platform"
          secondaryLabel="Instant Test Workspace"
        />
      </div>

      <ProductProofSection
        eyebrow="Construction product proof"
        title="Platform language now reflects actual construction operations"
        detail="The product path now speaks more directly to bid handoff, document control, customer coordination, communications routing, and field readiness instead of generic SaaS movement alone."
        highlights={platformConstructionProof}
      />

      <div style={{ marginTop: 24, ...cardStyle }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Real SaaS pathways</div>
        <h2 style={{ marginTop: 0 }}>FCA now presents product pathways around real contractor work instead of abstract feature buckets</h2>
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
              detail: "Keep opportunities, projects, files, RFIs, submittals, customer communication, and revenue follow-through connected instead of scattered across separate tools.",
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
            <li>Follow Auricrux guidance to keep next actions visible across the system.</li>
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
