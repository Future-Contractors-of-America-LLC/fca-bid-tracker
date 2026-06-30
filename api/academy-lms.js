import { app } from "@azure/functions";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";
import { getAcademySnapshot, mutateAcademy } from "./academy-store.js";
import { getAcademyProgramDetail } from "./academy-program-modules.js";

app.http("academy-lms", {
  methods: ["GET", "PATCH"],
  authLevel: "anonymous",
  route: "academy-lms",
  handler: async (request) => {
    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;

    const tenantId = auth.tenantId;

    if (request.method === "GET") {
      const programKey = new URL(request.url).searchParams.get("programKey");
      if (programKey) {
        const detail = getAcademyProgramDetail(programKey);
        if (!detail) {
        return withSessionRefresh(
          {
            status: 404,
            jsonBody: { ok: false, error: `Program not found: ${programKey}` },
          },
          auth,
        );
      }
      return withSessionRefresh(
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
          jsonBody: { ok: true, ...detail, backingSource: "api-academy-program-modules" },
        },
        auth,
      );
      }

      const snapshot = getAcademySnapshot(tenantId);
      return withSessionRefresh(
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
          jsonBody: {
            ok: true,
            ...snapshot,
            backingSource: "api-academy-store",
          },
        },
        auth,
      );
    }

    const body = await request.json().catch(() => ({}));

    try {
      const snapshot = mutateAcademy(tenantId, body?.action, body);
      return withSessionRefresh(
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
          jsonBody: {
            ok: true,
            ...snapshot,
            backingSource: "api-academy-store",
          },
        },
        auth,
      );
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
