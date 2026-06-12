import { app } from "@azure/functions";
import { resolveTenantContextFromRequest } from "./auth-boundary.js";
import { qualifyLead } from "./leads-store.js";

app.http("lead-qualify", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "leads/{leadId}/qualify",
  handler: async (request, context) => {
    const tenantContext = resolveTenantContextFromRequest(request, {
      allowSeededFallback: false,
    });
    const tenantId = tenantContext.tenantId;
    const leadId = context?.triggerMetadata?.leadId || request.params?.leadId;
    const body = await request.json().catch(() => ({}));

    if (!tenantContext.authenticated || !tenantContext.tenantId) {
      return {
        status: 401,
        jsonBody: {
          ok: false,
          error: "Authenticated tenant session required for lead qualification.",
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
        },
      };
    }

    try {
      const result = qualifyLead(tenantId, leadId, body);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          lead: result.lead,
          opportunity: result.opportunity,
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
          error: error?.message || "Lead qualification failed.",
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
