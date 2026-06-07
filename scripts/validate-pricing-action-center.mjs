import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "PricingActionCenter.jsx"),
    markers: [
      'navigateTo(nextHref)',
      'login({',
      'selectedPlan: planPreset.key',
      'enabledProducts: planPreset.enabledProducts',
      'enabledComms: planPreset.enabledComms',
      'Activate a real authenticated workspace from pricing instead of stopping at plan review',
      'Activate Startup Workspace',
      'Activate Enterprise Rollout',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Pricing.jsx"),
    markers: [
      'import PricingActionCenter from "../../components/PricingActionCenter";',
      'import useCustomerSession from "../../hooks/useCustomerSession";',
      '<PricingActionCenter session={session} login={login} />',
      'real session activation visible before a live conversation',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required pricing action-center marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Pricing action-center validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Pricing action-center validation passed.");
