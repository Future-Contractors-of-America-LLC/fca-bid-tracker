import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";

const wrapStyle = {
  marginTop: 14,
  border: "1px solid #e5d3a1",
  borderRadius: 14,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  padding: "14px 16px",
};

export default function AuricruxStateExplanation({
  mode = "summary",
  overlay,
  title,
  detail,
}) {
  const resolvedTitle = title || (mode === "overlay"
    ? "Auricrux explanation of route state"
    : "Auricrux explanation of shared system state");

  const resolvedDetail = detail || (mode === "overlay"
    ? `${overlay?.auricruxDetail || "Auricrux is interpreting the route surface from shared operating context."} Next move: ${auricruxRail.nextRecommendedAction}.`
    : `Auricrux is using ${workspaceContext.currentNextAction.toLowerCase()} and ${auricruxRail.currentBlocker.toLowerCase()} to explain why ${currentProject.id} remains in its current operating posture.`);

  return (
    <div style={wrapStyle}>
      <div style={{ color: "#8a6a14", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 800, marginBottom: 6 }}>
        Auricrux embedded in state layer
      </div>
      <div style={{ color: "#111827", fontWeight: 700, marginBottom: 6 }}>{resolvedTitle}</div>
      <div style={{ color: "#475569", lineHeight: 1.65, marginBottom: 8 }}>{resolvedDetail}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, color: "#8a6a14", fontSize: 12, lineHeight: 1.5 }}>
        <div><strong>Recommended move:</strong> {auricruxRail.nextRecommendedAction}</div>
        <div><strong>Project spine:</strong> {currentProject.id}</div>
        <div><strong>Next action owner:</strong> {workspaceContext.nextActionOwner}</div>
      </div>
    </div>
  );
}
