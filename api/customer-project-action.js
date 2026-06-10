import { app } from "@azure/functions";
import { resolveAuthenticatedSession } from "./lib/auth/requestAuth.js";
import { requireProductEntitlement } from "./lib/auth/entitlements.js";
import { updateCustomerState } from "./lib/persistence/customerStateStore.js";

function applyProjectAction(currentProjects = [], payload = {}) {
  return currentProjects.map((project) => {
    if (project.id !== payload.projectId) return project;

    const next = {
      ...project,
      lastActionAt: new Date().toISOString(),
    };

    switch (payload.action) {
      case "clear-permit-blocker":
        next.permitStatus = "Permit cleared for next move";
        next.siteStatus = "Ready for mobilization planning";
        next.nextAction = payload.detail || "Permit dependency cleared.";
        break;
      case "move-to-execution":
        next.stage = "Execution";
        next.nextAction = payload.detail || "Execution stage active.";
        break;
      case "move-to-closeout":
        next.stage = "Closeout";
        next.nextAction = payload.detail || "Closeout stage active.";
        break;
      default:
        next.nextAction = payload.detail || next.nextAction;
        break;
    }

    return next;
  });
}

app.http("customer-project-action", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer-project-action",
  handler: async (request) => {
    const auth = resolveAuthenticatedSession(request);
    if (!auth.ok) return auth.response;

    const entitlement = requireProductEntitlement(auth.session, "saas");
    if (!entitlement.ok) return entitlement.response;

    const payload = await request.json().catch(() => null);
    if (!payload?.projectId || !payload?.action) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: "projectId and action are required.",
        },
      };
    }

    const nextState = updateCustomerState(auth.session, (current) => ({
      ...current,
      projects: applyProjectAction(current.projects || [], payload),
      workspace: {
        ...current.workspace,
        nextAction: payload.detail || current.workspace?.nextAction,
      },
      auricrux: {
        ...current.auricrux,
        nextRecommendedAction: payload.detail || current.auricrux?.nextRecommendedAction,
        currentBlocker: payload.action === "clear-permit-blocker"
          ? "Permit dependency cleared"
          : current.auricrux?.currentBlocker,
      },
    }));

    return {
      status: 200,
      jsonBody: {
        ok: true,
        surface: "saas",
        workflow: "project",
        accepted: true,
        customerId: auth.session.sub,
        company: auth.session.company,
        projectId: payload.projectId,
        action: payload.action,
        detail: payload.detail || "Project workflow action accepted.",
        projects: nextState.projects,
        persistence: nextState.meta,
        executionMode: "protected-backend-persistence-starter",
        timestamp: new Date().toISOString(),
      },
    };
  },
});
