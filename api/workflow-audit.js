import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { listAuditEvents, getWorkflowSummary } from "./workflow-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("workflow-audit", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "workflow-audit",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);
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
        backingSource: "api-workflow-store",
      },
    };
  },
});
