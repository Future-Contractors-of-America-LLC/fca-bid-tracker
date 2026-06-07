import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "AdminActionCenter.jsx"),
    markers: [
      'applyPlanPreset("growth")',
      'applyPlanPreset("enterprise")',
      'setProductAccess("saas", true)',
      'setProductAccess("lms", true)',
      'setProductAccess("auricrux", true)',
      'setCommsAccess("teams", true)',
      'setCommsAccess("conference", true)',
      'setCommsAccess("email", true)',
      'setCommsAccess("sms", true)',
      'setCommsAccess("phone", true)',
      'Execute rollout and governance controls from admin instead of reading readiness summaries only',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalAdmin.jsx"),
    markers: [
      'import AdminActionCenter from "../../components/AdminActionCenter";',
      '<AdminActionCenter',
      'applyPlanPreset={applyPlanPreset}',
      'setProductAccess={setProductAccess}',
      'setCommsAccess={setCommsAccess}',
      'one-click admin actions',
      'useWorkspaceState',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required admin action-center marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Admin action-center validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Admin action-center validation passed.");
