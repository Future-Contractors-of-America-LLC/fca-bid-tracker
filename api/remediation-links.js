import { app } from "@azure/functions";
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

app.http("remediation-links", {
  methods: ["GET", "POST", "PATCH"],
  authLevel: "anonymous",
  route: "remediation-links",
  handler: async (request) => ensureContractEnvelope(await proxyCentralRequest(request, "/remediation-links")),
});
