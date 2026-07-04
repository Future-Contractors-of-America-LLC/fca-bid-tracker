const {
  createAcademyEmbeddedCheckout,
  publishableKey,
} = require("../_lib/stripeEmbeddedCheckout");

let Stripe;

function stripeClient(secretKey) {
  if (!Stripe) Stripe = require("stripe");
  return new Stripe(secretKey);
}

const CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  "https://auricrux-central.azurewebsites.net/api";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

function respond(status, body) {
  return {
    status,
    headers: corsHeaders,
    body,
  };
}

function buildQuery(req) {
  if (req.url && req.url.includes("?")) {
    return req.url.slice(req.url.indexOf("?"));
  }
  if (req.query && Object.keys(req.query).length) {
    return `?${new URLSearchParams(req.query).toString()}`;
  }
  return "";
}

async function proxyToCentral(body, options = {}) {
  const method = String(options.method || "POST").toUpperCase();
  const response = await fetch(`${CENTRAL_API}/academy-commerce${options.query || ""}`, {
    method: method === "HEAD" ? "GET" : method,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...(method === "GET" || method === "HEAD" ? {} : { body: JSON.stringify(body) }),
  });
  if (method === "HEAD") return { status: response.status, payload: "" };
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { error: text || "Invalid central academy-commerce response" };
  }
  return { status: response.status, payload };
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = respond(204, "");
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    try {
      const proxied = await proxyToCentral(null, { method: req.method, query: buildQuery(req) });
      context.res = respond(proxied.status, req.method === "HEAD" ? "" : proxied.payload);
      return;
    } catch (error) {
      context.log.error("Central academy-commerce catalog proxy failed:", error);
      context.res = respond(502, {
        ok: false,
        error: error.message || "Academy commerce catalog proxy failure",
      });
      return;
    }
  }

  const body = req.body || {};
  const wantsEmbedded = body.uiMode === "embedded" || body.embedded === true;

  if (!wantsEmbedded) {
    try {
      const proxied = await proxyToCentral(body);
      context.res = respond(proxied.status, proxied.payload);
      return;
    } catch (error) {
      context.log.error("Central academy-commerce proxy failed:", error);
      context.res = respond(502, {
        ok: false,
        error: error.message || "Academy commerce proxy failure",
      });
      return;
    }
  }

  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  if (!secretKey) {
    try {
      const proxied = await proxyToCentral({ ...body, uiMode: "embedded" });
      context.res = respond(proxied.status, proxied.payload);
      return;
    } catch (error) {
      context.res = respond(503, {
        ok: false,
        error: "Stripe is not configured for embedded academy checkout.",
      });
      return;
    }
  }

  try {
    const stripe = stripeClient(secretKey);
    const sessionPayload = await createAcademyEmbeddedCheckout(stripe, body);

    context.res = respond(200, {
      ok: true,
      ...sessionPayload,
      publishableKey: sessionPayload.publishableKey || publishableKey(),
    });
  } catch (error) {
    context.log.error("Embedded academy-commerce error:", error);
    context.res = respond(500, {
      ok: false,
      error: error.message || "Unable to create embedded academy checkout session",
    });
  }
};
