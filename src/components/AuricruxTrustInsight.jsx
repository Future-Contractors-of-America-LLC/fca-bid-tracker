import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";

const wrapStyle = {
  marginTop: 14,
  border: "1px solid #e5d3a1",
  borderRadius: 14,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  padding: "14px 16px",
};

export default function AuricruxTrustInsight({ mode = "trust", primaryHref, primaryLabel }) {
  const title = mode === "readiness"
    ? "Auricrux explanation of readiness posture"
    : mode === "operations"
      ? "Auricrux explanation of public operating continuity"
      : "Auricrux explanation of customer trust posture";

  const detail = mode === "readiness"
    ? `Auricrux is using ${workspaceContext.currentNextAction.toLowerCase()} and ${auricruxRail.currentBlocker.toLowerCase()} to keep rollout readiness tied to ${currentProject.id} instead of a disconnected marketing story.`
    : mode === "operations"
      ? `Auricrux is preserving one public-facing operating story so platform, pricing, contact, and rollout surfaces remain attached to ${currentProject.id} and the same next-action spine.`
      : `Auricrux is turning customer confidence into operational clarity by keeping trust, readiness, files, billing, and academy continuity attached to ${currentProject.id}.`;

  return (
    <div style={wrapStyle}>
      <div style={{ color: "#8a6a14", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 800, marginBottom: 6 }}>
        Auricrux embedded in trust and readiness layer
      </div>
      <div style={{ color: "#111827", fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ color: "#475569", lineHeight: 1.65, marginBottom: 8 }}>{detail}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, color: "#8a6a14", fontSize: 12, lineHeight: 1.5 }}>
        <div><strong>Project:</strong> {currentProject.id}</div>
        <div><strong>Recommended move:</strong> {auricruxRail.nextRecommendedAction}</div>
        <div><strong>Next route:</strong> {primaryLabel || "Open next operating surface"}</div>
        <div><strong>Route path:</strong> {primaryHref || "/portal/platform"}</div>
      </div>
    </div>
  );
}
