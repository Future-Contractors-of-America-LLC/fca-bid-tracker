import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { listJobCosts } from "./finance-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("job-cost", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "job-cost",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);
    const projectId = request.query.get("projectId") || null;
    const items = listJobCosts(tenantId, projectId);
    return {
      status: 200,
      jsonBody: {
        ok: true,
        items,
        count: items.length,
        backingSource: "api-finance-store",
      },
    };
  },
});
