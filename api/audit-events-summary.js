import { app } from "@azure/functions";
import { resolveTenantContextFromRequest } from "./auth-boundary.js";
import { getAuditSummary } from "./workspace-read-models.js";

app.http("audit-events-summary", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "audit-events/summary",
  handler: async (request) => {
    const tenantContext = resolveTenantContextFromRequest(request, {
      allowSeededFallback: true,
    });
    const tenantId = tenantContext.tenantId;
    const relatedObjectType = request.query.get("relatedObjectType") || "Project";
    const relatedObjectId = request.query.get("relatedObjectId") || null;

    try {
      const summary = getAuditSummary(tenantId, relatedObjectType, relatedObjectId);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          summary,
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
          error: error?.message || "Audit summary not available.",
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
