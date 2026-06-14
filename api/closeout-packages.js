import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { createCloseoutPackage, listCloseoutPackages, mutateCloseoutPackage } from "./warranty-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("closeout-packages", {
  methods: ["GET", "POST", "PATCH"],
  authLevel: "anonymous",
  route: "closeout-packages",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);

    if (request.method === "GET") {
      const projectId = request.query.get("projectId") || null;
      const items = listCloseoutPackages(tenantId, projectId);
      return { status: 200, jsonBody: { ok: true, items, count: items.length, backingSource: "api-warranty-store" } };
    }

    const body = await request.json().catch(() => ({}));
    try {
      const result = request.method === "POST"
        ? createCloseoutPackage(tenantId, body)
        : mutateCloseoutPackage(tenantId, body?.action, body);
      return { status: 200, jsonBody: { ok: true, ...result, backingSource: "api-warranty-store" } };
    } catch (error) {
      return { status: 400, jsonBody: { ok: false, error: error?.message || "Closeout package request failed." } };
    }
  },
});
