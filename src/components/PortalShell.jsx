import { useState } from "react";
import ShellHeader from "./ShellHeader";
import ShellFooter from "./ShellFooter";
import ProjectSpineBar from "./ProjectSpineBar";
import useWorkspaceState from "../hooks/useWorkspaceState";
import { portalHubModules, portalModules, PORTAL_SUBTITLE_MAX } from "../systemState";
import { portalTokens } from "../portalDesignTokens";

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

function truncateSubtitle(subtitle) {
  if (!subtitle || typeof subtitle !== "string") return subtitle;
  const trimmed = subtitle.trim();
  if (trimmed.length <= PORTAL_SUBTITLE_MAX) return trimmed;
  return `${trimmed.slice(0, PORTAL_SUBTITLE_MAX - 1).trimEnd()}…`;
}

/**
 * Portal chrome: top nav + page title + project selector.
 * Session / journey / route-theater bars are intentionally omitted — they duplicated
 * brand, next-action, and project state until text became unreadable.
 */
export default function PortalShell({
  title,
  subtitle,
  activeHref,
  children,
  workspaceState = null,
}) {
  const workspaceApi = useWorkspaceState();
  const resolvedState = workspaceState || workspaceApi.state;
  const [showAllModules, setShowAllModules] = useState(false);
  const isHubPage = activeHref === "/portal/platform";
  const sectionModules = showAllModules ? portalModules : portalHubModules;

  return (
    <div style={shellStyle}>
      <div style={pageStyle}>
        <ShellHeader
          eyebrow=""
          title={title}
          subtitle={truncateSubtitle(subtitle)}
          showTopNav
          topNavMode="portal"
          compact
          showJourney={false}
        />

        <ProjectSpineBar tenant={resolvedState.tenant} project={resolvedState.project} compact />

        {isHubPage ? (
          <nav style={routeTabsWrapStyle} aria-label="Portal products">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>Open a lane</div>
                <div style={{ color: portalTokens.muted, fontSize: 13, marginTop: 4 }}>Pick one module and work the active project.</div>
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
                {showAllModules ? "Essentials" : "All modules"}
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
