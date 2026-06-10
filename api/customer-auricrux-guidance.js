import { app } from "@azure/functions";
import { resolveAuthenticatedSession } from "./lib/auth/requestAuth.js";
import { requireProductEntitlement } from "./lib/auth/entitlements.js";

app.http("customer-auricrux-guidance", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer-auricrux-guidance",
  handler: async (request) => {
    const auth = resolveAuthenticatedSession(request);
    if (!auth.ok) {
      return auth.response;
    }

    const entitlement = requireProductEntitlement(auth.session, "auricrux");
    if (!entitlement.ok) {
      return entitlement.response;
    }

    return {
      status: 200,
      jsonBody: {
        ok: true,
        surface: "auricrux",
        customer: {
          customerId: auth.session.sub,
          company: auth.session.company,
          role: auth.session.role,
        },
        guidance: {
          executiveMode: "continuity-active",
          nextRecommendedAction: "Advance project blockers, preserve file evidence, and carry plan-backed execution into billing and training.",
          currentBlocker: "Permit dependency remains the highest leverage blocker.",
          commandDeck: [
            "open-projects",
            "review-files",
            "check-billing-readiness",
            "assign-academy-follow-through",
          ],
        },
        entitlements: auth.session.enabledProducts,
        timestamp: new Date().toISOString(),
      },
    };
  },
});
