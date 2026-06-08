import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "AuricruxExecutiveCommandInsight.jsx"),
    markers: [
      'import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";',
      "auricruxRail.currentBlocker",
      "auricruxRail.nextRecommendedAction",
      "workspaceContext.currentNextAction",
      "Auricrux embedded in executive command layer",
    ],
  },
  {
    file: path.join(root, "src", "components", "ExecutiveSignalBar.jsx"),
    markers: [
      'import AuricruxExecutiveCommandInsight from "./AuricruxExecutiveCommandInsight";',
      '<AuricruxExecutiveCommandInsight mode="signal" nextHref={resolvedHref} nextLabel={resolvedLabel} />',
    ],
  },
  {
    file: path.join(root, "src", "components", "BuildExpansionCommandDeck.jsx"),
    markers: [
      'import AuricruxExecutiveCommandInsight from "./AuricruxExecutiveCommandInsight";',
      "resolveActionPair(",
      'const { primary, secondary } = resolveActionPair(',
      '{primary ? <AuricruxExecutiveCommandInsight mode="deck" nextHref={primary.href} nextLabel={primary.label} /> : null}',
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required Auricrux executive-command marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Auricrux executive command layer validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Auricrux executive command layer validation passed across executive signal and expansion command deck components.");
