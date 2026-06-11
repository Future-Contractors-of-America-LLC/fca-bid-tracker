import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { createLead, listLeads } from "./leads-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("leads", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "leads",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);

    if (request.method === "GET") {
      const items = listLeads(tenantId);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          items,
          count: items.length,
          backingSource: "api-workflow-store",
        },
      };
    }

    const body = await request.json().catch(() => ({}));

    try {
      const result = createLead(tenantId, body);
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
          error: error?.message || "Lead creation failed.",
        },
      };
    }
  },
});
