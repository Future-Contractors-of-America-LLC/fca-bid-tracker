const {
  createPlanEmbeddedCheckout,
  publishableKey,
} = require("../_lib/stripeEmbeddedCheckout");
const {
  corsHeaders,
  isCteShadowRequest,
  buildCteMockPaymentPayload,
} = require("../_lib/runtime/cteShadowEnvironment");
const {
  buildSecureProxyHeaders,
  enforceSecurityHardening,
} = require("../_lib/runtime/securityHardeningControls");

const secureCorsHeaders = buildSecureProxyHeaders(corsHeaders);

const CENTRAL_API =
  process.env.AURICRUX_CENTRAL_API ||
  "https://auricrux-central.azurewebsites.net/api";

function respond(status, body) {
  return {
    status,
    headers: secureCorsHeaders,
    body,
  };
}

async function proxyToCentral(body) {
  const response = await fetch(`${CENTRAL_API}/stripe-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { error: text || "Invalid central checkout response" };
  }
  return { status: response.status, payload };
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    context.res = respond(204, "");
    return;
  }

  const body = req.body || {};

  const security = enforceSecurityHardening(req, {
    resourcePath: "/stripe-checkout",
    body,
    allowAnonymous: true,
    operation: "payment-checkout",
  });
  if (!security.allowed) {
    context.res = {
      ...security.response,
      headers: buildSecureProxyHeaders({ ...corsHeaders, ...(security.response.headers || {}) }),
    };
    return;
  }

  if (isCteShadowRequest(req)) {
    context.res = respond(200, buildCteMockPaymentPayload(req, body));
    return;
  }

  const wantsEmbedded = body.uiMode === "embedded" || body.embedded === true;

  if (!wantsEmbedded) {
    try {
      const proxied = await proxyToCentral(body);
      context.res = respond(proxied.status, proxied.payload);
      return;
    } catch (error) {
      context.log.error("Central stripe-checkout proxy failed:", error);
      context.res = respond(502, {
        ok: false,
        error: error.message || "Checkout proxy failure",
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
        error: "Stripe is not configured for embedded checkout.",
      });
      return;
    }
  }

  try {
    const Stripe = require("stripe");
    const stripe = new Stripe(secretKey);
    let sessionPayload;

    if (body.action === "plan" || body.planKey) {
      sessionPayload = await createPlanEmbeddedCheckout(stripe, body);
    } else {
      context.res = respond(400, {
        ok: false,
        error: "Unsupported embedded checkout action.",
      });
      return;
    }

    context.res = respond(200, {
      ok: true,
      ...sessionPayload,
      publishableKey: sessionPayload.publishableKey || publishableKey(),
    });
  } catch (error) {
    context.log.error("Embedded stripe-checkout error:", error);
    context.res = respond(500, {
      ok: false,
      error: error.message || "Unable to create embedded checkout session",
    });
  }
};
