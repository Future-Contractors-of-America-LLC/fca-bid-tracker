import AuricruxBrandMark from "./AuricruxBrandMark";
import AuricruxDoTeachBar from "./AuricruxDoTeachBar";
import { resolveActionPair } from "../ctaBehavior";
import { getSurfaceConfig } from "../config/auricruxSurfaceConfig";
import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";

const shellStyle = {
  border: "1px solid #e5d3a1",
  borderRadius: 16,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  padding: 16,
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const linkStyle = {
  textDecoration: "none",
  border: "1px solid #e5d3a1",
  background: "#fffdf7",
  color: "#8a6a14",
  borderRadius: 999,
  padding: "8px 10px",
  fontSize: 12,
  fontWeight: 700,
};

export default function AuricruxPresenceLayer({
  surfaceKey,
  surfaceLabel,
  title,
  detail,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  compact = false,
  showDoTeach = true,
}) {
  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname;
  const surface = getSurfaceConfig(surfaceKey, currentPath);
  const resolvedLabel = surfaceLabel || surface.surfaceLabel;
  const resolvedTitle = title || surface.title;
  const resolvedDetail = detail || surface.detail;
  const resolvedPrimaryHref = primaryHref || surface.primaryHref;
  const resolvedPrimaryLabel = primaryLabel || surface.primaryLabel;
  const resolvedSecondaryHref = secondaryHref || surface.secondaryHref;
  const resolvedSecondaryLabel = secondaryLabel || surface.secondaryLabel;
  const { primary, secondary } = resolveActionPair(
    { href: resolvedPrimaryHref, label: resolvedPrimaryLabel },
    { href: resolvedSecondaryHref, label: resolvedSecondaryLabel },
    currentPath
  );

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: compact ? "flex-start" : "center", flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ minWidth: 0, flex: "1 1 420px" }}>
          <div style={{ color: "#8a6a14", fontWeight: 800, marginBottom: 8 }}>{resolvedLabel}</div>
          <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: compact ? 18 : 22 }}>{resolvedTitle}</h2>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{resolvedDetail}</div>
        </div>
        <AuricruxBrandMark compact />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: compact ? "repeat(auto-fit, minmax(180px, 1fr))" : "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8a6a14", fontWeight: 800, marginBottom: 6 }}>Next action</div>
          <div style={{ color: "#111827", fontWeight: 700 }}>{workspaceContext.currentNextAction}</div>
          <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>{workspaceContext.nextActionOwner}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8a6a14", fontWeight: 800, marginBottom: 6 }}>Blocker</div>
          <div style={{ color: "#111827", fontWeight: 700 }}>{auricruxRail.currentBlocker}</div>
          <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>{auricruxRail.blockerImpact}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8a6a14", fontWeight: 800, marginBottom: 6 }}>Project continuity</div>
          <div style={{ color: "#111827", fontWeight: 700 }}>{currentProject.id}</div>
          <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>{currentProject.auricruxSummary}</div>
        </div>
      </div>

      {primary || secondary ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "stretch" }}>
          {primary ? <a href={primary.href} style={linkStyle}>{primary.label}</a> : null}
          {secondary ? <a href={secondary.href} style={linkStyle}>{secondary.label}</a> : null}
        </div>
      ) : null}

      {showDoTeach ? (
        <AuricruxDoTeachBar
          targetObjectType={surface.targetObjectType}
          targetObjectId={surface.targetObjectId || currentProject.id}
          capabilityId={surface.capabilityId}
          executeLabel={surface.executeLabel}
          teachLabel={surface.teachLabel}
          workflowLabel="Run Bid→File→Briefing→Execute→Teach"
        />
      ) : null}
    </div>
  );
}
