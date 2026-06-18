import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { listProjects, mutateProject, getWorkflowSummary, ensureWorkflowReady, workflowBackingSource } from "./workflow-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("projects", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "projects",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);
    await ensureWorkflowReady(tenantId);

    if (request.method === "GET") {
      const items = listProjects(tenantId);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          items,
          count: items.length,
          summary: getWorkflowSummary(tenantId),
          backingSource: workflowBackingSource(),
        },
      };
    }

    const body = await request.json().catch(() => ({}));

    try {
      const result = mutateProject(tenantId, body?.action, body);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          ...result,
          backingSource: workflowBackingSource(),
        },
      };
    } catch (error) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: error?.message || "Project mutation failed.",
        },
      };
    }
  },
});
