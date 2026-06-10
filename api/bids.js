import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { listBids, mutateBid, getWorkflowSummary } from "./workflow-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("bids", {
  methods: ["GET", "POST", "PATCH"],
  authLevel: "anonymous",
  route: "bids",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);

    if (request.method === "GET") {
      const items = listBids(tenantId);
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
    }

    const body = await request.json().catch(() => ({}));

    if (request.method === "PATCH") {
      try {
        const result = mutateBid(tenantId, body?.action, body);
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
            error: error?.message || "Bid mutation failed.",
          },
        };
      }
    }

    const submissionId = body?.submissionId || body?.id || `bid-${Date.now()}`;
    return {
      status: 200,
      jsonBody: {
        ok: true,
        accepted: true,
        submissionId,
        message: "Bid submission accepted",
        backingSource: "api-workflow-store",
      },
    };
  },
});
