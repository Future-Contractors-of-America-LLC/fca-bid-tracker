import ShellHeader from "./ShellHeader";
import ShellFooter from "./ShellFooter";
import ProjectSpineBar from "./ProjectSpineBar";
import WorkspaceContextBar from "./WorkspaceContextBar";
import AuricruxStatusRail from "./AuricruxStatusRail";
import RouteStateOverlay from "./RouteStateOverlay";
import FcaBrandMark from "./FcaBrandMark";
import AuricruxBrandMark from "./AuricruxBrandMark";
import ExecutiveSignalBar from "./ExecutiveSignalBar";
import AuricruxPresenceLayer from "./AuricruxPresenceLayer";
import CustomerSessionBar from "./CustomerSessionBar";
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

const routeTabsStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 20,
  marginBottom: 24,
};

const routeTabStyle = {
  display: "inline-flex",
  textDecoration: "none",
  border: "1px solid #dbe3ef",
  borderRadius: 999,
  background: "#fff",
  padding: "10px 14px",
  color: "#334155",
  fontWeight: 700,
};

const activeRouteTabStyle = {
  ...routeTabStyle,
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
  const workspaceApi = useWorkspaceState();
  const resolvedState = workspaceState || workspaceApi.state;

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
        <RouteStateOverlay overlay={routeOverlay} />
        <ExecutiveSignalBar mode="portal" nextHref={executiveSignalCtaSets.portal.href} nextLabel={executiveSignalCtaSets.portal.label} />

        <div style={{ marginBottom: 20 }}>
          <AuricruxPresenceLayer
            surfaceLabel="Auricrux embedded in portal shell"
            title="Auricrux remains embedded while portal navigation stays simpler"
            detail={routeOverlay ? `${routeOverlay.summary} ${routeOverlay.auricruxDetail}` : "Auricrux remains embedded in the portal shell while the page keeps task-first embedded navigation instead of heavy overlay navigation."}
            primaryHref={primaryHref}
            primaryLabel={primaryLabel}
            secondaryHref={executiveSignalCtaSets.portal.href}
            secondaryLabel={executiveSignalCtaSets.portal.label}
            compact
          />
        </div>

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

        <nav style={routeTabsStyle} aria-label="Portal section navigation">
          {portalModules.map((module) => {
            const isActive = module.href === activeHref;
            return (
              <a
                key={module.href}
                href={module.href}
                style={isActive ? activeRouteTabStyle : routeTabStyle}
                title={module.description}
              >
                {module.label}
              </a>
            );
          })}
        </nav>

        {children}

        <ShellFooter />
      </div>
    </div>
  );
}
