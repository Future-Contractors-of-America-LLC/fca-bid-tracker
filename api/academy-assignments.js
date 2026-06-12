import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { getAcademySnapshot, getProjectReadiness } from "./academy-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("academy-assignments", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "academy-assignments",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);
    const projectId = request.query.get("projectId") || null;
    const learnerId = request.query.get("learnerId") || null;
    const snapshot = getAcademySnapshot(tenantId);

    let assignments = snapshot.assignments || [];
    if (projectId) {
      assignments = assignments.filter((item) => item.projectId === projectId);
    }
    if (learnerId) {
      assignments = assignments.filter((item) => item.learnerId === learnerId);
    }

    return {
      status: 200,
      jsonBody: {
        ok: true,
        items: assignments,
        count: assignments.length,
        projectReadiness: projectId ? getProjectReadiness(tenantId, projectId) : null,
        backingSource: "api-academy-store",
      },
    };
  },
});
