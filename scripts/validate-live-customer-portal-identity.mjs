import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "liveWorkspaceIdentity.js"),
    markers: [
      'import { readCustomerSession } from "./customerSession";',
      "resolveLiveTenantIdentity",
      "resolveLiveProjectIdentity",
      "workspaceLabel",
    ],
  },
  {
    file: path.join(root, "src", "components", "ProjectSpineBar.jsx"),
    markers: [
      'import { resolveLiveProjectIdentity, resolveLiveTenantIdentity } from "../liveWorkspaceIdentity";',
      "const liveTenant = resolveLiveTenantIdentity(tenant);",
      "const liveProject = resolveLiveProjectIdentity(project);",
      "<AuricruxSpineInsight tenant={liveTenant} project={liveProject} />",
    ],
  },
  {
    file: path.join(root, "src", "components", "WorkspaceContextBar.jsx"),
    markers: [
      'import { resolveLiveProjectIdentity, resolveLiveTenantIdentity } from "../liveWorkspaceIdentity";',
      "const liveTenant = resolveLiveTenantIdentity(tenant);",
      "const liveProject = resolveLiveProjectIdentity(project);",
      "liveTenant.authenticatedEmail",
      "project={liveProject}",
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required live portal identity marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Live customer portal identity validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Live customer portal identity validation passed across tenant and project shell presentation surfaces.");
