import { portalFiles } from "./systemState";

export const PROJECT_FILE_WORKSPACE_KEY = "fca_project_file_workspace_v1";

function normalizeProjectFile(file = {}, index = 0) {
  return {
    fileId: file.fileId || `FILE-${index + 1}`,
    projectId: file.projectId || file.ownerObjectId || "PRJ-UNASSIGNED",
    bidId: file.bidId || null,
    ownerObjectType: file.ownerObjectType || "Project",
    ownerObjectId: file.ownerObjectId || file.projectId || "PRJ-UNASSIGNED",
    linkedEvidenceTarget: file.linkedEvidenceTarget || "Evidence target pending",
    evidenceStatus: file.evidenceStatus || "Classification pending",
    versionLabel: file.versionLabel || "Rev 1",
    name: file.name || `Project Artifact ${index + 1}`,
    category: file.category || "General",
    updated: file.updated || "Unknown",
    action: file.action || "Review",
    discipline: file.discipline || "Operations",
    status: file.status || "Needs review",
    owner: file.owner || "Unassigned",
    note: file.note || "No file note recorded.",
  };
}

function seedProjectFileWorkspace() {
  return portalFiles.map((file, index) => normalizeProjectFile(file, index));
}

export function readProjectFileWorkspace() {
  if (typeof window === "undefined") return seedProjectFileWorkspace();

  try {
    const raw = window.localStorage.getItem(PROJECT_FILE_WORKSPACE_KEY);
    if (!raw) return seedProjectFileWorkspace();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedProjectFileWorkspace();
    return parsed.map((file, index) => normalizeProjectFile(file, index));
  } catch {
    return seedProjectFileWorkspace();
  }
}

export function writeProjectFileWorkspace(files = []) {
  const normalized = files.map((file, index) => normalizeProjectFile(file, index));

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PROJECT_FILE_WORKSPACE_KEY, JSON.stringify(normalized));
    } catch {
      // best-effort persistence during shell hardening phase
    }
  }

  return normalized;
}

export function readFilesForProject(projectId, files = readProjectFileWorkspace()) {
  return files.filter((file) => file.projectId === projectId || file.ownerObjectId === projectId);
}

export function updateProjectFileWorkspace(mutator) {
  const current = readProjectFileWorkspace();
  const next = typeof mutator === "function" ? mutator(current) : current;
  return writeProjectFileWorkspace(next);
}
