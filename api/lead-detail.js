import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { getLead, updateLead } from "./leads-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("lead-detail", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "leads/{leadId}",
  handler: async (request, context) => {
    const tenantId = resolveTenantId(request);
    const leadId = context?.triggerMetadata?.leadId || request.params?.leadId;

    if (request.method === "GET") {
      try {
        const item = getLead(tenantId, leadId);
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
            error: error?.message || "Lead not found.",
          },
        };
      }
    }

    const body = await request.json().catch(() => ({}));

    try {
      const result = updateLead(tenantId, leadId, body);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          item: result.item,
          auditEventId: result.auditEvent.auditEventId,
          backingSource: "api-workflow-store",
        },
      };
    } catch (error) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: error?.message || "Lead update failed.",
        },
      };
    }
  },
});
