import { useState } from "react";
import ShellHeader from "./ShellHeader";
import ShellFooter from "./ShellFooter";
import ProjectSpineBar from "./ProjectSpineBar";
import WorkspaceContextBar from "./WorkspaceContextBar";
import RouteStateOverlay from "./RouteStateOverlay";
import CustomerSessionBar from "./CustomerSessionBar";
import RouteReadinessOverlay from "./RouteReadinessOverlay";
import useCustomerSession from "../hooks/useCustomerSession";
import useWorkspaceState from "../hooks/useWorkspaceState";
import { portalShellCtas } from "../websiteShell";
import { portalHubHrefs, portalHubModules, portalJourney, portalModules } from "../systemState";
import { portalCardStyle, portalEyebrowStyle, portalTokens } from "../portalDesignTokens";

const shellStyle = {
  padding: "clamp(16px, 3vw, 28px) clamp(16px, 3vw, 24px) 48px",
  fontFamily: portalTokens.font,
  background: portalTokens.surface,
  minHeight: "100vh",
};

const pageStyle = {
  maxWidth: portalTokens.maxContent,
  margin: "0 auto",
};

const routeTabsWrapStyle = {
  marginTop: 8,
  marginBottom: 24,
  padding: 18,
  border: `1px solid ${portalTokens.border}`,
  borderRadius: portalTokens.radiusLg,
  background: portalTokens.panel,
  boxShadow: portalTokens.shadowSm,
};

const routeGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 10,
};

const routeCardStyle = {
  display: "block",
  textDecoration: "none",
  border: `1px solid ${portalTokens.border}`,
  borderRadius: portalTokens.radiusMd,
  background: portalTokens.panel,
  padding: "14px 14px 12px",
  color: portalTokens.body,
  transition: "border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease",
};

const activeRouteCardStyle = {
  ...routeCardStyle,
  background: portalTokens.primarySoft,
  border: `1px solid #bfdbfe`,
  color: portalTokens.primaryInk,
  boxShadow: portalTokens.shadowSm,
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
  navDensity = "compact",
  showRouteOverlay: showRouteOverlayProp = null,
}) {
  const { session, setProductAccess, setCommsAccess, applyPlanPreset } = useCustomerSession();
  const workspaceApi = useWorkspaceState();
  const resolvedState = workspaceState || workspaceApi.state;
  const { refreshSyncStamp } = workspaceApi;
  const [showAllModules, setShowAllModules] = useState(false);
  const isHubPage = navDensity === "full" || portalHubHrefs.includes(activeHref);
  const sectionModules = showAllModules ? portalModules : portalHubModules;
  const showRouteOverlay = showRouteOverlayProp ?? Boolean(routeOverlay && !isHubPage);

  return (
    <div style={shellStyle}>
      <div style={pageStyle}>
        <ShellHeader
          eyebrow={isHubPage ? "FCA Workspace" : "FCA Portal"}
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
          compact={!isHubPage}
          showJourney={isHubPage}
        />

        <CustomerSessionBar requestedPath={activeHref} compact={!isHubPage} />

        {!isHubPage ? (
          <ProjectSpineBar tenant={resolvedState.tenant} project={resolvedState.project} compact />
        ) : (
          <ProjectSpineBar tenant={resolvedState.tenant} project={resolvedState.project} />
        )}

        {isHubPage ? (
          <WorkspaceContextBar tenant={resolvedState.tenant} project={resolvedState.project} workspace={resolvedState.workspace} />
        ) : null}

        {showRouteOverlay && routeOverlay ? (
          <RouteStateOverlay overlay={routeOverlay} compact />
        ) : null}

        <RouteReadinessOverlay
          activeHref={activeHref}
          session={session}
          setProductAccess={setProductAccess}
          setCommsAccess={setCommsAccess}
          applyPlanPreset={applyPlanPreset}
          refreshSyncStamp={refreshSyncStamp}
        />

        {isHubPage ? (
          <nav style={routeTabsWrapStyle} aria-label="Portal quick access">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={portalEyebrowStyle}>Quick access</div>
                <div style={{ fontWeight: 800, fontSize: 18, marginTop: 4 }}>Every operational surface in one workspace</div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllModules((open) => !open)}
                style={{
                  border: `1px solid ${portalTokens.borderStrong}`,
                  background: showAllModules ? portalTokens.primarySoft : portalTokens.panel,
                  color: portalTokens.primaryInk,
                  borderRadius: portalTokens.radiusSm,
                  padding: "8px 14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {showAllModules ? "Show essentials" : "All modules"}
              </button>
            </div>
            <div style={routeGridStyle}>
              {sectionModules.map((module) => {
                const isActive = module.href === activeHref;
                return (
                  <a
                    key={module.href}
                    href={module.href}
                    style={isActive ? activeRouteCardStyle : routeCardStyle}
                  >
                    <div style={{ fontWeight: 800, marginBottom: 4, fontSize: 14 }}>{module.label}</div>
                    <div style={{ fontSize: 12, lineHeight: 1.45, color: isActive ? portalTokens.primaryInk : portalTokens.muted }}>
                      {module.description}
                    </div>
                  </a>
                );
              })}
            </div>
          </nav>
        ) : null}

        {children}

        <ShellFooter />
      </div>
    </div>
  );
}
