import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { getOpportunityWorkspace } from "./workflow-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("opportunities-workspace", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "opportunities/{opportunityId}/workspace",
  handler: async (request, context) => {
    const tenantId = resolveTenantId(request);
    const opportunityId = context?.triggerMetadata?.opportunityId || request.params?.opportunityId;

    try {
      const item = getOpportunityWorkspace(tenantId, opportunityId);
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
          error: error?.message || "Opportunity workspace not found.",
        },
      };
    }
  },
});
