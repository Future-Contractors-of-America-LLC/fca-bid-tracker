import { app } from "@azure/functions";

const continuityObjects = [
  {
    id: "RFI-A117-001",
    type: "RFI",
    projectId: "PRJ-A117",
    fileId: "FILE-A117-003",
    title: "Mechanical coordination question on rooftop unit clearances",
    status: "Open",
    owner: "Project Coordinator",
    nextAction: "Collect mechanical response and update submittal register",
    auditImpact: "Blocks final trade leveling and permit release timing until answered.",
  },
  {
    id: "CE-A117-001",
    type: "Change Event",
    projectId: "PRJ-A117",
    fileId: "FILE-A117-001",
    title: "Owner-requested alternate finish package",
    status: "Pricing Review",
    owner: "Estimator Team",
    nextAction: "Issue priced change summary for owner decision",
    auditImpact: "Touches scope approval, billing continuity, and file revision visibility.",
  },
  {
    id: "CO-B204-001",
    type: "Change Order",
    projectId: "PRJ-B204",
    fileId: "FILE-B204-001",
    title: "Site logistics revision for mobilization lane closure",
    status: "Pending Signature",
    owner: "Project Manager",
    nextAction: "Secure customer signature and release field logistics update",
    auditImpact: "Protects schedule, customer notice trail, and downstream billing evidence.",
  },
  {
    id: "QC-C332-001",
    type: "QC / Punch",
    projectId: "PRJ-C332",
    fileId: null,
    title: "Final owner walk punch confirmation",
    status: "Awaiting Closeout",
    owner: "Customer Success",
    nextAction: "Capture signed punch confirmation and release retainage follow-through",
    auditImpact: "Controls closeout completion, warranty posture, and final invoice readiness.",
  },
];

app.http("continuity-objects", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "continuity-objects",
  handler: async (request) => {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const projectId = url.searchParams.get("projectId");
      const items = projectId
        ? continuityObjects.filter((item) => item.projectId === projectId)
        : continuityObjects;

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
    const item = {
      id: body?.id || `COBJ-${Date.now()}`,
      type: body?.type || "Unclassified",
      projectId: body?.projectId || null,
      fileId: body?.fileId || null,
      title: body?.title || null,
      status: body?.status || "Open",
      owner: body?.owner || "Unassigned",
      nextAction: body?.nextAction || "Review continuity object",
      auditImpact: body?.auditImpact || "Audit impact pending classification.",
    };

    if (!item.projectId || !item.title) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          accepted: false,
          message: "projectId and title are required continuity object fields",
        },
      };
    }

    return {
      status: 200,
      jsonBody: {
        ok: true,
        accepted: true,
        item,
        message: "Continuity object accepted",
      },
    };
  },
});
