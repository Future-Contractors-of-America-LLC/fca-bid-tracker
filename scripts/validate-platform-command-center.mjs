import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "ExecutionCommandCenter.jsx"),
    markers: [
      'applyPlanPreset("operations")',
      'applyPlanPreset("enterprise")',
      'setProductAccess("lms", true)',
      'setCommsAccess("sms", true)',
      'setCommsAccess("phone", true)',
      'setCommsAccess("teams", true)',
      'setCommsAccess("conference", true)',
      'Take real workspace actions instead of reading status-only summaries',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PlatformDashboard.jsx"),
    markers: [
      'import ExecutionCommandCenter from "../../components/ExecutionCommandCenter";',
      '<ExecutionCommandCenter',
      'applyPlanPreset={applyPlanPreset}',
      'setProductAccess={setProductAccess}',
      'setCommsAccess={setCommsAccess}',
      'one-click workspace actions',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required platform command-center marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Platform command-center validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Platform command-center validation passed.");
