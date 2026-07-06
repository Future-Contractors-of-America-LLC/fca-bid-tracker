const CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  "https://api.futurecontractorsofamerica.com/api";
const {
  isCteShadowRequest,
  buildCteShadowResponse,
} = require("./runtime/cteShadowEnvironment");
const {
  buildSecureProxyHeaders,
  enforceSecurityHardening,
} = require("./runtime/securityHardeningControls");

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, x-fca-route, x-fca-customer-id, x-fca-tenant-id, x-fca-user-id, x-fca-user-role, x-fca-shadow-mode, x-fca-minor-privacy-mode, x-fca-auricrux-mode, x-fca-continuous-auth, x-fca-auth-issued-at, x-fca-access-token-expires-at, x-fca-source-environment, x-fca-target-environment, x-fca-auth-provider, x-fca-service-auth, x-fca-agent, x-fca-service-account, x-fca-service-role, x-fca-service-scope, x-fca-auricrux-prompt, x-fca-auricrux-context, x-fca-auricrux-action",
};
const secureCorsHeaders = buildSecureProxyHeaders(corsHeaders);

function buildQuery(req) {
  if (req.url && req.url.includes("?")) {
    return req.url.slice(req.url.indexOf("?"));
  }
  if (req.query && Object.keys(req.query).length) {
    return `?${new URLSearchParams(req.query).toString()}`;
  }
  return "";
}

async function readCentralPayload(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: text };
  }
}

async function runCentralProxy(context, req, resourcePath) {
  if (req.method === "OPTIONS") {
    context.res = { status: 204, headers: secureCorsHeaders, body: "" };
    return;
  }

  const security = enforceSecurityHardening(req, {
    resourcePath,
    body: req.body || {},
    operation: "central-proxy",
  });
  if (!security.allowed) {
    context.res = {
      ...security.response,
      headers: buildSecureProxyHeaders({ ...corsHeaders, ...(security.response.headers || {}) }),
    };
    return;
  }

  if (isCteShadowRequest(req)) {
    context.res = buildCteShadowResponse(req, resourcePath, req.body || {});
    context.res.headers = buildSecureProxyHeaders({ ...corsHeaders, ...(context.res.headers || {}) });
    return;
  }

  const query = buildQuery(req);
  const target = `${CENTRAL_API}${resourcePath}${query}`;
  const requestMethod = String(req.method || "GET").toUpperCase();
  const upstreamMethod = requestMethod === "HEAD" ? "GET" : requestMethod;

  try {
    const init = {
      method: upstreamMethod,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    };

    if (!["GET", "HEAD"].includes(requestMethod)) {
      init.body =
        typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    }

    const response = await fetch(target, init);
    const payload = requestMethod === "HEAD" ? "" : await readCentralPayload(response);
    context.res = {
      status: response.status,
      headers: secureCorsHeaders,
      body: payload,
    };
  } catch (error) {
    context.log.error(`Central proxy failed for ${resourcePath}:`, error);
    context.res = {
      status: 502,
      headers: secureCorsHeaders,
      body: {
        ok: false,
        error: error.message || `Proxy failure for ${resourcePath}`,
        target,
      },
    };
  }
}

function resolveRequestPath(req) {
  const raw = req.url || "";
  const pathname = raw.startsWith("http") ? new URL(raw).pathname : raw.split("?")[0];
  return pathname.replace(/^\/api/i, "") || "/";
}

function createCentralProxy(resourcePath) {
  return (context, req) => runCentralProxy(context, req, resourcePath);
}

function createCentralPathProxy() {
  return (context, req) => runCentralProxy(context, req, resolveRequestPath(req));
}

module.exports = {
  CENTRAL_API,
  createCentralProxy,
  createCentralPathProxy,
};
