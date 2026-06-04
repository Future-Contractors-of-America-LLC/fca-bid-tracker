import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";

const wrapStyle = {
  marginTop: 16,
  border: "1px solid #e5d3a1",
  borderRadius: 14,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  padding: "14px 16px",
};

export default function AuricruxSpineInsight({ tenant, project }) {
  const resolvedProject = project || currentProject;

  return (
    <div style={wrapStyle}>
      <div style={{ color: "#8a6a14", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 800, marginBottom: 6 }}>
        Auricrux embedded in project spine
      </div>
      <div style={{ color: "#111827", fontWeight: 700, marginBottom: 6 }}>
        Auricrux is interpreting the operational record for {resolvedProject.id}
      </div>
      <div style={{ color: "#475569", lineHeight: 1.65, marginBottom: 8 }}>
        Auricrux is using {workspaceContext.currentNextAction.toLowerCase()}, {auricruxRail.currentBlocker.toLowerCase()}, and the shared tenant-project record to keep files, billing, academy continuity, and audit history attached to one execution spine{tenant ? ` for ${tenant.name}` : ""}.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, color: "#8a6a14", fontSize: 12, lineHeight: 1.5 }}>
        <div><strong>Project:</strong> {resolvedProject.id}</div>
        <div><strong>Recommended move:</strong> {auricruxRail.nextRecommendedAction}</div>
        <div><strong>Owner path:</strong> {workspaceContext.nextActionOwner}</div>
      </div>
    </div>
  );
}
