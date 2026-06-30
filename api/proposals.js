import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { listProposals, mutateProposal } from "./commercial-store.js";

app.http("proposals", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "proposals",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;

    const tenantId = auth.tenantId;

    if (request.method === "GET") {
      const items = listProposals(tenantId);
      return withSessionRefresh(
        { status: 200, jsonBody: { ok: true, items, count: items.length, backingSource: "api-commercial-store" } },
        auth,
      );
    }

    const body = await request.json().catch(() => ({}));
    try {
      const result = mutateProposal(tenantId, body?.action, body);
      return withSessionRefresh(
        { status: 200, jsonBody: { ok: true, ...result, backingSource: "api-commercial-store" } },
        auth,
      );
    } catch (error) {
      return { status: 400, jsonBody: { ok: false, error: error?.message || "Proposal mutation failed." } };
    }
  },
});
