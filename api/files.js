import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { listFiles, getWorkflowSummary } from "./workflow-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("files", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "files",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);
    const projectId = request.query.get("projectId") || null;
    const items = listFiles(tenantId, { projectId });

    return {
      status: 200,
      jsonBody: {
        ok: true,
        items,
        count: items.length,
        projectId,
        summary: getWorkflowSummary(tenantId),
        backingSource: "api-workflow-store",
      },
    };
  },
});
