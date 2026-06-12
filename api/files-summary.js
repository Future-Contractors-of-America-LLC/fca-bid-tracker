import { app } from "@azure/functions";
import { resolveTenantContextFromRequest } from "./auth-boundary.js";
import { getFileSummary } from "./workspace-read-models.js";

app.http("files-summary", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "files/summary",
  handler: async (request) => {
    const tenantContext = resolveTenantContextFromRequest(request, {
      allowSeededFallback: true,
    });
    const tenantId = tenantContext.tenantId;
    const ownerObjectType = request.query.get("ownerObjectType") || "Project";
    const ownerObjectId = request.query.get("ownerObjectId") || null;

    try {
      const summary = getFileSummary(tenantId, ownerObjectType, ownerObjectId);
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
          error: error?.message || "File summary not available.",
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
