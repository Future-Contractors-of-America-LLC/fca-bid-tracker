import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "AuricruxActionHint.jsx"),
    markers: [
      'import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";',
      "auricruxRail.currentBlocker",
      "workspaceContext.currentNextAction",
      "currentProject.id",
    ],
  },
  {
    file: path.join(root, "src", "components", "PublicCtaRow.jsx"),
    markers: [
      'import AuricruxActionHint from "./AuricruxActionHint";',
      "<AuricruxActionHint action={action} />",
    ],
  },
  {
    file: path.join(root, "src", "components", "WorkspaceQuickActions.jsx"),
    markers: [
      'import AuricruxActionHint from "./AuricruxActionHint";',
      "<AuricruxActionHint action={action} />",
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required Auricrux action primitive marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Auricrux action primitive validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Auricrux action primitive validation passed across shared CTA rows and workspace quick actions.");
