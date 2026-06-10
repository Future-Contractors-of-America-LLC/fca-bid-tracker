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
    const items = listAuditEvents(tenantId);

    return {
      status: 200,
      jsonBody: {
        ok: true,
        items,
        count: items.length,
        summary: getWorkflowSummary(tenantId),
        backingSource: "api-workflow-store",
      },
    };
  },
});
