import AuricruxBrandMark from "./AuricruxBrandMark";
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
  surfaceLabel = "Embedded Auricrux",
  title = "Auricrux remains active inside this layer",
  detail = "Auricrux is carrying next-action, blocker, and continuity state through this shell surface so the user never falls into a dead page.",
  primaryHref = "/portal/platform",
  primaryLabel = "Open Platform Dashboard",
  secondaryHref = "/portal/messages",
  secondaryLabel = "Open Messages",
  compact = false,
}) {
  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: compact ? "flex-start" : "center", flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ minWidth: 0, flex: "1 1 420px" }}>
          <div style={{ color: "#8a6a14", fontWeight: 800, marginBottom: 8 }}>{surfaceLabel}</div>
          <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: compact ? 18 : 22 }}>{title}</h2>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{detail}</div>
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

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "stretch" }}>
        <a href={primaryHref} style={linkStyle}>{primaryLabel}</a>
        <a href={secondaryHref} style={linkStyle}>{secondaryLabel}</a>
      </div>
    </div>
  );
}
