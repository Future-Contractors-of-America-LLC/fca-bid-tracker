import { app } from "@azure/functions";
import { resolveTenantContextFromRequest } from "./auth-boundary.js";
import { convertOpportunityToProject } from "./leads-store.js";

app.http("opportunity-convert", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "opportunities/{opportunityId}/convert-to-project",
  handler: async (request, context) => {
    const tenantContext = resolveTenantContextFromRequest(request, {
      allowSeededFallback: false,
    });
    const opportunityId = context?.triggerMetadata?.opportunityId || request.params?.opportunityId;
    const body = await request.json().catch(() => ({}));

    if (!tenantContext.authenticated || !tenantContext.tenantId) {
      return {
        status: 401,
        jsonBody: {
          ok: false,
          error: "Authenticated tenant session required for opportunity conversion.",
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
        },
      };
    }

    try {
      const result = convertOpportunityToProject(tenantContext.tenantId, opportunityId, body);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          item: result.item,
          auditEvents: result.auditEvents,
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
        status: 400,
        jsonBody: {
          ok: false,
          error: error?.message || "Opportunity conversion failed.",
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
