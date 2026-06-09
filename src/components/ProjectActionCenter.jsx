const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 14,
  background: "#fff",
};

const buttonStyle = (tone = "primary") => ({
  border: tone === "primary" ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  background: tone === "primary" ? "#1d4ed8" : "#fff",
  color: tone === "primary" ? "#fff" : "#0f172a",
  font: "inherit",
});

export default function ProjectActionCenter({
  project,
  advanceProjectStage,
  clearPermitBlocker,
  attachEvidence,
  generateBriefing,
}) {
  return (
    <div style={{ ...cardStyle, marginTop: 14, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live project actions</div>
      <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
        Move this project through real execution-stage transitions instead of leaving delivery coordination as static shell narrative.
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => clearPermitBlocker(project.id, `Auricrux cleared the permit dependency on ${project.id} and routed the team toward mobilization planning.`)}
          style={buttonStyle("primary")}
        >
          Clear Permit Blocker
        </button>
        <button
          type="button"
          onClick={() => advanceProjectStage(project.id, "Execution", `Auricrux advanced ${project.id} into execution and preserved project-to-billing continuity.`)}
          style={buttonStyle()}
        >
          Move to Execution
        </button>
        <button
          type="button"
          onClick={() => advanceProjectStage(project.id, "Closeout", `Auricrux advanced ${project.id} into closeout and preserved warranty and revenue follow-through continuity.`)}
          style={buttonStyle()}
        >
          Move to Closeout
        </button>
        {attachEvidence ? (
          <button type="button" onClick={() => attachEvidence(project)} style={buttonStyle()}>
            Attach Evidence
          </button>
        ) : null}
        {generateBriefing ? (
          <button type="button" onClick={() => generateBriefing(project)} style={buttonStyle()}>
            Refresh Briefing
          </button>
        ) : null}
      </div>
      <div style={{ color: "#475569", lineHeight: 1.7, marginTop: 12 }}>
        <div><strong>Canonical project:</strong> {project.canonicalProjectId}</div>
        <div><strong>Linked bid:</strong> {project.linkedBidId}</div>
        <div><strong>Evidence status:</strong> {project.evidenceStatus}</div>
        <div><strong>File briefing:</strong> {project.fileBriefingStatus}</div>
      </div>
      {project.lastActionAt ? (
        <div style={{ color: "#64748b", fontSize: 13, marginTop: 10 }}>
          Last action at {project.lastActionAt}
        </div>
      ) : null}
    </div>
  );
}
