import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "AuricruxContextInsight.jsx"),
    markers: [
      'import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";',
      "resolvedWorkspace.currentNextAction",
      "resolvedRail.currentBlocker",
      "resolvedProject.id",
      "Auricrux embedded in context rails",
    ],
  },
  {
    file: path.join(root, "src", "components", "WorkspaceContextBar.jsx"),
    markers: [
      'import AuricruxContextInsight from "./AuricruxContextInsight";',
      "<AuricruxContextInsight",
      'mode="workspace"',
      "workspace={workspace}",
    ],
  },
  {
    file: path.join(root, "src", "components", "AuricruxStatusRail.jsx"),
    markers: [
      'import AuricruxContextInsight from "./AuricruxContextInsight";',
      "<AuricruxContextInsight",
      'mode="status"',
      "rail={rail}",
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required Auricrux context-rail marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Auricrux context rail validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Auricrux context rail validation passed across workspace and status rail components.");
