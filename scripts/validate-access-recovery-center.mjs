import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "AccessRecoveryActionCenter.jsx"),
    markers: [
      'setProductAccess(product, true)',
      'setCommsAccess(channel, true)',
      'applyPlanPreset("enterprise")',
      'navigateTo(requestedPath)',
      'navigateTo(resolveWorkspaceEntryHref(session, requestedPath))',
      'Repair blocked route access instead of stopping at a restricted-state explanation',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "AccessRestricted.jsx"),
    markers: [
      'import AccessRecoveryActionCenter from "../../components/AccessRecoveryActionCenter";',
      'import useWorkspaceState from "../../hooks/useWorkspaceState";',
      '<AccessRecoveryActionCenter',
      'setProductAccess={setProductAccess}',
      'setCommsAccess={setCommsAccess}',
      'applyPlanPreset={applyPlanPreset}',
      'live recovery controls instead of a dead-end restricted state',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required access recovery marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Access recovery validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Access recovery validation passed.");
