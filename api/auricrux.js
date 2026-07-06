const CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  "https://api.futurecontractorsofamerica.com/api";
const {
  isSafeModeEnabled,
  buildStaticAuricruxPayload,
  buildStaticTrainingPayload,
} = require("./_lib/runtime/cteSafeModeStore");
const {
  corsHeaders,
  isCteShadowRequest,
  buildCteMockAuricruxPayload,
} = require("./_lib/runtime/cteShadowEnvironment");
const {
  buildSecureProxyHeaders,
  enforceSecurityHardening,
} = require("./_lib/runtime/securityHardeningControls");

const secureCorsHeaders = buildSecureProxyHeaders(corsHeaders);

function respond(status, body) {
  return {
    status,
    headers: secureCorsHeaders,
    body,
  };
}

async function readCentralResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: text };
  }
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = respond(204, "");
    return;
  }

  if (req.method !== "GET" && req.method !== "POST") {
    context.res = respond(405, { ok: false, error: "Method not allowed" });
    return;
  }

  const security = enforceSecurityHardening(req, {
    resourcePath: "/auricrux",
    body: req.body || {},
    operation: "auricrux-message",
  });
  if (!security.allowed) {
    context.res = {
      ...security.response,
      headers: buildSecureProxyHeaders({ ...corsHeaders, ...(security.response.headers || {}) }),
    };
    return;
  }

  if (isCteShadowRequest(req)) {
    context.res = respond(200, buildCteMockAuricruxPayload(req, req.body || {}, "/auricrux"));
    return;
  }

  if (isSafeModeEnabled()) {
    try {
      const query = req.query || {};
      if (req.method === "GET" && String(query.scope || "") === "training") {
        context.res = respond(200, buildStaticTrainingPayload());
        return;
      }

      const body = req.body || {};
      context.res = respond(
        200,
        buildStaticAuricruxPayload({
          message: body.message || "",
          route: body.route || "/portal/platform",
          context: body.context || {},
        }),
      );
      return;
    } catch (error) {
      context.log.error("Safe-mode auricrux provider failed:", error);
      context.res = respond(500, {
        ok: false,
        error: error.message || "Safe-mode provider failure",
      });
      return;
    }
  }

  try {
    const query = req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    const target = `${CENTRAL_API}/auricrux${query}`;
    const init = {
      method: req.method,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    };

    if (req.method === "POST") {
      init.body = JSON.stringify(req.body || {});
    }

    const response = await fetch(target, init);
    const payload = await readCentralResponse(response);
    context.res = respond(response.status, payload);
  } catch (error) {
    context.log.error("Central auricrux proxy failed:", error);
    context.res = respond(502, {
      ok: false,
      error: error.message || "Auricrux proxy failure",
    });
  }
};
