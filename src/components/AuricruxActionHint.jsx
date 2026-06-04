import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";

const hintStyle = {
  marginTop: 6,
  fontSize: 12,
  lineHeight: 1.5,
  color: "#8a6a14",
  fontWeight: 600,
};

function resolveHint(action = {}) {
  const href = action.href || "";
  const label = (action.label || "").toLowerCase();

  if (href.includes("/portal/bids") || label.includes("bid")) {
    return `Auricrux: clear ${auricruxRail.currentBlocker.toLowerCase()} so ${currentProject.id} can move forward.`;
  }

  if (href.includes("/portal/projects") || label.includes("project")) {
    return `Auricrux: use the project spine to turn ${workspaceContext.currentNextAction.toLowerCase()} into execution continuity.`;
  }

  if (href.includes("/portal/files") || label.includes("file")) {
    return `Auricrux: keep documents attached to ${currentProject.id} so handoff and audit continuity stay intact.`;
  }

  if (href.includes("/portal/messages") || label.includes("message") || label.includes("comms")) {
    return `Auricrux: preserve follow-through by routing the next customer update through the shared message state.`;
  }

  if (href.includes("/portal/billing") || label.includes("billing") || label.includes("pricing")) {
    return `Auricrux: revenue continuity stays blocked until ${auricruxRail.currentBlocker.toLowerCase()} is resolved.`;
  }

  if (href.includes("/academy") || label.includes("academy") || label.includes("training")) {
    return `Auricrux: align learner assignment with ${currentProject.id} so workforce readiness stays live.`;
  }

  if (href.includes("/portal/platform") || href.includes("/platform") || label.includes("platform")) {
    return `Auricrux: open the unified dashboard to review blocker, readiness, and next-action state together.`;
  }

  if (href.includes("/contact") || label.includes("contact") || label.includes("walkthrough") || label.includes("rollout")) {
    return `Auricrux: keep rollout motion attached to the live shell instead of breaking context.`;
  }

  if (href.includes("/login") || label.includes("workspace") || label.includes("portal")) {
    return `Auricrux: enter the live workspace where ${workspaceContext.currentNextAction.toLowerCase()} is already staged.`;
  }

  return `Auricrux: ${auricruxRail.nextRecommendedAction}.`;
}

export default function AuricruxActionHint({ action }) {
  return <div style={hintStyle}>{resolveHint(action)}</div>;
}
