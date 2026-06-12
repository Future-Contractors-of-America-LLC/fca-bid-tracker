import { app } from "@azure/functions";
import { resolveTenantContextFromRequest } from "./auth-boundary.js";
import { getOpportunityWorkspace } from "./workspace-read-models.js";

app.http("opportunities-workspace", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "opportunities/{opportunityId}/workspace",
  handler: async (request, context) => {
    const tenantContext = resolveTenantContextFromRequest(request, {
      allowSeededFallback: true,
    });
    const tenantId = tenantContext.tenantId;
    const opportunityId = context?.triggerMetadata?.opportunityId || request.params?.opportunityId;

    try {
      const item = getOpportunityWorkspace(tenantId, opportunityId);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          item,
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
          backingSource: "api-workflow-store",
        },
      };
    } catch (error) {
      return {
        status: 404,
        jsonBody: {
          ok: false,
          error: error?.message || "Opportunity workspace not found.",
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
        },
      };
    }
  },
});
