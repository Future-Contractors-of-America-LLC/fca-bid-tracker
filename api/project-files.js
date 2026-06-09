import { app } from "@azure/functions";

const sampleProjectFiles = [
  {
    fileId: "FILE-A117-001",
    projectId: "PRJ-A117",
    bidId: "BID-001",
    ownerObjectType: "Project",
    ownerObjectId: "PRJ-A117",
    linkedEvidenceTarget: "Estimate assumptions and owner review packet",
    evidenceStatus: "Evidence linked",
    versionLabel: "Rev 3",
    name: "Bid package summary.pdf",
    category: "Bid",
    updated: "18 minutes ago",
    action: "Review and approve",
    discipline: "Preconstruction",
    status: "Ready for owner review",
    owner: "Estimator Team",
    note: "Scope inclusions, exclusions, and alternates are aligned to Package A-117.",
  },
  {
    fileId: "FILE-A117-002",
    projectId: "PRJ-A117",
    bidId: "BID-001",
    ownerObjectType: "Project",
    ownerObjectId: "PRJ-A117",
    linkedEvidenceTarget: "Permit submission packet",
    evidenceStatus: "Classification ready",
    versionLabel: "Rev 2",
    name: "Permit set_A117.pdf",
    category: "Permit",
    updated: "42 minutes ago",
    action: "Release for submission",
    discipline: "Permitting",
    status: "Awaiting final stamp set",
    owner: "Project Engineer",
    note: "Permit narrative and drawing set are assembled but still waiting on final owner scope approval.",
  },
  {
    fileId: "FILE-A117-003",
    projectId: "PRJ-A117",
    bidId: "BID-001",
    ownerObjectType: "Project",
    ownerObjectId: "PRJ-A117",
    linkedEvidenceTarget: "RFI and submittal register",
    evidenceStatus: "Needs follow-through",
    versionLabel: "Live register",
    name: "RFI_Submittal_Log_A117.xlsx",
    category: "Coordination",
    updated: "1 hour ago",
    action: "Update open items",
    discipline: "Document Control",
    status: "3 open items",
    owner: "Project Coordinator",
    note: "Mechanical coordination item is still holding final trade leveling and long-lead release timing.",
  },
  {
    fileId: "FILE-B204-001",
    projectId: "PRJ-B204",
    bidId: "BID-002",
    ownerObjectType: "Project",
    ownerObjectId: "PRJ-B204",
    linkedEvidenceTarget: "Mobilization release packet",
    evidenceStatus: "Evidence linked",
    versionLabel: "Issue for field",
    name: "Mobilization_Checklist_B204.pdf",
    category: "Field",
    updated: "25 minutes ago",
    action: "Release to field team",
    discipline: "Operations",
    status: "Ready for mobilization",
    owner: "Project Coordinator",
    note: "Crew assignments, site logistics, and first-week milestones are attached to the project root.",
  },
];

function normalizeIncomingFile(body = {}) {
  return {
    fileId: body.fileId || `FILE-${Date.now()}`,
    projectId: body.projectId || null,
    bidId: body.bidId || null,
    ownerObjectType: body.ownerObjectType || "Project",
    ownerObjectId: body.ownerObjectId || body.projectId || null,
    linkedEvidenceTarget: body.linkedEvidenceTarget || "Evidence target pending",
    evidenceStatus: body.evidenceStatus || "Classification pending",
    versionLabel: body.versionLabel || "Rev 1",
    name: body.name || null,
    category: body.category || "General",
    updated: body.updated || "Just now",
    action: body.action || "Review",
    discipline: body.discipline || "Operations",
    status: body.status || "Needs review",
    owner: body.owner || "Unassigned",
    note: body.note || "No file note recorded.",
  };
}

app.http("project-files", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "project-files",
  handler: async (request) => {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const projectId = url.searchParams.get("projectId");
      const items = projectId
        ? sampleProjectFiles.filter((file) => file.projectId === projectId)
        : sampleProjectFiles;

      return {
        status: 200,
        jsonBody: {
          ok: true,
          items,
          count: items.length,
          projectId: projectId || null,
        },
      };
    }

    const body = await request.json().catch(() => ({}));
    const normalized = normalizeIncomingFile(body);

    if (!normalized.projectId) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          accepted: false,
          message: "projectId is required to attach a file to the project spine",
        },
      };
    }

    if (!normalized.name) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          accepted: false,
          message: "name is required for a project file artifact",
        },
      };
    }

    return {
      status: 200,
      jsonBody: {
        ok: true,
        accepted: true,
        item: normalized,
        message: "Project file artifact accepted",
      },
    };
  },
});
