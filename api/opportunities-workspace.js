import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("opportunities-workspace", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "opportunities/{opportunityId}/workspace",
  handler: async (request, context) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;

    const opportunityId = context?.triggerMetadata?.opportunityId || request.params?.opportunityId;
    const resourcePath = opportunityId
      ? `/opportunities/${encodeURIComponent(opportunityId)}/workspace`
      : "/opportunities/workspace";
    return withSessionRefresh(await proxyCentralRequest(request, resourcePath), auth);
  },
});
