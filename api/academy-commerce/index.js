const Stripe = require("stripe");
const {
  createAcademyEmbeddedCheckout,
  publishableKey,
} = require("../_lib/stripeEmbeddedCheckout");

const CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  "https://auricrux-central.azurewebsites.net/api";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

function respond(status, body) {
  return {
    status,
    headers: corsHeaders,
    body,
  };
}

async function proxyToCentral(body) {
  const response = await fetch(`${CENTRAL_API}/academy-commerce`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
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
    const stripe = new Stripe(secretKey);
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
