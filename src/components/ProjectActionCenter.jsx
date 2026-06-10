import { useState } from "react";

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

export default function ProjectActionCenter({ project, advanceProjectStage, clearPermitBlocker, runProtectedAction = null }) {
  const [actionState, setActionState] = useState(null);

  async function execute(action, fallback) {
    const protectedResult = runProtectedAction ? await runProtectedAction(action) : null;
    fallback();
    setActionState(protectedResult || { ok: true, mode: "local-shell-only", accepted: false });
  }

  return (
    <div style={{ ...cardStyle, marginTop: 14, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live project actions</div>
      <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
        Move this project through real execution-stage transitions instead of leaving delivery coordination as static shell narrative.
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => execute(
            {
              action: "clear-permit-blocker",
              detail: `Auricrux cleared the permit dependency on ${project.id} and routed the team toward mobilization planning.`,
            },
            () => clearPermitBlocker(project.id, `Auricrux cleared the permit dependency on ${project.id} and routed the team toward mobilization planning.`)
          )}
          style={buttonStyle("primary")}
        >
          Clear Permit Blocker
        </button>
        <button
          type="button"
          onClick={() => execute(
            {
              action: "move-to-execution",
              detail: `Auricrux advanced ${project.id} into execution and preserved project-to-billing continuity.`,
            },
            () => advanceProjectStage(project.id, "Execution", `Auricrux advanced ${project.id} into execution and preserved project-to-billing continuity.`)
          )}
          style={buttonStyle()}
        >
          Move to Execution
        </button>
        <button
          type="button"
          onClick={() => execute(
            {
              action: "move-to-closeout",
              detail: `Auricrux advanced ${project.id} into closeout and preserved warranty and revenue follow-through continuity.`,
            },
            () => advanceProjectStage(project.id, "Closeout", `Auricrux advanced ${project.id} into closeout and preserved warranty and revenue follow-through continuity.`)
          )}
          style={buttonStyle()}
        >
          Move to Closeout
        </button>
      </div>
      {actionState ? (
        <div style={{ color: actionState.ok ? "#0f766e" : "#b91c1c", fontSize: 13, marginTop: 10, fontWeight: 700 }}>
          Action mode: {actionState.mode}{actionState.error ? ` · ${actionState.error}` : ""}
        </div>
      ) : null}
      {project.lastActionAt ? (
        <div style={{ color: "#64748b", fontSize: 13, marginTop: 10 }}>
          Last action at {project.lastActionAt}
        </div>
      ) : null}
    </div>
  );
}
