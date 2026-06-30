import { app } from "@azure/functions";
import { requireAuth } from "./auth-boundary.js";
import { getAuditSummary } from "./workspace-read-models.js";

app.http("audit-events-summary", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "audit-events/summary",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;

    const tenantId = auth.tenantId;
    const relatedObjectType = request.query.get("relatedObjectType") || "Project";
    const relatedObjectId = request.query.get("relatedObjectId") || null;

    try {
      const summary = getAuditSummary(tenantId, relatedObjectType, relatedObjectId);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          summary,
          backingSource: "api-workflow-store",
        },
      };
    } catch (error) {
      return {
        status: 404,
        jsonBody: {
          ok: false,
          error: error?.message || "Audit summary not available.",
        },
      };
    }
  },
});
