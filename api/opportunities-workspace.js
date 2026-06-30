import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { getOpportunityWorkspace } from "./workspace-read-models.js";

app.http("opportunities-workspace", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "opportunities/{opportunityId}/workspace",
  handler: async (request, context) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;

    const tenantId = auth.tenantId;
    const opportunityId = context?.triggerMetadata?.opportunityId || request.params?.opportunityId;

    try {
      const item = getOpportunityWorkspace(tenantId, opportunityId);
      return withSessionRefresh(
        {
          status: 200,
          jsonBody: {
            ok: true,
            item,
            backingSource: "api-workflow-store",
          },
        },
        auth,
      );
    } catch (error) {
      return {
        status: 404,
        jsonBody: {
          ok: false,
          error: error?.message || "Opportunity workspace not found.",
        },
      };
    }
  },
});
