module.exports = async function (context, req) {
  const json = (status, body) => {
    context.res = {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body,
    };
  };

  try {
    const { readSessionTokenFromCookieHeader, validateSessionToken } = await import("../auth-boundary.js");
    const { getAcademySnapshot, mutateAcademy } = await import("../academy-store.js");
    const { getAcademyProgramDetail } = await import("../academy-program-modules.js");

    const cookieHeader = req.headers?.cookie || "";
    const token = readSessionTokenFromCookieHeader(cookieHeader);
    const session = validateSessionToken(token);
    const tenantId = session?.customerId || "TEN-FCA-001";

    if (req.method === "GET") {
      const programKey = req.query?.programKey;
      if (programKey) {
        const detail = getAcademyProgramDetail(programKey);
        if (!detail) {
          json(404, { ok: false, error: `Program not found: ${programKey}` });
          return;
        }
        json(200, { ok: true, ...detail, backingSource: "api-academy-program-modules" });
        return;
      }

      const snapshot = getAcademySnapshot(tenantId);
      json(200, { ok: true, ...snapshot, backingSource: "api-academy-store" });
      return;
    }

    if (req.method === "PATCH") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      try {
        const snapshot = mutateAcademy(tenantId, body.action, body);
        json(200, { ok: true, ...snapshot, backingSource: "api-academy-store" });
      } catch (error) {
        json(400, { ok: false, error: error?.message || "Academy LMS mutation failed." });
      }
      return;
    }

    json(405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    json(500, { ok: false, error: error?.message || "Academy LMS handler failed." });
  }
};
