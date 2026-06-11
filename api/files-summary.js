import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { getFileSummary } from "./workspace-read-models.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("files-summary", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "files/summary",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);
    const ownerObjectType = request.query.get("ownerObjectType") || "Project";
    const ownerObjectId = request.query.get("ownerObjectId") || null;

    try {
      const summary = getFileSummary(tenantId, ownerObjectType, ownerObjectId);
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
          error: error?.message || "File summary not available.",
        },
      };
    }
  },
});
