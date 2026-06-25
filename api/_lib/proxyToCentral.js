const CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  "https://api.futurecontractorsofamerica.com/api";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

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

function createCentralProxy(resourcePath) {
  return async function centralProxyHandler(context, req) {
    if (req.method === "OPTIONS") {
      context.res = { status: 204, headers: corsHeaders, body: "" };
      return;
    }

    const query = buildQuery(req);
    const target = `${CENTRAL_API}${resourcePath}${query}`;

    try {
      const init = {
        method: req.method || "GET",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      };

      if (req.method && !["GET", "HEAD"].includes(req.method.toUpperCase())) {
        init.body =
          typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
      }

      const response = await fetch(target, init);
      const payload = await readCentralPayload(response);
      context.res = {
        status: response.status,
        headers: corsHeaders,
        body: payload,
      };
    } catch (error) {
      context.log.error(`Central proxy failed for ${resourcePath}:`, error);
      context.res = {
        status: 502,
        headers: corsHeaders,
        body: {
          ok: false,
          error: error.message || `Proxy failure for ${resourcePath}`,
          target,
        },
      };
    }
  };
}

module.exports = {
  CENTRAL_API,
  createCentralProxy,
};
