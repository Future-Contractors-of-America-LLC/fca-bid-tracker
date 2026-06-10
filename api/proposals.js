import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { listProposals, mutateProposal } from "./commercial-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("proposals", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "proposals",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);

    if (request.method === "GET") {
      const items = listProposals(tenantId);
      return { status: 200, jsonBody: { ok: true, items, count: items.length, backingSource: "api-commercial-store" } };
    }

    const body = await request.json().catch(() => ({}));
    try {
      const result = mutateProposal(tenantId, body?.action, body);
      return { status: 200, jsonBody: { ok: true, ...result, backingSource: "api-commercial-store" } };
    } catch (error) {
      return { status: 400, jsonBody: { ok: false, error: error?.message || "Proposal mutation failed." } };
    }
  },
});
