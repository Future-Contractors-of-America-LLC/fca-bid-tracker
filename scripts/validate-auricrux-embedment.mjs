import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const requiredFiles = [
  path.join(root, "src", "components", "AuricruxPresenceLayer.jsx"),
  path.join(root, "src", "components", "ShellHeader.jsx"),
  path.join(root, "src", "components", "PublicActionRail.jsx"),
  path.join(root, "src", "components", "ShellFooter.jsx"),
  path.join(root, "src", "components", "PortalShell.jsx"),
];

const sourceChecks = [
  {
    file: path.join(root, "src", "components", "ShellHeader.jsx"),
    markers: [
      'import AuricruxPresenceLayer from "./AuricruxPresenceLayer";',
      "Auricrux embedded in header",
      "<AuricruxPresenceLayer",
    ],
  },
  {
    file: path.join(root, "src", "components", "PublicActionRail.jsx"),
    markers: [
      'import AuricruxPresenceLayer from "./AuricruxPresenceLayer";',
      "Auricrux embedded in public action rail",
      "<AuricruxPresenceLayer",
    ],
  },
  {
    file: path.join(root, "src", "components", "ShellFooter.jsx"),
    markers: [
      'import AuricruxPresenceLayer from "./AuricruxPresenceLayer";',
      "Auricrux embedded in footer",
      "<AuricruxPresenceLayer",
    ],
  },
  {
    file: path.join(root, "src", "components", "PortalShell.jsx"),
    markers: [
      'import AuricruxPresenceLayer from "./AuricruxPresenceLayer";',
      "Auricrux embedded in portal shell",
      "<AuricruxPresenceLayer",
    ],
  },
  {
    file: path.join(root, "src", "components", "AuricruxPresenceLayer.jsx"),
    markers: [
      'import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";',
      "workspaceContext.currentNextAction",
      "auricruxRail.currentBlocker",
      "currentProject.auricruxSummary",
    ],
  },
];

const failures = [];

for (const file of requiredFiles) {
  try {
    await fs.access(file);
  } catch {
    failures.push(`Required Auricrux embedment file is missing: ${path.relative(root, file)}`);
  }
}

for (const check of sourceChecks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required Auricrux embedment marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Auricrux embedment validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Auricrux embedment validation passed across header, public action rail, footer, and portal shell layers.");
