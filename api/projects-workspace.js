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

app.http("projects-workspace", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "projects/{projectId}/workspace",
  handler: async (request, context) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;

    const projectId = context?.triggerMetadata?.projectId || request.params?.projectId;
    const resourcePath = projectId
      ? `/projects/${encodeURIComponent(projectId)}/workspace`
      : "/projects/workspace";
    const upstream = await proxyCentralRequest(request, resourcePath);
    return withSessionRefresh(ensureContractEnvelope(upstream), auth);
  },
});
