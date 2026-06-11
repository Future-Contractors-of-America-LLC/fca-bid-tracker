import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { getAuditSummary } from "./workflow-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("audit-events-summary", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "audit-events/summary",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);
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
