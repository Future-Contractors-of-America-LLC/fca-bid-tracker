const FILE_WORKSPACE_KEY = "fca_file_workspace_v1";

function normalizeFileRecord(file = {}, index = 0) {
  return {
    id: file.id || `FILE-${index + 1}`,
    projectId: file.projectId || "A-117",
    canonicalProjectId: file.canonicalProjectId || `PRJ-${(file.projectId || "A117").replace(/[^A-Za-z0-9]/g, "")}`,
    name: file.name || `Project artifact ${index + 1}`,
    category: file.category || "Project Artifact",
    updated: file.updated || "Pending sync",
    action: file.action || "Review",
    discipline: file.discipline || "General",
    status: file.status || "Attached",
    owner: file.owner || "Auricrux",
    note: file.note || "Attached to the project evidence spine.",
    version: file.version || "v1",
    evidenceLinkType: file.evidenceLinkType || "project-artifact",
    auditStatus: file.auditStatus || "Audit-linked",
    briefingStatus: file.briefingStatus || "Briefing pending",
  };
}

function seedFileWorkspace() {
  return [
    {
      id: "FILE-A117-001",
      projectId: "A-117",
      canonicalProjectId: "PRJ-A117",
      name: "Bid package summary.pdf",
      category: "Bid",
      updated: "18 minutes ago",
      action: "Review and approve",
      discipline: "Preconstruction",
      status: "Ready for owner review",
      owner: "Estimator Team",
      note: "Scope inclusions, exclusions, and alternates are aligned to Package A-117.",
      version: "v3",
      evidenceLinkType: "bid-package",
      auditStatus: "Qualification evidence linked",
      briefingStatus: "Auricrux briefing ready",
    },
    {
      id: "FILE-A117-002",
      projectId: "A-117",
      canonicalProjectId: "PRJ-A117",
      name: "Permit set_A117.pdf",
      category: "Permit",
      updated: "42 minutes ago",
      action: "Release for submission",
      discipline: "Permitting",
      status: "Awaiting final stamp set",
      owner: "Project Engineer",
      note: "Permit narrative and drawing set are assembled but still waiting on final owner scope approval.",
      version: "v2",
      evidenceLinkType: "permit-set",
      auditStatus: "Revision-controlled",
      briefingStatus: "Auricrux briefing ready",
    },
    {
      id: "FILE-A117-003",
      projectId: "A-117",
      canonicalProjectId: "PRJ-A117",
      name: "RFI_Submittal_Log_A117.xlsx",
      category: "Coordination",
      updated: "1 hour ago",
      action: "Update open items",
      discipline: "Document Control",
      status: "3 open items",
      owner: "Project Coordinator",
      note: "Mechanical coordination item is still holding final trade leveling and long-lead release timing.",
      version: "v5",
      evidenceLinkType: "coordination-register",
      auditStatus: "Open item continuity active",
      briefingStatus: "Auricrux briefing ready",
    },
    {
      id: "FILE-A117-004",
      projectId: "A-117",
      canonicalProjectId: "PRJ-A117",
      name: "Site_Safety_Onboarding_Packet.pdf",
      category: "Field",
      updated: "2 hours ago",
      action: "Assign field onboarding",
      discipline: "Safety",
      status: "Ready for kickoff",
      owner: "Field Operations",
      note: "JHA orientation, worker sign-off forms, and academy-linked readiness steps are bundled together.",
      version: "v1",
      evidenceLinkType: "onboarding-packet",
      auditStatus: "Field readiness linked",
      briefingStatus: "Auricrux briefing ready",
    },
    {
      id: "FILE-B204-001",
      projectId: "B-204",
      canonicalProjectId: "PRJ-B204",
      name: "Mobilization_Checklist_B204.pdf",
      category: "Execution",
      updated: "Today",
      action: "Confirm crew release",
      discipline: "Field Operations",
      status: "Mobilization ready",
      owner: "Project Coordinator",
      note: "Crew release and site setup prerequisites are tied to permit approval and kickoff continuity.",
      version: "v2",
      evidenceLinkType: "mobilization-checklist",
      auditStatus: "Execution handoff linked",
      briefingStatus: "Auricrux briefing ready",
    },
    {
      id: "FILE-C332-001",
      projectId: "C-332",
      canonicalProjectId: "PRJ-C332",
      name: "Closeout_Punch_Confirmation_C332.pdf",
      category: "Closeout",
      updated: "Today",
      action: "Collect owner signoff",
      discipline: "Closeout",
      status: "Awaiting signature",
      owner: "Customer Success",
      note: "Punch completion and retainage release are linked to one closeout evidence package.",
      version: "v1",
      evidenceLinkType: "closeout-confirmation",
      auditStatus: "Closeout continuity linked",
      briefingStatus: "Auricrux briefing ready",
    },
  ].map((file, index) => normalizeFileRecord(file, index));
}

export function readFileWorkspace() {
  if (typeof window === "undefined") return seedFileWorkspace();

  try {
    const raw = window.localStorage.getItem(FILE_WORKSPACE_KEY);
    if (!raw) return seedFileWorkspace();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedFileWorkspace();
    return parsed.map((file, index) => normalizeFileRecord(file, index));
  } catch {
    return seedFileWorkspace();
  }
}

export function writeFileWorkspace(files = []) {
  const normalized = files.map((file, index) => normalizeFileRecord(file, index));

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(FILE_WORKSPACE_KEY, JSON.stringify(normalized));
    } catch {
      // best-effort persistence during shell hardening phase
    }
  }

  return normalized;
}

export function updateFileWorkspace(mutator) {
  const current = readFileWorkspace();
  const next = typeof mutator === "function" ? mutator(current) : current;
  return writeFileWorkspace(next);
}
