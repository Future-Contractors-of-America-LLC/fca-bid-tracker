import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "AuricruxSpineInsight.jsx"),
    markers: [
      'import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";',
      "workspaceContext.currentNextAction",
      "auricruxRail.currentBlocker",
      "auricruxRail.nextRecommendedAction",
      "Auricrux embedded in project spine",
    ],
  },
  {
    file: path.join(root, "src", "components", "ProjectSpineBar.jsx"),
    markers: [
      'import AuricruxSpineInsight from "./AuricruxSpineInsight";',
      'import { resolveLiveProjectIdentity, resolveLiveTenantIdentity } from "../liveWorkspaceIdentity";',
      "const liveTenant = resolveLiveTenantIdentity(tenant);",
      "const liveProject = resolveLiveProjectIdentity(project);",
      "liveProject.auricruxSummary",
      "<AuricruxSpineInsight tenant={liveTenant} project={liveProject} />",
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required Auricrux project-spine marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Auricrux project spine validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Auricrux project spine validation passed across shared project spine components.");
