import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "AuricruxFileAuditInsight.jsx"),
    markers: [
      'import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";',
      "workspaceContext.currentNextAction",
      "auricruxRail.currentBlocker",
      "auricruxRail.nextRecommendedAction",
      "Auricrux embedded in file and audit layer",
    ],
  },
  {
    file: path.join(root, "src", "components", "ProjectFileAuditPanel.jsx"),
    markers: [
      'import AuricruxFileAuditInsight from "./AuricruxFileAuditInsight";',
      "<AuricruxFileAuditInsight project={project} files={files} auditEvents={auditEvents} />",
      "Audit + Auricrux Timeline",
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required Auricrux file-audit marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Auricrux file and audit layer validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Auricrux file and audit layer validation passed across shared file register and audit timeline components.");
