const CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  "https://auricrux-central.azurewebsites.net/api";

async function proxyToCentral(method, req) {
  const url = new URL(`${CENTRAL_API}/academy-lms`);
  if (req.method === "GET" && req.query) {
    Object.entries(req.query).forEach(([key, value]) => {
      if (value != null && value !== "") url.searchParams.set(key, String(value));
    });
  }
  const headers = { Accept: "application/json" };
  if (req.headers?.cookie) headers.Cookie = req.headers.cookie;
  const init = { method, headers };
  if (method === "PATCH") {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {});
  }
  const response = await fetch(url.toString(), init);
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { ok: false, error: text || "Invalid central academy-lms response" };
  }
  return { status: response.status, payload };
}

async function handleLocal(context, req, json) {
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
}

module.exports = async function (context, req) {
  const json = (status, body) => {
    context.res = { status, headers: { "Content-Type": "application/json; charset=utf-8" }, body };
  };

  const preferLocal = process.env.FCA_ACADEMY_LMS_LOCAL === "1";

  try {
    if (!preferLocal) {
      try {
        const proxied = await proxyToCentral(req.method, req);
        if (proxied.payload?.ok !== false || proxied.status < 500) {
          json(proxied.status, { ...proxied.payload, backingSource: proxied.payload?.backingSource || "auricrux-central-proxy" });
          return;
        }
        context.log.warn("Central academy-lms returned error; falling back to local store.", proxied.payload?.error);
      } catch (error) {
        context.log.warn("Central academy-lms proxy failed; falling back to local store.", error?.message || error);
      }
    }

    await handleLocal(context, req, json);
  } catch (error) {
    json(500, { ok: false, error: error?.message || "Academy LMS handler failed." });
  }
};
