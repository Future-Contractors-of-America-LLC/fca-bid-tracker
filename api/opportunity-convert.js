import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { convertOpportunityToProject } from "./leads-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("opportunity-convert", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "opportunities/{opportunityId}/convert-to-project",
  handler: async (request, context) => {
    const tenantId = resolveTenantId(request);
    const opportunityId = context?.triggerMetadata?.opportunityId || request.params?.opportunityId;
    const body = await request.json().catch(() => ({}));

    try {
      const result = convertOpportunityToProject(tenantId, opportunityId, body);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          item: result.item,
          auditEvents: result.auditEvents,
          backingSource: "api-workflow-store",
        },
      };
    } catch (error) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: error?.message || "Opportunity conversion failed.",
        },
      };
    }
  },
});
