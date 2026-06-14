import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { createPayApp, listPayApps, mutatePayApp } from "./finance-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("pay-apps", {
  methods: ["GET", "POST", "PATCH"],
  authLevel: "anonymous",
  route: "pay-apps",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);

    if (request.method === "GET") {
      const projectId = request.query.get("projectId") || null;
      const items = listPayApps(tenantId, projectId);
      return { status: 200, jsonBody: { ok: true, items, count: items.length, backingSource: "api-finance-store" } };
    }

    const body = await request.json().catch(() => ({}));
    try {
      const result = request.method === "POST"
        ? createPayApp(tenantId, body)
        : mutatePayApp(tenantId, body?.action, body);
      return { status: 200, jsonBody: { ok: true, ...result, backingSource: "api-finance-store" } };
    } catch (error) {
      return { status: 400, jsonBody: { ok: false, error: error?.message || "Pay-app request failed." } };
    }
  },
});
