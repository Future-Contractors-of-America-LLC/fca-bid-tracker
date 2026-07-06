import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { proxyCentralRequest } from "./central-proxy.js";
import { normalizeContractEnvelope } from "./_lib/contractEnvelope.js";

function ensureContractEnvelope(response) {
  const normalized = normalizeContractEnvelope(response);
  const contractEnvelope = {
    status: normalized.status,
    ok: normalized.jsonBody?.ok ?? (normalized.status >= 200 && normalized.status < 400),
    error: normalized.jsonBody?.error ?? null,
  };
  return {
    ...normalized,
    jsonBody: {
      ...(normalized.jsonBody || {}),
      ...contractEnvelope,
    },
  };
}

app.http("estimates", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "estimates",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;
    const upstream = await proxyCentralRequest(request, "/estimates");
    return withSessionRefresh(ensureContractEnvelope(upstream), auth);
  },
});
