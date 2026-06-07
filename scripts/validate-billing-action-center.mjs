import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "BillingActionCenter.jsx"),
    markers: [
      'applyPlanPreset("growth")',
      'applyPlanPreset("enterprise")',
      'setCommsAccess("sms", true)',
      'setCommsAccess("phone", true)',
      'setCommsAccess("email", true)',
      'setProductAccess("lms", true)',
      'Execute revenue continuity moves from billing instead of stopping at invoice summaries',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalBilling.jsx"),
    markers: [
      'import BillingActionCenter from "../../components/BillingActionCenter";',
      '<BillingActionCenter',
      'applyPlanPreset={applyPlanPreset}',
      'setProductAccess={setProductAccess}',
      'setCommsAccess={setCommsAccess}',
      'one-click billing actions',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required billing action-center marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Billing action-center validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Billing action-center validation passed.");
