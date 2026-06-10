import ShellHeader from "./ShellHeader";
import ShellFooter from "./ShellFooter";
import ProjectSpineBar from "./ProjectSpineBar";
import WorkspaceContextBar from "./WorkspaceContextBar";
import AuricruxStatusRail from "./AuricruxStatusRail";
import RouteStateOverlay from "./RouteStateOverlay";
import FcaBrandMark from "./FcaBrandMark";
import AuricruxBrandMark from "./AuricruxBrandMark";
import ExecutiveSignalBar from "./ExecutiveSignalBar";
import CustomerSessionBar from "./CustomerSessionBar";
import RouteReadinessOverlay from "./RouteReadinessOverlay";
import AutomationRecoveryFeed from "./AutomationRecoveryFeed";
import useCustomerSession from "../hooks/useCustomerSession";
import useWorkspaceState from "../hooks/useWorkspaceState";
import { executiveSignalCtaSets, portalShellCtas } from "../websiteShell";
import { portalJourney, portalModules } from "../systemState";

const shellStyle = {
  padding: 40,
  fontFamily: "Arial",
  background: "#f8fafc",
  minHeight: "100vh",
};

const pageStyle = {
  maxWidth: 1180,
  margin: "0 auto",
};

const bannerStyle = {
  border: "1px solid #bfdbfe",
  background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
  borderRadius: 16,
  padding: 18,
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  alignItems: "center",
};

const bannerButtonStyle = {
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
};

const routeTabsWrapStyle = {
  marginTop: 20,
  marginBottom: 24,
  padding: 16,
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  background: "#ffffff",
};

const routeGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const routeCardStyle = {
  display: "block",
  textDecoration: "none",
  border: "1px solid #dbe3ef",
  borderRadius: 14,
  background: "#fff",
  padding: 14,
  color: "#334155",
};

const activeRouteCardStyle = {
  ...routeCardStyle,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1d4ed8",
};

export default function PortalShell({
  title,
  subtitle,
  activeHref,
  currentJourney,
  routeOverlay,
  children,
  primaryHref = "/portal/messages",
  primaryLabel = "Open Messages",
  workspaceState = null,
}) {
  const { session, setProductAccess, setCommsAccess, applyPlanPreset } = useCustomerSession();
  const workspaceApi = useWorkspaceState();
  const resolvedState = workspaceState || workspaceApi.state;
  const { refreshSyncStamp } = workspaceApi;

  return (
    <div style={shellStyle}>
      <div style={pageStyle}>
        <ShellHeader
          eyebrow="FCA Customer Portal"
          title={title}
          subtitle={subtitle}
          primaryHref={primaryHref}
          primaryLabel={primaryLabel}
          secondaryHref={portalShellCtas.headerSecondary.href}
          secondaryLabel={portalShellCtas.headerSecondary.label}
          journey={portalJourney}
          currentJourney={currentJourney}
          showTopNav
          topNavMode="portal"
        />

        <CustomerSessionBar requestedPath={activeHref} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 18,
            padding: "14px 16px",
            border: "1px solid #dbe3ef",
            borderRadius: 18,
            background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
          }}
        >
          <FcaBrandMark compact />
          <AuricruxBrandMark compact />
        </div>

        <ProjectSpineBar tenant={resolvedState.tenant} project={resolvedState.project} />
        <WorkspaceContextBar tenant={resolvedState.tenant} project={resolvedState.project} workspace={resolvedState.workspace} />
        <AuricruxStatusRail project={resolvedState.project} rail={resolvedState.auricrux} />
        <ExecutiveSignalBar mode="portal" nextHref={executiveSignalCtaSets.portal.href} nextLabel={executiveSignalCtaSets.portal.label} />
        <RouteStateOverlay overlay={routeOverlay} />

        <RouteReadinessOverlay
          activeHref={activeHref}
          session={session}
          setProductAccess={setProductAccess}
          setCommsAccess={setCommsAccess}
          applyPlanPreset={applyPlanPreset}
          refreshSyncStamp={refreshSyncStamp}
        />

        <div style={bannerStyle}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>
              Unified customer journey
            </div>
            <div style={{ color: "#334155", lineHeight: 1.6, maxWidth: 760 }}>
              This portal shell carries the same customer from bid visibility into project execution,
              file coordination, communication follow-through, billing readiness, and academy onboarding.
            </div>
          </div>
          <a href={portalShellCtas.journeyBanner.href} style={bannerButtonStyle}>{portalShellCtas.journeyBanner.label}</a>
        </div>

        <nav style={routeTabsWrapStyle} aria-label="Portal section navigation">
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 10 }}>Portal sections</div>
          <div style={routeGridStyle}>
            {portalModules.map((module) => {
              const isActive = module.href === activeHref;
              return (
                <a
                  key={module.href}
                  href={module.href}
                  style={isActive ? activeRouteCardStyle : routeCardStyle}
                >
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>{module.label}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: isActive ? "#1d4ed8" : "#64748b" }}>
                    {module.description}
                  </div>
                </a>
              );
            })}
          </div>
        </nav>

        <AutomationRecoveryFeed title="Shared automation recovery feed" detail="Recent Auricrux repairs, plan activations, route readiness corrections, and comms mutations remain visible across portal routes so continuity becomes durable instead of route-local only." />

        {children}

        <ShellFooter />
      </div>
    </div>
  );
}
