const fs = require("fs");
const path = require("path");

const ONE_TIME_WORKSPACE_PLANS = new Set(["pilot"]);

let catalogCache = null;

function loadCatalog() {
  if (catalogCache) return catalogCache;

  const candidates = [
    path.join(__dirname, "../../public/config/stripe-catalog.json"),
    path.join(process.cwd(), "public/config/stripe-catalog.json"),
    path.join(process.cwd(), "dist/config/stripe-catalog.json"),
  ];

  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) {
        catalogCache = JSON.parse(fs.readFileSync(file, "utf8"));
        return catalogCache;
      }
    } catch {
      // try next path
    }
  }

  return null;
}

function envPriceId(key) {
  if (!key) return "";
  const normalized = String(key).toUpperCase().replace(/-/g, "_");
  return process.env[`STRIPE_PRICE_${normalized}`] || "";
}

function resolveWorkspacePriceId(planKey, catalog) {
  return catalog?.workspace?.[planKey]?.priceId || envPriceId(planKey);
}

function resolveAcademyPriceId({ programKey, pathwayKey }, catalog) {
  if (programKey) {
    return catalog?.academyCourses?.[programKey]?.priceId || envPriceId(programKey);
  }
  if (pathwayKey) {
    return catalog?.academyPathways?.[pathwayKey]?.priceId || envPriceId(pathwayKey);
  }
  return "";
}

function workspaceCheckoutMode(planKey) {
  return ONE_TIME_WORKSPACE_PLANS.has(planKey) ? "payment" : "subscription";
}

function publishableKey() {
  return (
    process.env.STRIPE_PUBLISHABLE_KEY ||
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    ""
  );
}

async function createEmbeddedCheckoutSession(stripe, options) {
  const {
    priceId,
    mode,
    email,
    returnUrl,
    clientReferenceId,
    metadata = {},
  } = options;

  if (!priceId) {
    throw new Error("No Stripe price is configured for this offer.");
  }
  if (!returnUrl) {
    throw new Error("returnUrl is required for embedded checkout.");
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    return_url: returnUrl,
    customer_email: email || undefined,
    client_reference_id: clientReferenceId || undefined,
    metadata,
    billing_address_collection: "auto",
  });

  return {
    clientSecret: session.client_secret,
    sessionId: session.id,
    publishableKey: publishableKey(),
    uiMode: "embedded",
  };
}

async function createPlanEmbeddedCheckout(stripe, body) {
  const catalog = loadCatalog();
  const planKey = body.planKey;
  const priceId = resolveWorkspacePriceId(planKey, catalog);
  const mode = workspaceCheckoutMode(planKey);

  return createEmbeddedCheckoutSession(stripe, {
    priceId,
    mode,
    email: body.customerEmail,
    returnUrl: body.returnUrl || body.successUrl,
    clientReferenceId: body.clientReferenceId,
    metadata: {
      offerType: "workspace",
      planKey: planKey || "",
      company: body.company || "",
      contactName: body.contactName || "",
      ...(body.metadata || {}),
    },
  });
}

async function createAcademyEmbeddedCheckout(stripe, body) {
  const catalog = loadCatalog();
  const programKey = body.programKey;
  const pathwayKey = body.pathwayKey;
  const priceId = resolveAcademyPriceId({ programKey, pathwayKey }, catalog);

  return createEmbeddedCheckoutSession(stripe, {
    priceId,
    mode: "payment",
    email: body.buyerEmail || body.customerEmail,
    returnUrl: body.returnUrl || body.successUrl,
    clientReferenceId: body.clientReferenceId,
    metadata: {
      offerType: pathwayKey ? "academy-pathway" : "academy-course",
      programKey: programKey || "",
      pathwayKey: pathwayKey || "",
    },
  });
}

module.exports = {
  loadCatalog,
  publishableKey,
  createPlanEmbeddedCheckout,
  createAcademyEmbeddedCheckout,
};
