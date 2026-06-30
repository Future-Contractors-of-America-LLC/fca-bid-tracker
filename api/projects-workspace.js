import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { getProjectWorkspace } from "./workspace-read-models.js";

app.http("projects-workspace", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "projects/{projectId}/workspace",
  handler: async (request, context) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;

    const tenantId = auth.tenantId;
    const projectId = context?.triggerMetadata?.projectId || request.params?.projectId;

    try {
      const item = getProjectWorkspace(tenantId, projectId);
      return withSessionRefresh(
        {
          status: 200,
          jsonBody: {
            ok: true,
            item,
            backingSource: "api-workflow-store",
          },
        },
        auth,
      );
    } catch (error) {
      return {
        status: 404,
        jsonBody: {
          ok: false,
          error: error?.message || "Project workspace not found.",
        },
      };
    }
  },
});
