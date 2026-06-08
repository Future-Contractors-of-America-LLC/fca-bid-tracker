import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "pages", "portal", "PortalNotifications.jsx"),
    markers: [
      'import useWorkspaceState from "../../hooks/useWorkspaceState";',
      'refreshSyncStamp("Persisted notifications state active")',
      'tenant={state.tenant}',
      'project={state.project}',
      'workspace={state.workspace}',
      'auricrux={state.auricrux}',
      '<strong>Authenticated customer:</strong> {state.meta.authenticatedCustomer || "Continuity shell visitor"}',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalProfile.jsx"),
    markers: [
      'import useWorkspaceState from "../../hooks/useWorkspaceState";',
      'refreshSyncStamp("Persisted customer profile state active")',
      'tenant={state.tenant}',
      'project={state.project}',
      'workspace={state.workspace}',
      'auricrux={state.auricrux}',
      'const sessionEmail = session?.email || state.meta.customerSessionEmail || "workspace@futurecontractorsofamerica.com";',
    ],
  },
  {
    file: path.join(root, "package.json"),
    markers: [
      '"validate:live-workspace-persistence": "node scripts/validate-live-workspace-persistence-surfaces.mjs"',
      'npm run validate:live-workspace-persistence && npm run validate:live-workspace-routes && npm run validate:platform-command-center && npm run validate:billing-action-center',
      'npm run validate:seeded-customer-auth && npm run validate:swa-deployment',
      'npm run lint && npm run build',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required live workspace persistence marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Live workspace persistence validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Live workspace persistence validation passed across profile, notifications, and current package build wiring.");
