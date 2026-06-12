import { app } from "@azure/functions";
import { resolveTenantContextFromRequest } from "./auth-boundary.js";
import { getLead, updateLead } from "./leads-store.js";

app.http("lead-detail", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "leads/{leadId}",
  handler: async (request, context) => {
    const tenantContext = resolveTenantContextFromRequest(request, {
      allowSeededFallback: request.method === "GET",
    });
    const tenantId = tenantContext.tenantId;
    const leadId = context?.triggerMetadata?.leadId || request.params?.leadId;

    if (request.method === "GET") {
      try {
        const item = getLead(tenantId, leadId);
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
            error: error?.message || "Lead not found.",
            authContext: {
              authenticated: tenantContext.authenticated,
              source: tenantContext.source,
              usedFallback: tenantContext.usedFallback,
            },
          },
        };
      }
    }

    if (!tenantContext.authenticated || !tenantContext.tenantId) {
      return {
        status: 401,
        jsonBody: {
          ok: false,
          error: "Authenticated tenant session required for lead updates.",
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
        },
      };
    }

    const body = await request.json().catch(() => ({}));

    try {
      const result = updateLead(tenantId, leadId, body);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          item: result.item,
          auditEventId: result.auditEvent.auditEventId,
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
          error: error?.message || "Lead update failed.",
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
