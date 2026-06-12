import { app } from "@azure/functions";
import { resolveTenantContextFromRequest } from "./auth-boundary.js";
import { listEstimates, mutateEstimate } from "./commercial-store.js";

app.http("estimates", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "estimates",
  handler: async (request) => {
    const tenantContext = resolveTenantContextFromRequest(request, {
      allowSeededFallback: request.method === "GET",
    });
    const tenantId = tenantContext.tenantId;

    if (request.method === "GET") {
      const items = listEstimates(tenantId);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          items,
          count: items.length,
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
          backingSource: "api-commercial-store",
        },
      };
    }

    if (!tenantContext.authenticated || !tenantContext.tenantId) {
      return {
        status: 401,
        jsonBody: {
          ok: false,
          error: "Authenticated tenant session required for estimate mutations.",
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
        },
      };
    }

    const body = await request.json().catch(() => ({}));
    try {
      const result = mutateEstimate(tenantId, body?.action, body);
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
          backingSource: "api-commercial-store",
        },
      };
    } catch (error) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: error?.message || "Estimate mutation failed.",
          authContext: {
            authenticated: tenantContext.authenticated,
            source: tenantContext.source,
            usedFallback: tenantContext.usedFallback,
          },
        },
      };
    }
  },
});
