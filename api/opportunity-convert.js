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

app.http("opportunity-convert", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "opportunities/{opportunityId}/convert-to-project",
  handler: async (request, context) => {
    const opportunityId = context?.triggerMetadata?.opportunityId || request.params?.opportunityId;
    const resourcePath = opportunityId
      ? `/opportunities/${encodeURIComponent(opportunityId)}/convert-to-project`
      : "/opportunities/convert-to-project";
    const upstream = await proxyCentralRequest(request, resourcePath);
    return ensureContractEnvelope(upstream);
  },
});
