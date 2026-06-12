import { app } from "@azure/functions";
import { resolveTenantContextFromRequest } from "./auth-boundary.js";
import { listProjects, mutateProject, getWorkflowSummary } from "./workflow-store.js";

app.http("projects", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "projects",
  handler: async (request) => {
    const tenantContext = resolveTenantContextFromRequest(request, {
      allowSeededFallback: request.method === "GET",
    });

    if (request.method === "GET") {
      const items = listProjects(tenantContext.tenantId);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          items,
          count: items.length,
          summary: getWorkflowSummary(tenantContext.tenantId),
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
          backingSource: "api-workflow-store",
        },
      };
    }

    if (!tenantContext.authenticated || !tenantContext.tenantId) {
      return {
        status: 401,
        jsonBody: {
          ok: false,
          error: "Authenticated tenant session required for project mutations.",
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
      const result = mutateProject(tenantContext.tenantId, body?.action, body);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          ...result,
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
          error: error?.message || "Project mutation failed.",
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
