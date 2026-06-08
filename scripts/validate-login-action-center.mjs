import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "LoginActionCenter.jsx"),
    markers: [
      'navigateTo(resolveWorkspaceEntryHref(result.session, requestedPath || nextHref))',
      'login({',
      'selectedPlan: planPreset.key',
      'enabledProducts: planPreset.enabledProducts',
      'enabledComms: planPreset.enabledComms',
      'Activate a real authenticated workspace from login without filling every field manually',
      'Launch Startup Customer',
      'Launch Enterprise Customer',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Login.jsx"),
    markers: [
      'import LoginActionCenter from "../../components/LoginActionCenter";',
      '<LoginActionCenter session={session} login={login} requestedPath={nextHref} />',
      'workspace entry routes customers into the unified FCA shell for estimating visibility, project delivery, document control, billing follow-through, academy continuity, communications routing, and guided next steps',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required login action-center marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Login action-center validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Login action-center validation passed.");
