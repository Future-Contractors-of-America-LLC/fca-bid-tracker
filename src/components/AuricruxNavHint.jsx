import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";

const hintStyle = {
  marginTop: 6,
  fontSize: 11,
  lineHeight: 1.45,
  color: "#8a6a14",
  fontWeight: 600,
};

function resolveNavHint(item = {}) {
  const href = item.href || "";
  const label = (item.label || "").toLowerCase();

  if (href === "/" || label.includes("home")) {
    return `Auricrux: begin in the live shell and steer toward ${workspaceContext.currentNextAction.toLowerCase()}.`;
  }

  if (href.includes("/platform") || label.includes("platform")) {
    return "Auricrux: use platform state to review readiness, blocker, and next-action posture together.";
  }

  if (href.includes("/auricrux") || label.includes("auricrux")) {
    return `Auricrux: this layer explains why ${currentProject.id} remains governed by shared operating state.`;
  }

  if (href.includes("/pricing") || label.includes("pricing")) {
    return `Auricrux: rollout conversation stays tied to ${auricruxRail.currentBlocker.toLowerCase()} and readiness state.`;
  }

  if (href.includes("/contact") || label.includes("contact")) {
    return "Auricrux: preserve conversion continuity by keeping the next move attached to the live shell.";
  }

  if (href.includes("/login") || label.includes("login") || label.includes("workspace")) {
    return `Auricrux: enter the workspace where ${workspaceContext.currentNextAction.toLowerCase()} is already staged.`;
  }

  if (href === "/portal" || label.includes("overview")) {
    return `Auricrux: overview keeps ${currentProject.id} legible before deeper route specialization.`;
  }

  if (href.includes("/portal/projects") || label.includes("project")) {
    return `Auricrux: use projects to convert ${workspaceContext.currentNextAction.toLowerCase()} into tracked execution.`;
  }

  if (href.includes("/portal/bids") || label.includes("bid")) {
    return `Auricrux: clear ${auricruxRail.currentBlocker.toLowerCase()} before downstream continuity can advance.`;
  }

  if (href.includes("/portal/files") || label.includes("file")) {
    return `Auricrux: keep documents anchored to ${currentProject.id} so audit continuity holds.`;
  }

  if (href.includes("/portal/messages") || label.includes("message")) {
    return "Auricrux: preserve communication follow-through inside the shared message state.";
  }

  if (href.includes("/portal/billing") || label.includes("billing") || label.includes("admin")) {
    return `Auricrux: finance and governance remain linked to ${auricruxRail.currentBlocker.toLowerCase()} and approval history.`;
  }

  if (href.includes("/academy") || label.includes("academy") || label.includes("support")) {
    return `Auricrux: workforce and recovery continuity stay attached to ${currentProject.id}.`;
  }

  return `Auricrux: ${auricruxRail.nextRecommendedAction}.`;
}

export default function AuricruxNavHint({ item }) {
  return <div style={hintStyle}>{resolveNavHint(item)}</div>;
}
