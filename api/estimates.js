import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { listEstimates, mutateEstimate } from "./commercial-store.js";

app.http("estimates", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "estimates",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;

    const tenantId = auth.tenantId;

    if (request.method === "GET") {
      const items = listEstimates(tenantId);
      return withSessionRefresh(
        { status: 200, jsonBody: { ok: true, items, count: items.length, backingSource: "api-commercial-store" } },
        auth,
      );
    }

    const body = await request.json().catch(() => ({}));
    try {
      const result = mutateEstimate(tenantId, body?.action, body);
      return withSessionRefresh(
        { status: 200, jsonBody: { ok: true, ...result, backingSource: "api-commercial-store" } },
        auth,
      );
    } catch (error) {
      return { status: 400, jsonBody: { ok: false, error: error?.message || "Estimate mutation failed." } };
    }
  },
});
