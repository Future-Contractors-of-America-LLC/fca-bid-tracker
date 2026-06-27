import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";
import { isFounderSession, readCustomerSession } from "../customerSession";

const wrapStyle = {
  marginTop: 14,
  border: "1px solid #e5d3a1",
  borderRadius: 14,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  padding: "14px 16px",
};

export default function AuricruxNarrativeInsight({ mode = "snapshot", ctaHref, ctaLabel }) {
  const session = readCustomerSession();
  const founderView = mode === "founder" && isFounderSession(session);
  const customerLabel = session?.company || "your workspace";

  const detail = founderView
    ? `Auricrux is keeping operator continuity attached to ${customerLabel}, ${workspaceContext.currentNextAction.toLowerCase()}, and ${auricruxRail.currentBlocker.toLowerCase()}.`
    : `Auricrux connects ${customerLabel} to ${currentProject.name}, ${workspaceContext.currentNextAction.toLowerCase()}, and ${auricruxRail.nextRecommendedAction.toLowerCase()} in one workflow.`;

  return (
    <div style={wrapStyle}>
      <div style={{ color: "#8a6a14", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 800, marginBottom: 6 }}>
        Auricrux guidance
      </div>
      <div style={{ color: "#111827", fontWeight: 700, marginBottom: 6 }}>
        {founderView ? "Operator continuity" : "Workspace continuity"}
      </div>
      <div style={{ color: "#475569", lineHeight: 1.65, marginBottom: 8 }}>{detail}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, color: "#8a6a14", fontSize: 12, lineHeight: 1.5 }}>
        <div><strong>Customer:</strong> {customerLabel}</div>
        <div><strong>Recommended move:</strong> {auricruxRail.nextRecommendedAction}</div>
        <div><strong>Next route:</strong> {ctaLabel || "Open live workspace"}</div>
        <div><strong>Route path:</strong> {ctaHref || "/portal"}</div>
      </div>
    </div>
  );
}
