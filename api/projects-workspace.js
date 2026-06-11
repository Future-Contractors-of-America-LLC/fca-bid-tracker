import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { getProjectWorkspace } from "./workspace-read-models.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("projects-workspace", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "projects/{projectId}/workspace",
  handler: async (request, context) => {
    const tenantId = resolveTenantId(request);
    const projectId = context?.triggerMetadata?.projectId || request.params?.projectId;

    try {
      const item = getProjectWorkspace(tenantId, projectId);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          item,
          backingSource: "api-workflow-store",
        },
      };
    } catch (error) {
      return {
        status: 404,
        jsonBody: {
          ok: false,
          error: error?.message || "Project workspace not found.",
        },
      };
    }
  },
});
