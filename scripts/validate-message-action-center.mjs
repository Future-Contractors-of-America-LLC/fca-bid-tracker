import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "MessageActionCenter.jsx"),
    markers: [
      'applyPlanPreset("operations")',
      'applyPlanPreset("growth")',
      'setCommsAccess("email", true)',
      'setCommsAccess("sms", true)',
      'setCommsAccess("phone", true)',
      'setCommsAccess("teams", true)',
      'setCommsAccess("conference", true)',
      'setCommsAccess("lecture", true)',
      'setProductAccess("lms", true)',
      'Execute channel recovery and customer follow-through from messages instead of reading coordination summaries only',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalMessages.jsx"),
    markers: [
      'import MessageActionCenter from "../../components/MessageActionCenter";',
      '<MessageActionCenter',
      'applyPlanPreset={applyPlanPreset}',
      'setProductAccess={setProductAccess}',
      'setCommsAccess={setCommsAccess}',
      'one-click communications recovery controls',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required message action-center marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Message action-center validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Message action-center validation passed.");
