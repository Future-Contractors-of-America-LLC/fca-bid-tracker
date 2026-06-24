import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "RouteReadinessOverlay.jsx"),
    markers: [
      'setProductAccess(product, true)',
      'setCommsAccess(channel, true)',
      'applyPlanPreset("enterprise")',
      'Enable missing access',
      'Switch to Enterprise plan',
      'Enable workspace tools and Auricrux guidance so the dashboard can show your full operating picture.',
    ],
  },
  {
    file: path.join(root, "src", "components", "PortalShell.jsx"),
    markers: [
      'import RouteReadinessOverlay from "./RouteReadinessOverlay";',
      'import useCustomerSession from "../hooks/useCustomerSession";',
      'import useWorkspaceState from "../hooks/useWorkspaceState";',
      '<RouteReadinessOverlay',
      'setProductAccess={setProductAccess}',
      'setCommsAccess={setCommsAccess}',
      'applyPlanPreset={applyPlanPreset}',
      'refreshSyncStamp={refreshSyncStamp}',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required route readiness marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Route readiness overlay validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Route readiness overlay validation passed.");
