import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "SystemStateSummary.jsx"),
    markers: [
      'import { resolveLiveProjectIdentity, resolveLiveTenantIdentity } from "../liveWorkspaceIdentity";',
      "const liveTenant = resolveLiveTenantIdentity(tenant);",
      "const liveProject = resolveLiveProjectIdentity(project);",
      "liveTenant.authenticatedEmail",
      "for ${liveTenant.name}",
    ],
  },
  {
    file: path.join(root, "src", "components", "RouteStateOverlay.jsx"),
    markers: [
      'import { resolveLiveTenantIdentity } from "../liveWorkspaceIdentity";',
      'import { portalTenant } from "../workspaceState";',
      "const liveTenant = resolveLiveTenantIdentity(portalTenant);",
      "Authenticated tenant context: {liveTenant.name}",
    ],
  },
  {
    file: path.join(root, "src", "components", "AuricruxStatusRail.jsx"),
    markers: [
      'import { resolveLiveProjectIdentity, resolveLiveTenantIdentity } from "../liveWorkspaceIdentity";',
      'import { portalTenant } from "../workspaceState";',
      "const liveTenant = resolveLiveTenantIdentity(portalTenant);",
      "const liveProject = resolveLiveProjectIdentity(project);",
      "Authenticated tenant context: {liveTenant.name}",
      "project={liveProject}",
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required live customer summary-surface marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Live customer summary surface validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Live customer summary surface validation passed across state summary, route overlay, and Auricrux status rail.");
