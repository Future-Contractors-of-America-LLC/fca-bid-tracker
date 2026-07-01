import { app } from "@azure/functions";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("opportunity-convert", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "opportunities/{opportunityId}/convert-to-project",
  handler: async (request, context) => {
    const opportunityId = context?.triggerMetadata?.opportunityId || request.params?.opportunityId;
    const resourcePath = opportunityId
      ? `/opportunities/${encodeURIComponent(opportunityId)}/convert-to-project`
      : "/opportunities/convert-to-project";
    return proxyCentralRequest(request, resourcePath);
  },
});
