import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { createRemediationLink, listRemediationLinks, mutateRemediationLink } from "./remediation-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("remediation-links", {
  methods: ["GET", "POST", "PATCH"],
  authLevel: "anonymous",
  route: "remediation-links",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);

    if (request.method === "GET") {
      const projectId = request.query.get("projectId") || null;
      const sourceObjectType = request.query.get("sourceObjectType") || null;
      const sourceObjectId = request.query.get("sourceObjectId") || null;
      const status = request.query.get("status") || null;
      const items = listRemediationLinks(tenantId, { projectId, sourceObjectType, sourceObjectId, status });
      return {
        status: 200,
        jsonBody: {
          ok: true,
          items,
          count: items.length,
          backingSource: "api-remediation-store",
        },
      };
    }

    const body = await request.json().catch(() => ({}));

    try {
      if (request.method === "POST") {
        const result = createRemediationLink(tenantId, body);
        return {
          status: 200,
          jsonBody: {
            ok: true,
            ...result,
            backingSource: "api-remediation-store",
          },
        };
      }

      const result = mutateRemediationLink(tenantId, body?.action, body);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          ...result,
          backingSource: "api-remediation-store",
        },
      };
    } catch (error) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: error?.message || "Remediation link request failed.",
        },
      };
    }
  },
});
