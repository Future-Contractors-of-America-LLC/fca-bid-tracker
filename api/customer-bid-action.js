import { app } from "@azure/functions";
import { resolveAuthenticatedSession } from "./lib/auth/requestAuth.js";
import { requireProductEntitlement } from "./lib/auth/entitlements.js";

app.http("customer-bid-action", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer-bid-action",
  handler: async (request) => {
    const auth = resolveAuthenticatedSession(request);
    if (!auth.ok) return auth.response;

    const entitlement = requireProductEntitlement(auth.session, "saas");
    if (!entitlement.ok) return entitlement.response;

    const payload = await request.json().catch(() => null);
    if (!payload?.bidId || !payload?.action) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: "bidId and action are required.",
        },
      };
    }

    return {
      status: 200,
      jsonBody: {
        ok: true,
        surface: "saas",
        workflow: "bid",
        accepted: true,
        customerId: auth.session.sub,
        company: auth.session.company,
        bidId: payload.bidId,
        action: payload.action,
        detail: payload.detail || "Bid workflow action accepted.",
        executionMode: "protected-backend-starter",
        timestamp: new Date().toISOString(),
      },
    };
  },
});
