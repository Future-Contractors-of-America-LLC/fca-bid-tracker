import { app } from "@azure/functions";
import { resolveTenantContextFromRequest } from "./auth-boundary.js";
import { listAuditEvents, getWorkflowSummary } from "./workflow-store.js";

app.http("workflow-audit", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "workflow-audit",
  handler: async (request) => {
    const tenantContext = resolveTenantContextFromRequest(request, {
      allowSeededFallback: true,
    });
    const tenantId = tenantContext.tenantId;
    const projectId = request.query.get("projectId") || null;
    const eventType = request.query.get("eventType") || null;
    const actorType = request.query.get("actorType") || null;
    const q = request.query.get("q") || null;
    const items = listAuditEvents(tenantId, { projectId, eventType, actorType, q });

    return {
      status: 200,
      jsonBody: {
        ok: true,
        items,
        count: items.length,
        projectId,
        filters: { eventType, actorType, q },
        summary: getWorkflowSummary(tenantId),
        authContext: {
          authenticated: tenantContext.authenticated,
          source: tenantContext.source,
          usedFallback: tenantContext.usedFallback,
        },
        backingSource: "api-workflow-store",
      },
    };
  },
});
