import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "SupportActionCenter.jsx"),
    markers: [
      'applyPlanPreset("operations")',
      'applyPlanPreset("enterprise")',
      'setCommsAccess("phone", true)',
      'setCommsAccess("sms", true)',
      'setCommsAccess("email", true)',
      'setCommsAccess("teams", true)',
      'setCommsAccess("conference", true)',
      'setCommsAccess("lecture", true)',
      'setProductAccess("lms", true)',
      'Execute escalation recovery from support instead of reading blocker summaries only',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalSupport.jsx"),
    markers: [
      'createSupportTicket(',
      'resolveSupportTicket(',
      'Auricrux Support Intelligence',
      'Create support ticket',
      'Open tickets',
      'useWorkspaceState',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required support action-center marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Support action-center validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Support action-center validation passed.");
