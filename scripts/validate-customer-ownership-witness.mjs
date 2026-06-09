import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "CustomerOwnershipWitnessPanel.jsx"),
    markers: [
      'Customer ownership witness',
      'This workspace proves what the authenticated customer actually owns',
      '<strong>Primary project:</strong> {stateMeta?.primaryProjectId || "A-117"}',
      '<strong>Visible estimate packets:</strong> {estimates.length}',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PlatformDashboard.jsx"),
    markers: [
      'import CustomerOwnershipWitnessPanel from "../../components/CustomerOwnershipWitnessPanel";',
      'const { estimates } = useEstimateWorkspace();',
      '<CustomerOwnershipWitnessPanel session={session} stateMeta={state.meta} projects={projects} files={files} estimates={estimates} />',
    ],
  },
  {
    file: path.join(root, "package.json"),
    markers: [
      '"validate:customer-ownership-witness": "node scripts/validate-customer-ownership-witness.mjs"',
      'npm run validate:estimate-workspace && npm run validate:project-file-ownership-continuity && npm run validate:customer-ownership-witness && npm run validate:seeded-customer-auth',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required customer ownership witness marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Customer ownership witness validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Customer ownership witness validation passed.");
