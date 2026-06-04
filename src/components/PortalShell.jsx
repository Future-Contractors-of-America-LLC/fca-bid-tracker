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
import AuricruxNavHint from "./AuricruxNavHint";
import CustomerSessionBar from "./CustomerSessionBar";
import { executiveSignalCtaSets, portalShellCtas } from "../websiteShell";
import { auricruxRail, currentProject, portalJourney, portalModules, portalTenant, workspaceContext } from "../systemState";

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

const navGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  marginTop: 28,
  marginBottom: 24,
};

const navCardStyle = {
  display: "block",
  textDecoration: "none",
  border: "1px solid #dbe3ef",
  borderRadius: 14,
  background: "#fff",
  padding: 16,
  color: "#111827",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
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

export default function PortalShell({
  title,
  subtitle,
  activeHref,
  currentJourney,
  routeOverlay,
  children,
  primaryHref = "/portal/messages",
  primaryLabel = "Open Messages",
}) {
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

        <ProjectSpineBar tenant={portalTenant} project={currentProject} />
        <WorkspaceContextBar tenant={portalTenant} project={currentProject} workspace={workspaceContext} />
        <AuricruxStatusRail project={currentProject} rail={auricruxRail} />
        <RouteStateOverlay overlay={routeOverlay} />
        <ExecutiveSignalBar mode="portal" nextHref={executiveSignalCtaSets.portal.href} nextLabel={executiveSignalCtaSets.portal.label} />

        <div style={{ marginBottom: 20 }}>
          <AuricruxPresenceLayer
            surfaceLabel="Auricrux embedded in portal shell"
            title="Auricrux is now embedded inside the route frame, not just the route content"
            detail={routeOverlay ? `${routeOverlay.summary} ${routeOverlay.auricruxDetail}` : "Auricrux remains active at the route-frame level so shell navigation, decisions, and continuity stay under one intelligence layer."}
            primaryHref={primaryHref}
            primaryLabel={primaryLabel}
            secondaryHref={executiveSignalCtaSets.portal.href}
            secondaryLabel={executiveSignalCtaSets.portal.label}
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

        <div style={navGridStyle}>
          {portalModules.map((module) => {
            const isActive = module.href === activeHref;
            return (
              <div key={module.href} style={{ minWidth: 0 }}>
                <a
                  href={module.href}
                  style={{
                    ...navCardStyle,
                    border: isActive ? "1px solid #2563eb" : navCardStyle.border,
                    background: isActive ? "#eff6ff" : navCardStyle.background,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{module.label}</div>
                  <div style={{ color: "#4b5563", lineHeight: 1.5, fontSize: 14 }}>{module.description}</div>
                </a>
                <AuricruxNavHint item={module} />
              </div>
            );
          })}
        </div>

        {children}

        <ShellFooter />
      </div>
    </div>
  );
}
