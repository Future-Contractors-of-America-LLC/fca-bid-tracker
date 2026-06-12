import { app } from "@azure/functions";
import { resolveTenantContextFromRequest } from "./auth-boundary.js";
import { listBids, mutateBid, getWorkflowSummary } from "./workflow-store.js";

app.http("bids", {
  methods: ["GET", "POST", "PATCH"],
  authLevel: "anonymous",
  route: "bids",
  handler: async (request) => {
    const tenantContext = resolveTenantContextFromRequest(request, {
      allowSeededFallback: request.method === "GET",
    });
    const tenantId = tenantContext.tenantId;

    if (request.method === "GET") {
      const items = listBids(tenantId);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          items,
          count: items.length,
          summary: getWorkflowSummary(tenantId),
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
          backingSource: "api-workflow-store",
        },
      };
    }

    if (!tenantContext.authenticated || !tenantContext.tenantId) {
      return {
        status: 401,
        jsonBody: {
          ok: false,
          error: "Authenticated tenant session required for bid mutations.",
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
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
            authContext: {
              authenticated: tenantContext.authenticated,
              source: tenantContext.source,
              usedFallback: tenantContext.usedFallback,
            },
            backingSource: "api-workflow-store",
          },
        };
      } catch (error) {
        return {
          status: 400,
          jsonBody: {
            ok: false,
            error: error?.message || "Bid mutation failed.",
            authContext: {
              authenticated: tenantContext.authenticated,
              source: tenantContext.source,
              usedFallback: tenantContext.usedFallback,
            },
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
        authContext: {
          authenticated: tenantContext.authenticated,
          source: tenantContext.source,
          usedFallback: tenantContext.usedFallback,
        },
        backingSource: "api-workflow-store",
      },
    };
  },
});
