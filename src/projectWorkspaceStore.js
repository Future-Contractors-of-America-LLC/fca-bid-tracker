import { portalProjects } from "./systemState";

export const PROJECT_WORKSPACE_KEY = "fca_project_workspace_v1";

function toCanonicalProjectId(id = "") {
  if (!id) return "PRJ-UNASSIGNED";
  return id.startsWith("PRJ-") ? id : `PRJ-${String(id).replace(/[^A-Za-z0-9]/g, "")}`;
}

function normalizeProjectRecord(project = {}, index = 0) {
  const baseId = project.id || `A-${index + 1}`;
  const canonicalProjectId = project.canonicalProjectId || toCanonicalProjectId(baseId);

  return {
    id: baseId,
    canonicalProjectId,
    customer: project.customer || "Unassigned customer",
    lifecycleState: project.lifecycleState || project.stage || "Estimating",
    stage: project.stage || project.lifecycleState || "Estimating",
    nextAction: project.nextAction || "Advance project",
    owner: project.owner || "Unassigned",
    due: project.due || "TBD",
    superintendent: project.superintendent || "Pending assignment",
    permitStatus: project.permitStatus || "Permit status pending",
    siteStatus: project.siteStatus || "Site status pending",
    commercialFocus: project.commercialFocus || "Commercial focus pending",
    linkedBidId: project.linkedBidId || `BID-${baseId}`,
    linkedFileCount: Number.isFinite(project.linkedFileCount) ? project.linkedFileCount : 0,
    evidenceStatus: project.evidenceStatus || "Evidence spine pending",
    auditTrailStatus: project.auditTrailStatus || "Audit trail active",
    fileBriefingStatus: project.fileBriefingStatus || "Document briefing pending",
    actionHistory: Array.isArray(project.actionHistory) ? project.actionHistory : [],
    lastActionAt: project.lastActionAt || null,
  };
}

function seedProjectWorkspace() {
  return portalProjects.map((project, index) =>
    normalizeProjectRecord(
      {
        ...project,
        linkedBidId: `BID-${project.id}`,
        linkedFileCount: index === 0 ? 4 : index === 1 ? 3 : 2,
        evidenceStatus:
          index === 0
            ? "Bid package, permit narrative, and onboarding packet linked"
            : index === 1
              ? "Mobilization and field kickoff files linked"
              : "Closeout and owner signoff files linked",
        auditTrailStatus: "Project, file, and Auricrux actions share one audit trail",
        fileBriefingStatus: "Auricrux document briefing ready",
      },
      index
    )
  );
}

export function readProjectWorkspace() {
  if (typeof window === "undefined") return seedProjectWorkspace();

  try {
    const raw = window.localStorage.getItem(PROJECT_WORKSPACE_KEY);
    if (!raw) return seedProjectWorkspace();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedProjectWorkspace();
    return parsed.map((project, index) => normalizeProjectRecord(project, index));
  } catch {
    return seedProjectWorkspace();
  }
}

export function writeProjectWorkspace(projects = []) {
  const normalized = projects.map((project, index) => normalizeProjectRecord(project, index));

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PROJECT_WORKSPACE_KEY, JSON.stringify(normalized));
    } catch {
      // best-effort persistence during shell hardening phase
    }
  }

  return normalized;
}

export function updateProjectWorkspace(mutator) {
  const current = readProjectWorkspace();
  const next = typeof mutator === "function" ? mutator(current) : current;
  return writeProjectWorkspace(next);
}
