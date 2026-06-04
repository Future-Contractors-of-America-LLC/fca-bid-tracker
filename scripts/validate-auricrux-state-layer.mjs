import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "AuricruxStateExplanation.jsx"),
    markers: [
      'import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";',
      "auricruxRail.nextRecommendedAction",
      "workspaceContext.nextActionOwner",
      "currentProject.id",
      "Auricrux embedded in state layer",
    ],
  },
  {
    file: path.join(root, "src", "components", "RouteStateOverlay.jsx"),
    markers: [
      'import AuricruxStateExplanation from "./AuricruxStateExplanation";',
      "<AuricruxStateExplanation",
      'mode="overlay"',
      "overlay={overlay}",
    ],
  },
  {
    file: path.join(root, "src", "components", "SystemStateSummary.jsx"),
    markers: [
      'import AuricruxStateExplanation from "./AuricruxStateExplanation";',
      "<AuricruxStateExplanation",
      'mode="summary"',
      "workspace.currentNextAction",
      "auricrux.currentBlocker",
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required Auricrux state-layer marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Auricrux state layer validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Auricrux state layer validation passed across route overlays and shared system summaries.");
