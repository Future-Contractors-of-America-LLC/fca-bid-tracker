import { app } from "@azure/functions";
import { resolveTenantContextFromRequest } from "./auth-boundary.js";
import { listProposals, mutateProposal } from "./commercial-store.js";

app.http("proposals", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "proposals",
  handler: async (request) => {
    const tenantContext = resolveTenantContextFromRequest(request, {
      allowSeededFallback: request.method === "GET",
    });
    const tenantId = tenantContext.tenantId;

    if (request.method === "GET") {
      const items = listProposals(tenantId);
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
          error: "Authenticated tenant session required for proposal mutations.",
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
      const result = mutateProposal(tenantId, body?.action, body);
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
          error: error?.message || "Proposal mutation failed.",
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
