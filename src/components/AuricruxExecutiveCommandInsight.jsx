import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";

const wrapStyle = {
  marginTop: 14,
  border: "1px solid #e5d3a1",
  borderRadius: 14,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  padding: "14px 16px",
};

export default function AuricruxExecutiveCommandInsight({ mode = "signal", nextHref, nextLabel }) {
  const resolvedModeTitle = mode === "deck"
    ? "Auricrux explanation of expansion command state"
    : "Auricrux explanation of executive signal state";

  const resolvedDetail = mode === "deck"
    ? `Auricrux is using ${workspaceContext.currentNextAction.toLowerCase()} and ${auricruxRail.currentBlocker.toLowerCase()} to keep automation, SaaS, website, academy, and comms expansion tied to one operating story for ${currentProject.id}.`
    : `Auricrux is using ${auricruxRail.currentBlocker.toLowerCase()} and ${workspaceContext.currentNextAction.toLowerCase()} to keep approval, revenue, comms, and workforce continuity under one executive signal.`;

  return (
    <div style={wrapStyle}>
      <div style={{ color: "#8a6a14", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 800, marginBottom: 6 }}>
        Auricrux embedded in executive command layer
      </div>
      <div style={{ color: "#111827", fontWeight: 700, marginBottom: 6 }}>{resolvedModeTitle}</div>
      <div style={{ color: "#475569", lineHeight: 1.65, marginBottom: 8 }}>{resolvedDetail}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, color: "#8a6a14", fontSize: 12, lineHeight: 1.5 }}>
        <div><strong>Project:</strong> {currentProject.id}</div>
        <div><strong>Recommended move:</strong> {auricruxRail.nextRecommendedAction}</div>
        <div><strong>Next command:</strong> {nextLabel || "Open next operating surface"}</div>
        <div><strong>Command route:</strong> {nextHref || "/portal/platform"}</div>
      </div>
    </div>
  );
}
