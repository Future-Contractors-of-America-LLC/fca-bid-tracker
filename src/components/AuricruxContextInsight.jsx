import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";

const wrapStyle = {
  marginTop: 14,
  border: "1px solid #e5d3a1",
  borderRadius: 14,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  padding: "14px 16px",
};

export default function AuricruxContextInsight({
  mode = "workspace",
  project,
  workspace,
  rail,
}) {
  const resolvedProject = project || currentProject;
  const resolvedWorkspace = workspace || workspaceContext;
  const resolvedRail = rail || auricruxRail;

  const title = mode === "status"
    ? "Auricrux explanation of operational guidance"
    : "Auricrux explanation of workspace context";

  const detail = mode === "status"
    ? `Auricrux is using ${resolvedRail.currentBlocker.toLowerCase()} and ${resolvedRail.nextRecommendedAction.toLowerCase()} to keep ${resolvedProject.id} moving without breaking continuity.`
    : `Auricrux is using ${resolvedWorkspace.currentNextAction.toLowerCase()} to keep tenant, project, audit, and execution state attached to ${resolvedProject.id}.`;

  return (
    <div style={wrapStyle}>
      <div style={{ color: "#8a6a14", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 800, marginBottom: 6 }}>
        Auricrux embedded in context rails
      </div>
      <div style={{ color: "#111827", fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ color: "#475569", lineHeight: 1.65, marginBottom: 8 }}>{detail}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, color: "#8a6a14", fontSize: 12, lineHeight: 1.5 }}>
        <div><strong>Project:</strong> {resolvedProject.id}</div>
        <div><strong>Next action:</strong> {resolvedWorkspace.currentNextAction}</div>
        <div><strong>Blocker:</strong> {resolvedRail.currentBlocker}</div>
      </div>
    </div>
  );
}
