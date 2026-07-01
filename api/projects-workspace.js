import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { proxyCentralRequest } from "./central-proxy.js";

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
    return withSessionRefresh(await proxyCentralRequest(request, resourcePath), auth);
  },
});
