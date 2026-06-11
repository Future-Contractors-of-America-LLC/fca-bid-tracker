import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { qualifyLead } from "./leads-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("lead-qualify", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "leads/{leadId}/qualify",
  handler: async (request, context) => {
    const tenantId = resolveTenantId(request);
    const leadId = context?.triggerMetadata?.leadId || request.params?.leadId;
    const body = await request.json().catch(() => ({}));

    try {
      const result = qualifyLead(tenantId, leadId, body);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          lead: result.lead,
          opportunity: result.opportunity,
          auditEvents: result.auditEvents,
          backingSource: "api-workflow-store",
        },
      };
    } catch (error) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: error?.message || "Lead qualification failed.",
        },
      };
    }
  },
});
