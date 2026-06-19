/**
 * SWA-compatible proxy: forwards /api/bids → Auricrux Central /api/bids.
 * Canonical backend is auricrux-central, not this repo.
 */
const CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  "https://auricrux-central.azurewebsites.net/api";

module.exports = async function (context, req) {
  const query = req.query
    ? "?" + new URLSearchParams(req.query).toString()
    : "";
  const target = `${CENTRAL_API}/bids${query}`;

  try {
    const init = {
      method: req.method || "GET",
      headers: { "Content-Type": "application/json" }
    };

    if (req.method === "POST" && req.body) {
      init.body =
        typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(target, init);
    const text = await response.text();
    let body;
    try {
      body = text ? JSON.parse(text) : "";
    } catch {
      body = text;
    }

    context.res = {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body
    };
  } catch (error) {
    context.log.error("Bid proxy error:", error);
    context.res = {
      status: 502,
      headers: { "Content-Type": "application/json" },
      body: {
        error: "Bid proxy failure",
        message: error.message || String(error),
        target
      }
    };
  }
};
