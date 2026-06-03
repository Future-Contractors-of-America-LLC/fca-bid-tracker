import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import ExecutiveSignalBar from "../../components/ExecutiveSignalBar";
import FounderJourneyStrip from "../../components/FounderJourneyStrip";
import PublicActionRail from "../../components/PublicActionRail";
import BuildExpansionCommandDeck from "../../components/BuildExpansionCommandDeck";
import { auricruxCapabilities, publicRouteCtas, shellJourney } from "../../websiteShell";
import { cardStyle, heroCardStyle, pageShellStyle, twoColumnGridStyle } from "../../publicShellStyles";

const operatingSteps = [
  "Read persisted tenant, project, and workspace state rather than treating pages as disconnected views.",
  "Surface the current recommended action and blocker so customers and founders see what should happen next.",
  "Maintain continuity as the user moves between platform dashboard, portal routes, academy, support, and admin.",
  "Keep the shell feeling active, guided, and operational rather than static or brochure-like.",
];

export default function AuricruxPage() {
  return (
    <div style={pageShellStyle}>
      <ShellHeader
        eyebrow="Auricrux Embedded Operating Layer"
        title="Auricrux stays active across the FCA shell"
        subtitle="Auricrux is presented here as the visible operating layer that reads state, explains continuity, recommends next actions, and keeps the public shell connected to the working FCA workspace."
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
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Embedded operating layer</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>Auricrux is part of the shell, not outside it</h2>
          </div>
          <AuricruxBrandMark />
        </div>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>
          This public surface now frames Auricrux as the active system layer that keeps tenant, project, route, and next-action context visible as the user moves through the FCA experience.
        </p>
      </div>

      <FounderJourneyStrip
        currentJourney="platform"
        title="Auricrux should narrate the same founder journey visible across the shell"
        detail="This route now reinforces the canonical path from public framing into workspace, portal continuity, academy readiness, and founder review while Auricrux explains state along the way."
        ctaHref="/portal/platform"
        ctaLabel="Open live platform state"
      />

      <ExecutiveSignalBar mode="public" nextHref="/portal/platform" nextLabel="Open unified platform state" />

      <BuildExpansionCommandDeck
        title="Build expansion now has a visible command layer"
        detail="This page now shows that the FCA build is expanding as one governed operating system across automation, SaaS continuity, website conversion, academy readiness, and communications follow-through."
        primaryHref="/portal/platform"
        primaryLabel="Inspect live operating routes"
        secondaryHref="/pricing"
        secondaryLabel="Review rollout planning"
      />

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>What Auricrux is doing in this shell</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {auricruxCapabilities.map((item) => (
                <div key={item} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...cardStyle, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
            <h2 style={{ marginTop: 0 }}>How Auricrux behaves like an operating layer</h2>
            <ol style={{ paddingLeft: 20, lineHeight: 1.8, marginBottom: 0, color: "#334155" }}>
              {operatingSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <WorkspaceSnapshotCard
          title="Auricrux is tied to live shell continuity"
          detail="This page now references the same persisted tenant, project, and Auricrux state used across the platform dashboard and portal surfaces so the operating-layer story stays believable."
          ctaHref="/portal/platform"
          ctaLabel="Review unified platform state"
        />
      </div>

      <div style={{ ...twoColumnGridStyle, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Visible operating surfaces</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9, marginBottom: 0 }}>
            <li>Persistent dock across the shell</li>
            <li>Platform dashboard next-action visibility</li>
            <li>Portal route guidance and continuity</li>
            <li>Academy coaching continuity</li>
            <li>Support and admin operating context</li>
            <li>Founder demo narration support</li>
          </ul>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Direct founder demo path</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <a href="/platform" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>1. Frame the unified FCA platform story</a>
            <a href="/login" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>2. Enter the workspace shell</a>
            <a href="/portal/platform" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>3. Open the unified platform dashboard</a>
            <a href="/portal" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>4. Show portal continuity and next actions</a>
            <a href="/academy" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>5. Continue into academy readiness</a>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Why this matters commercially</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          Auricrux makes the shell feel active rather than static. Instead of showing disconnected pages, FCA can demonstrate an embedded operating layer that gives context, next actions, and continuity as customers move between sales, execution, training, support, admin, and production planning surfaces.
        </p>
      </div>

      <PublicActionRail
        title="Close the Auricrux narrative with the same production actions used elsewhere"
        detail="The operating-layer page should still end in the same concrete next steps as the rest of the public shell so narration, platform state, and conversion stay aligned."
      />

      <ShellFooter />
    </div>
  );
}
