import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "fileWorkspaceStore.js"),
    markers: [
      'const FILE_WORKSPACE_KEY = "fca_file_workspace_v1";',
      'function normalizeFileRecord(file = {}, index = 0)',
      'export function readFileWorkspace()',
      'export function writeFileWorkspace(files = [])',
      'export function updateFileWorkspace(mutator)',
    ],
  },
  {
    file: path.join(root, "src", "hooks", "useFileWorkspace.js"),
    markers: [
      'export default function useFileWorkspace()',
      'attachEvidence(project)',
      'generateBriefing(project)',
      'appendAutomationLog({',
      'appendCommercialLog({',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalFiles.jsx"),
    markers: [
      'import useFileWorkspace from "../../hooks/useFileWorkspace";',
      'Attach Evidence to {selectedProject.canonicalProjectId}',
      'Refresh Auricrux Briefing',
      '<ProjectFileAuditPanel project={selectedProject || currentProject} files={selectedFiles} auditEvents={selectedAuditEvents} />',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalProjects.jsx"),
    markers: [
      'import useFileWorkspace from "../../hooks/useFileWorkspace";',
      '<strong>Workspace file count:</strong> {totalFiles}',
      'const linkedFiles = getFilesForProject(project.id);',
    ],
  },
  {
    file: path.join(root, "package.json"),
    markers: [
      '"validate:file-workspace": "node scripts/validate-file-workspace.mjs"',
      'npm run validate:qualification-evidence-spine && npm run validate:project-workspace && npm run validate:file-workspace && npm run validate:project-file-ownership-continuity',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required file workspace marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("File workspace validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("File workspace validation passed.");
