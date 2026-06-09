import { app } from "@azure/functions";

const sampleProjects = [
  {
    id: "PRJ-A117",
    bidId: "BID-001",
    customerId: "TEN-FCA-001",
    customer: "FCA Pilot Customer",
    name: "FCA Pilot Customer Tenant Improvement",
    stage: "Estimating",
    lifecycleState: "Bid",
    nextAction: "Approve revised scope and release onboarding packet",
    owner: "Estimator Team",
    due: "Today",
    health: "blocked",
    blocker: "Customer scope approval pending",
    fileSpineStatus: "18 linked files and onboarding artifacts attached to project context",
    auditStatus: "Auricrux action log active",
    auricruxSummary:
      "Auricrux is reading this project as the active operating root for files, communication, and onboarding continuity.",
  },
  {
    id: "PRJ-B204",
    bidId: "BID-002",
    customerId: "TEN-NRC-204",
    customer: "North Ridge Commercial",
    name: "North Ridge Exterior Upgrade Program",
    stage: "Execution",
    lifecycleState: "Build",
    nextAction: "Release mobilization checklist",
    owner: "Project Coordinator",
    due: "Tomorrow",
    health: "active",
    blocker: "No critical blocker recorded",
    fileSpineStatus: "Permit and mobilization package linked",
    auditStatus: "Field and billing timeline synchronized",
    auricruxSummary:
      "Auricrux is tracking mobilization readiness, permit status, and commercial follow-through in one project spine.",
  },
  {
    id: "PRJ-C332",
    bidId: "BID-003",
    customerId: "TEN-CVS-332",
    customer: "Cedar Valley Schools",
    name: "Cedar Valley Punch and Closeout",
    stage: "Closeout",
    lifecycleState: "Closeout",
    nextAction: "Collect signed punch confirmation",
    owner: "Customer Success",
    due: "This week",
    health: "watch",
    blocker: "Final owner signoff pending",
    fileSpineStatus: "Closeout package nearly complete",
    auditStatus: "Retainage and final inspection events visible",
    auricruxSummary:
      "Auricrux is holding closeout, billing, and owner confirmation inside the same accountable project record.",
  },
];

app.http("projects", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "projects",
  handler: async (request) => {
    if (request.method === "GET") {
      return {
        status: 200,
        jsonBody: {
          ok: true,
          items: sampleProjects,
          count: sampleProjects.length,
        },
      };
    }

    const body = await request.json().catch(() => ({}));
    const projectId = body?.id || body?.projectId || `PRJ-${Date.now()}`;

    return {
      status: 200,
      jsonBody: {
        ok: true,
        accepted: true,
        projectId,
        message: "Project workspace accepted",
      },
    };
  },
});
