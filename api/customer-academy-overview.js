import { app } from "@azure/functions";
import { resolveAuthenticatedSession } from "./lib/auth/requestAuth.js";
import { requireProductEntitlement } from "./lib/auth/entitlements.js";

app.http("customer-academy-overview", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer-academy-overview",
  handler: async (request) => {
    const auth = resolveAuthenticatedSession(request);
    if (!auth.ok) {
      return auth.response;
    }

    const entitlement = requireProductEntitlement(auth.session, "lms");
    if (!entitlement.ok) {
      return entitlement.response;
    }

    return {
      status: 200,
      jsonBody: {
        ok: true,
        surface: "lms",
        customer: {
          customerId: auth.session.sub,
          company: auth.session.company,
          workspaceLabel: auth.session.workspaceLabel,
        },
        academy: {
          title: "FCA Academy",
          readinessStatus: "academy-route-enabled",
          learnersReadyForAssignment: 2,
          activePrograms: [
            "onboarding",
            "safety-readiness",
            "estimating-basics",
            "field-document-control",
          ],
          nextAction: "Assign learners and preserve continuity into project mobilization.",
        },
        entitlements: auth.session.enabledProducts,
        timestamp: new Date().toISOString(),
      },
    };
  },
});
