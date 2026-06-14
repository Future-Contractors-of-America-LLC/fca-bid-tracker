import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { listRemediationLinks } from "./remediation-store.js";
import { getAcademySnapshot } from "./academy-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

function summarizeByStatus(items = []) {
  return items.reduce(
    (acc, item) => {
      const key = item.status || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {},
  );
}

app.http("academy-remediation-summary", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "academy/remediation-summary",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);
    const projectId = request.query.get("projectId") || null;
    const sourceObjectType = request.query.get("sourceObjectType") || null;
    const sourceObjectId = request.query.get("sourceObjectId") || null;

    const remediationItems = listRemediationLinks(tenantId, {
      projectId,
      sourceObjectType,
      sourceObjectId,
      status: null,
    });
    const academySnapshot = getAcademySnapshot(tenantId);

    return {
      status: 200,
      jsonBody: {
        ok: true,
        filters: { projectId, sourceObjectType, sourceObjectId },
        remediationCount: remediationItems.length,
        remediationStatusSummary: summarizeByStatus(remediationItems),
        remediationItems,
        academySummary: academySnapshot.summary,
        academyLearners: academySnapshot.learners,
        academyEnrollments: academySnapshot.enrollments,
        academyCertificates: academySnapshot.certificates,
        backingSource: "api-remediation-store+api-academy-store",
      },
    };
  },
});
