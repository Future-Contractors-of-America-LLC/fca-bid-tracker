const CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  "https://api.futurecontractorsofamerica.com/api";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

function respond(status, body) {
  return {
    status,
    headers: corsHeaders,
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
