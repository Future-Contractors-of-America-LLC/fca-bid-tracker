import { app } from "@azure/functions";
import { readSessionTokenFromCookieHeader, validateSessionToken } from "./auth-boundary.js";
import { getAcademySnapshot, mutateAcademy } from "./academy-store.js";

function resolveTenantId(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);
  return session?.customerId || "TEN-FCA-001";
}

app.http("academy-lms", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "academy-lms",
  handler: async (request) => {
    const tenantId = resolveTenantId(request);

    if (request.method === "GET") {
      const snapshot = getAcademySnapshot(tenantId);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          ...snapshot,
          backingSource: "api-academy-store",
        },
      };
    }

    const body = await request.json().catch(() => ({}));

    try {
      const snapshot = mutateAcademy(tenantId, body?.action, body);
      return {
        status: 200,
        jsonBody: {
          ok: true,
          ...snapshot,
          backingSource: "api-academy-store",
        },
      };
    } catch (error) {
      return {
        status: 400,
        jsonBody: {
          ok: false,
          error: error?.message || "Academy LMS mutation failed.",
        },
      };
    }
  },
});
