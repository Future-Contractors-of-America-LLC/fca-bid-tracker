import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "customerSession.js"),
    markers: [
      'function normalizeProjectAccess(projectAccess)',
      'primaryProjectId: projectAccess?.primaryProjectId || "A-117"',
      'projectIds: Array.isArray(projectAccess?.projectIds)',
      'projectAccess: normalizeProjectAccess(session.projectAccess)',
    ],
  },
  {
    file: path.join(root, "src", "hooks", "useCustomerSession.js"),
    markers: [
      'function resolveProjectAccess(role = "Owner / Admin", company = "FCA Workspace")',
      'projectAccess = resolveProjectAccess(normalizedRole, normalizedCompany);',
      'projectAccess,',
      'project/file ownership continuity bound to ${projectAccess.primaryProjectId}',
    ],
  },
  {
    file: path.join(root, "src", "hooks", "useWorkspaceState.js"),
    markers: [
      'primaryProjectId: session.projectAccess?.primaryProjectId || "A-117"',
      'projectIds: session.projectAccess?.projectIds || ["A-117"]',
      'fileScope: session.projectAccess?.fileScope || "project-owned"',
    ],
  },
  {
    file: path.join(root, "src", "hooks", "useProjectWorkspace.js"),
    markers: [
      'function filterProjectsForSession(projects)',
      'const allowed = session.projectAccess?.projectIds || [];',
      'setProjects(filterProjectsForSession(saved));',
    ],
  },
  {
    file: path.join(root, "src", "hooks", "useFileWorkspace.js"),
    markers: [
      'function filterFilesForSession(files)',
      'const allowed = session.projectAccess?.projectIds || [];',
      'setFiles(filterFilesForSession(saved));',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalProjects.jsx"),
    markers: [
      '<strong>Primary project:</strong> {state.meta.primaryProjectId || "A-117"}',
      '<strong>Project ownership:</strong> {(state.meta.projectIds || ["A-117"]).join(", ")}',
      '<strong>File scope:</strong> {state.meta.fileScope || "project-owned"}',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalFiles.jsx"),
    markers: [
      '<strong>Ownership scope:</strong> Project-linked authenticated workspace continuity',
      'Select the project spine the files belong to',
    ],
  },
  {
    file: path.join(root, "package.json"),
    markers: [
      '"validate:project-file-ownership-continuity": "node scripts/validate-project-file-ownership-continuity.mjs"',
      'npm run validate:project-workspace && npm run validate:project-file-ownership-continuity && npm run validate:seeded-customer-auth',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required project/file ownership continuity marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Project/file ownership continuity validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Project/file ownership continuity validation passed.");
