import { currentProject, portalFiles, projectAuditEvents } from "./systemState";

export const PROJECT_FILE_WORKSPACE_KEY = "fca_project_file_workspace_v1";

function buildSeedBriefing(file, index) {
  return {
    id: `BRF-${index + 1}`,
    projectId: currentProject.id,
    fileId: `FILE-${index + 1}`,
    packageLabel: file.name,
    summary: file.note || `${file.name} is attached to ${currentProject.id} for shared operating visibility.`,
    missingItems: file.status?.toLowerCase().includes("awaiting")
      ? ["Customer approval record"]
      : file.status?.toLowerCase().includes("open")
        ? ["Open coordination item closure"]
        : [],
    revisionSignals: [file.status || "Revision state pending review", file.updated || "Update timestamp pending"],
    recommendedNextActions: [file.action || "Review file package", `Route follow-through through ${currentProject.id}`],
    createdAt: new Date().toISOString(),
  };
}

function normalizeFileRecord(file = {}, index = 0) {
  return {
    id: file.id || `FILE-${index + 1}`,
    projectId: file.projectId || currentProject.id,
    packageLabel: file.packageLabel || file.name || `Package ${index + 1}`,
    name: file.name || `Document ${index + 1}`,
    category: file.category || "Document",
    updated: file.updated || "Just now",
    action: file.action || "Review package",
    discipline: file.discipline || "General",
    status: file.status || "Ready for review",
    owner: file.owner || "Auricrux",
    note: file.note || "Project-linked file package attached.",
    revisionLabel: file.revisionLabel || "Rev 0",
    version: Number.isFinite(file.version) ? file.version : 1,
    briefingId: file.briefingId || null,
  };
}

function normalizeBriefingRecord(briefing = {}, index = 0) {
  return {
    id: briefing.id || `BRF-${index + 1}`,
    projectId: briefing.projectId || currentProject.id,
    fileId: briefing.fileId || null,
    packageLabel: briefing.packageLabel || `Package ${index + 1}`,
    summary: briefing.summary || "Auricrux briefing pending.",
    missingItems: Array.isArray(briefing.missingItems) ? briefing.missingItems : [],
    revisionSignals: Array.isArray(briefing.revisionSignals) ? briefing.revisionSignals : [],
    recommendedNextActions: Array.isArray(briefing.recommendedNextActions) ? briefing.recommendedNextActions : [],
    createdAt: briefing.createdAt || new Date().toISOString(),
  };
}

function normalizeAuditEvent(event = {}, index = 0) {
  return {
    id: event.id || `AUD-${index + 1}`,
    projectId: event.projectId || currentProject.id,
    time: event.time || "Now",
    action: event.action || "Audit event recorded",
    detail: event.detail || "Auricrux recorded a continuity event.",
    discipline: event.discipline || "Continuity",
    createdAt: event.createdAt || new Date().toISOString(),
  };
}

function seedWorkspace() {
  const files = portalFiles.map((file, index) => normalizeFileRecord(file, index));
  const briefings = files.map((file, index) => normalizeBriefingRecord(buildSeedBriefing(file, index), index));
  const filesWithBriefings = files.map((file, index) => ({ ...file, briefingId: briefings[index]?.id || null }));

  return {
    files: filesWithBriefings,
    briefings,
    auditEvents: projectAuditEvents.map((event, index) => normalizeAuditEvent(event, index)),
  };
}

export function readProjectFileWorkspace() {
  if (typeof window === "undefined") return seedWorkspace();

  try {
    const raw = window.localStorage.getItem(PROJECT_FILE_WORKSPACE_KEY);
    if (!raw) return seedWorkspace();
    const parsed = JSON.parse(raw);
    return {
      files: Array.isArray(parsed?.files) ? parsed.files.map((file, index) => normalizeFileRecord(file, index)) : seedWorkspace().files,
      briefings: Array.isArray(parsed?.briefings) ? parsed.briefings.map((briefing, index) => normalizeBriefingRecord(briefing, index)) : seedWorkspace().briefings,
      auditEvents: Array.isArray(parsed?.auditEvents) ? parsed.auditEvents.map((event, index) => normalizeAuditEvent(event, index)) : seedWorkspace().auditEvents,
    };
  } catch {
    return seedWorkspace();
  }
}

export function writeProjectFileWorkspace(workspace = {}) {
  const normalized = {
    files: Array.isArray(workspace.files) ? workspace.files.map((file, index) => normalizeFileRecord(file, index)) : [],
    briefings: Array.isArray(workspace.briefings) ? workspace.briefings.map((briefing, index) => normalizeBriefingRecord(briefing, index)) : [],
    auditEvents: Array.isArray(workspace.auditEvents) ? workspace.auditEvents.map((event, index) => normalizeAuditEvent(event, index)) : [],
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PROJECT_FILE_WORKSPACE_KEY, JSON.stringify(normalized));
    } catch {
      // best-effort persistence during shell hardening phase
    }
  }

  return normalized;
}

export function updateProjectFileWorkspace(mutator) {
  const current = readProjectFileWorkspace();
  const next = typeof mutator === "function" ? mutator(current) : current;
  return writeProjectFileWorkspace(next);
}
