import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "pages", "portal", "PortalProjects.jsx"),
    markers: [
      'import useWorkspaceState from "../../hooks/useWorkspaceState";',
      'refreshSyncStamp("Persisted project flow state active")',
      'tenant={state.tenant}',
      'project={state.project}',
      'workspace={state.workspace}',
      'auricrux={state.auricrux}',
      '<strong>Authenticated customer:</strong> {state.meta.authenticatedCustomer || "Continuity shell visitor"}',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalMessages.jsx"),
    markers: [
      'import useWorkspaceState from "../../hooks/useWorkspaceState";',
      'refreshSyncStamp("Persisted message continuity state active")',
      '<strong>Source:</strong> {state.meta.backingSource}',
      '<strong>Status:</strong> {state.meta.persistenceState}',
      '<strong>Last sync:</strong> {state.meta.lastSyncedAt || "Pending initial sync"}',
      '<strong>Authenticated customer:</strong> {state.meta.authenticatedCustomer || "Continuity shell visitor"}',
      '<div><strong>Next customer action:</strong> {state.workspace.currentNextAction}</div>',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalBilling.jsx"),
    markers: [
      'import useWorkspaceState from "../../hooks/useWorkspaceState";',
      'refreshSyncStamp("Persisted billing continuity state active")',
      'tenant={state.tenant}',
      'project={state.project}',
      'workspace={state.workspace}',
      'auricrux={state.auricrux}',
      '<strong>Business impact:</strong> {state.auricrux.blockerImpact}',
    ],
  },
  {
    file: path.join(root, "package.json"),
    markers: [
      '"validate:live-workspace-routes": "node scripts/validate-live-workspace-route-persistence.mjs"',
      'npm run validate:live-workspace-persistence && npm run validate:live-workspace-routes && npm run validate:platform-command-center && npm run validate:billing-action-center',
      'npm run validate:seeded-customer-auth && npm run validate:swa-deployment',
      'npm run validate:product-readiness && npm run validate:operations-pipeline && npm run validate:website-market-readiness',
      'npm run validate:file-governance && npm run validate:billing-governance && npm run validate:support-governance && npm run lint && npm run build',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required live workspace route persistence marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Live workspace route persistence validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Live workspace route persistence validation passed across projects, messages, billing, and current build wiring.");
