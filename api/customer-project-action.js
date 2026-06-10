import { app } from "@azure/functions";
import { resolveAuthenticatedSession } from "./lib/auth/requestAuth.js";
import { requireProductEntitlement } from "./lib/auth/entitlements.js";

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
        executionMode: "protected-backend-starter",
        timestamp: new Date().toISOString(),
      },
    };
  },
});
