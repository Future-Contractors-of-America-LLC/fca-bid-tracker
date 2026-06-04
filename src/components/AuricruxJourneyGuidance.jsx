import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";

const panelStyle = {
  marginTop: 12,
  border: "1px solid #e5d3a1",
  borderRadius: 14,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  padding: "12px 14px",
};

function resolveJourneyMessage(current, activeItem) {
  if (current === "public") {
    return `Auricrux: start the customer in the live shell, then move them toward ${workspaceContext.currentNextAction.toLowerCase()}.`;
  }

  if (current === "platform" || current === "lead") {
    return `Auricrux: use this layer to summarize blocker, readiness, and next-action state before routing deeper.`;
  }

  if (current === "workspace") {
    return `Auricrux: workspace entry should preserve ${currentProject.id} continuity instead of resetting context.`;
  }

  if (current === "bid") {
    return `Auricrux: clear ${auricruxRail.currentBlocker.toLowerCase()} so the bid can convert into active project flow.`;
  }

  if (current === "job") {
    return `Auricrux: execution continuity depends on turning ${workspaceContext.currentNextAction.toLowerCase()} into a tracked project move.`;
  }

  if (current === "coordination") {
    return `Auricrux: keep files and messages attached to ${currentProject.id} so communication never breaks the audit spine.`;
  }

  if (current === "finance") {
    return `Auricrux: revenue progression remains linked to ${auricruxRail.currentBlocker.toLowerCase()} and visible approval history.`;
  }

  if (current === "academy") {
    return `Auricrux: workforce readiness stays live only when learner assignment remains attached to ${currentProject.id}.`;
  }

  if (current === "conversion") {
    return "Auricrux: keep rollout and walkthrough motion attached to the live operating shell instead of a disconnected contact path.";
  }

  return `Auricrux: ${activeItem?.label || "This route"} stays connected to ${currentProject.id} through shared next-action and blocker state.`;
}

export default function AuricruxJourneyGuidance({ current, activeItem }) {
  const message = resolveJourneyMessage(current, activeItem);

  return (
    <div style={panelStyle}>
      <div style={{ color: "#8a6a14", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 800, marginBottom: 6 }}>
        Auricrux embedded in journey layer
      </div>
      <div style={{ color: "#111827", fontWeight: 700, marginBottom: 4 }}>
        Active route: {activeItem?.label || "Journey continuity"}
      </div>
      <div style={{ color: "#475569", lineHeight: 1.6, marginBottom: 6 }}>{message}</div>
      <div style={{ color: "#8a6a14", fontSize: 12, lineHeight: 1.5 }}>
        Next move: {auricruxRail.nextRecommendedAction} · Project {currentProject.id}
      </div>
    </div>
  );
}
