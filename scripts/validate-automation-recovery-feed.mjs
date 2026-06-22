import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "sessionAutomationLog.js"),
    markers: [
      'export const CUSTOMER_AUTOMATION_LOG_KEY = "fca_customer_automation_log_v1";',
      'export function readAutomationLog()',
      'export function appendAutomationLog(entry = {})',
      'export function clearAutomationLog()',
    ],
  },
  {
    file: path.join(root, "src", "hooks", "useCustomerSession.js"),
    markers: [
      'import { appendAutomationLog, clearAutomationLog } from "../sessionAutomationLog";',
      'logAutomationEvent("login-activation"',
      'logAutomationEvent("product-repair"',
      'logAutomationEvent("comms-repair"',
      'logAutomationEvent("plan-promotion"',
      'clearAutomationLog();',
    ],
  },
  {
    file: path.join(root, "src", "components", "AutomationRecoveryFeed.jsx"),
    markers: [
      'import { readAutomationLog } from "../sessionAutomationLog";',
      'Recent Auricrux session mutations and recovery actions remain visible across routes so state repair does not disappear after a single click.',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PlatformDashboard.jsx"),
    markers: [
      'import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";',
      '<AutomationRecoveryFeed title="Activity log"',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required automation recovery marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Automation recovery feed validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Automation recovery feed validation passed.");
