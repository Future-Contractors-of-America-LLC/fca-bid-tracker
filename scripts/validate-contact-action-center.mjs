import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "ContactActionCenter.jsx"),
    markers: [
      'navigateTo(nextHref)',
      'login({',
      'selectedPlan: planPreset.key',
      'enabledProducts: planPreset.enabledProducts',
      'enabledComms: planPreset.enabledComms',
      'Activate a real authenticated walkthrough from contact instead of stopping at outreach options',
      'Launch Guided Pilot Walkthrough',
      'Launch Enterprise Rollout Review',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Contact.jsx"),
    markers: [
      'import ContactActionCenter from "../../components/ContactActionCenter";',
      'import useCustomerSession from "../../hooks/useCustomerSession";',
      '<ContactActionCenter session={session} login={login} />',
      'real session activation shown across Auricrux, platform, portal, and academy routes',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required contact action-center marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Contact action-center validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Contact action-center validation passed.");
