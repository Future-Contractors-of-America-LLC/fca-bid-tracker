import { app } from "@azure/functions";
import { resolveAuthenticatedSession } from "./lib/auth/requestAuth.js";
import { requireProductEntitlement } from "./lib/auth/entitlements.js";

app.http("customer-workspace-summary", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer-workspace-summary",
  handler: async (request) => {
    const auth = resolveAuthenticatedSession(request);
    if (!auth.ok) {
      return auth.response;
    }

    const entitlement = requireProductEntitlement(auth.session, "saas");
    if (!entitlement.ok) {
      return entitlement.response;
    }

    return {
      status: 200,
      jsonBody: {
        ok: true,
        surface: "saas",
        customer: {
          customerId: auth.session.sub,
          email: auth.session.email,
          company: auth.session.company,
          role: auth.session.role,
          workspaceLabel: auth.session.workspaceLabel,
          selectedPlan: auth.session.selectedPlan,
        },
        workspace: {
          title: "FCA Contractor Command Workspace",
          nextAction: "Review active projects, estimate posture, and file dependencies.",
          modules: [
            "projects",
            "bids",
            "files",
            "messages",
            "billing",
            "support",
          ],
          operationalStatus: "customer-workspace-ready",
        },
        entitlements: auth.session.enabledProducts,
        timestamp: new Date().toISOString(),
      },
    };
  },
});
