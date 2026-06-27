import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import PortalWorkspaceGuide from "../../components/PortalWorkspaceGuide";
import { PortalPageIntro, PortalQuickStats } from "../../components/portal/PortalPrimitives";
import { portalHubModules } from "../../systemState";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalEyebrowStyle, portalTokens } from "../../portalDesignTokens";

const opsLanes = [
  {
    title: "Review intake leads",
    detail: "Qualify governed leads into opportunities on the commercial spine.",
    href: "/portal/leads",
    label: "Open leads board",
  },
  {
    title: "Qualify opportunities",
    detail: "Score bids, confirm scope, and route qualified work into estimates.",
    href: "/portal/bids",
    label: "Open qualification board",
  },
  {
    title: "Run commercial pipeline",
    detail: "Move awarded work through project conversion, billing, and payment.",
    href: "/portal/pipeline",
    label: "Open pipeline wizard",
  },
  {
    title: "Deliver active projects",
    detail: "Track stages, mobilization, RFIs, files, and closeout on the project spine.",
    href: "/portal/projects",
    label: "Open projects",
  },
  {
    title: "Run finance in FCA Books",
    detail: "Record payments, job costs, pay apps, and banking activity.",
    href: "/portal/finance",
    label: "Open finance",
  },
];

export default function PortalOperations() {
  const { state } = useWorkspaceState();
  const moduleCount = portalHubModules.length;

  return (
    <PortalShell
      title="Operations command"
      subtitle="Start here when you need to know what to open next across sales, delivery, and billing."
      activeHref="/portal/operations"
      currentJourney="lead"
      primaryHref="/portal/pipeline"
      primaryLabel="Open pipeline"
      showRouteOverlay={false}
    >
      <PortalSliceAuricrux
        title="Auricrux Operations Intelligence"
        targetObjectId={state?.project?.id || "OPERATIONS"}
        sourceRoute="/portal/operations"
        rationale="Operations command must route teams through sovereign FCA lanes from opportunity to cash."
        nextAction="Open the pipeline wizard for the next commercial action."
        actionHref="/portal/pipeline"
        actionLabel="Open pipeline"
      />
      <PortalPageIntro
        eyebrow="Operations hub"
        title="Use FCA like an enterprise system — pick a lane and execute"
        detail="This page replaces guesswork with a single map of how contractor teams move from opportunity to cash collection."
      />

      <PortalQuickStats
        items={[
          { label: "Core modules", value: moduleCount, hint: "Available from workspace hub" },
          { label: "Recommended start", value: "Pipeline", hint: "Qualify → project → invoice → payment" },
          { label: "Finance lane", value: "FCA Books", hint: "Native AR, AP, GL, and pay apps" },
        ]}
      />

      <PortalWorkspaceGuide compact />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 16 }}>
        {opsLanes.map((lane) => (
          <article key={lane.href} style={portalCardStyle}>
            <div style={portalEyebrowStyle}>Operations lane</div>
            <h3 style={{ margin: "6px 0 8px", fontSize: "1.05rem" }}>{lane.title}</h3>
            <p style={{ color: portalTokens.body, lineHeight: 1.55, marginTop: 0, marginBottom: 12, fontSize: 14 }}>{lane.detail}</p>
            <a href={lane.href} style={portalButtonPrimary}>{lane.label}</a>
          </article>
        ))}
      </div>

      <div style={{ ...portalCardStyle, background: portalTokens.primarySoft }}>
        <div style={portalEyebrowStyle}>Need the full module directory?</div>
        <p style={{ color: portalTokens.body, lineHeight: 1.6, marginTop: 8, marginBottom: 12 }}>
          Return to the workspace hub for files, messages, Academy, support, admin, and all specialized modules.
        </p>
        <a href="/portal/platform" style={portalButtonSecondary}>Back to workspace hub</a>
      </div>
    </PortalShell>
  );
}
