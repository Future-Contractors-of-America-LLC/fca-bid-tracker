import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "AuricruxJourneyGuidance.jsx"),
    markers: [
      'import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";',
      "auricruxRail.nextRecommendedAction",
      "currentProject.id",
      "workspaceContext.currentNextAction",
      "Auricrux embedded in journey layer",
    ],
  },
  {
    file: path.join(root, "src", "components", "JourneyStrip.jsx"),
    markers: [
      'import AuricruxJourneyGuidance from "./AuricruxJourneyGuidance";',
      "const activeItem = items.find((item) => item.key === current) || items[0];",
      "<AuricruxJourneyGuidance current={current} activeItem={activeItem} />",
    ],
  },
  {
    file: path.join(root, "src", "components", "ShellHeader.jsx"),
    markers: [
      "<JourneyStrip items={journey} current={currentJourney} />",
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required Auricrux journey marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Auricrux journey layer validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Auricrux journey layer validation passed for shared journey surfaces.");
