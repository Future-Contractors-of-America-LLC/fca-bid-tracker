import { app } from "@azure/functions";
import { resolveAuthenticatedSession } from "./lib/auth/requestAuth.js";
import { requireProductEntitlement } from "./lib/auth/entitlements.js";

app.http("customer-academy-action", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer-academy-action",
  handler: async (request) => {
    const auth = resolveAuthenticatedSession(request);
    if (!auth.ok) return auth.response;

    const entitlement = requireProductEntitlement(auth.session, "lms");
    if (!entitlement.ok) return entitlement.response;

    const payload = await request.json().catch(() => null);
    if (!payload?.action) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: "action is required.",
        },
      };
    }

    return {
      status: 200,
      jsonBody: {
        ok: true,
        surface: "lms",
        workflow: "academy",
        accepted: true,
        customerId: auth.session.sub,
        company: auth.session.company,
        action: payload.action,
        detail: payload.detail || "Academy workflow action accepted.",
        executionMode: "protected-backend-starter",
        timestamp: new Date().toISOString(),
      },
    };
  },
});
