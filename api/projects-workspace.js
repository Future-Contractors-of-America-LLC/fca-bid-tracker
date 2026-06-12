import { app } from "@azure/functions";
import { resolveTenantContextFromRequest } from "./auth-boundary.js";
import { getProjectWorkspace } from "./workspace-read-models.js";

app.http("projects-workspace", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "projects/{projectId}/workspace",
  handler: async (request, context) => {
    const tenantContext = resolveTenantContextFromRequest(request, {
      allowSeededFallback: true,
    });
    const tenantId = tenantContext.tenantId;
    const projectId = context?.triggerMetadata?.projectId || request.params?.projectId;

    try {
      const item = getProjectWorkspace(tenantId, projectId);
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
          error: error?.message || "Project workspace not found.",
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
