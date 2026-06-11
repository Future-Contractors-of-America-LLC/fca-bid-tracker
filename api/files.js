import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { listFiles, mutateFile, getWorkflowSummary } from "./workflow-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("files", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "files",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);
    const projectId = request.query.get("projectId") || null;

    if (request.method === "GET") {
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
    }

    const body = await request.json().catch(() => ({}));

    try {
      const result = mutateFile(tenantId, body?.action, body);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          ...result,
          backingSource: "api-workflow-store",
        },
      };
    } catch (error) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: error?.message || "File mutation failed.",
        },
      };
    }
  },
});
