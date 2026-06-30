import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { getFileSummary } from "./workspace-read-models.js";

app.http("files-summary", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "files/summary",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;

    const tenantId = auth.tenantId;
    const ownerObjectType = request.query.get("ownerObjectType") || "Project";
    const ownerObjectId = request.query.get("ownerObjectId") || null;

    try {
      const summary = getFileSummary(tenantId, ownerObjectType, ownerObjectId);
      return withSessionRefresh(
        {
          status: 200,
          jsonBody: {
            ok: true,
            summary,
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
          error: error?.message || "File summary not available.",
        },
      };
    }
  },
});
