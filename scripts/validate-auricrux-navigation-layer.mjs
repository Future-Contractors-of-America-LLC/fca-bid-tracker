import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "AuricruxNavHint.jsx"),
    markers: [
      'import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";',
      "auricruxRail.currentBlocker",
      "workspaceContext.currentNextAction",
      "currentProject.id",
    ],
  },
  {
    file: path.join(root, "src", "components", "PublicTopNav.jsx"),
    markers: [
      'import { auricruxRail, currentProject, portalMessages, projectAuditEvents, workspaceContext } from "../workspaceState";',
      "workspaceContext.currentNextAction",
      "currentProject.id",
      "auricruxRail.nextRecommendedAction",
      "resolveRouteCue",
      "const publicNavGroups = [",
      "const portalNavGroups = [",
    ],
  },
  {
    file: path.join(root, "src", "components", "ShellHeader.jsx"),
    markers: [
      'import PublicTopNav from "./PublicTopNav";',
      '{showTopNav ? <PublicTopNav mode={topNavMode} /> : null}',
      '<AuricruxPresenceLayer',
    ],
  },
  {
    file: path.join(root, "src", "components", "PortalShell.jsx"),
    markers: [
      'import AuricruxNavHint from "./AuricruxNavHint";',
      "<AuricruxNavHint item={module} />",
      "portalModules.map((module) =>",
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required Auricrux navigation marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Auricrux navigation layer validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Auricrux navigation layer validation passed across top-nav, shared header, and portal navigation surfaces.");
