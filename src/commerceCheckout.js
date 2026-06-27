import { pricingTiers } from "./websiteShell.js";
import { pricingPlanCatalog } from "./pricingPlans.js";

/** Amounts aligned with auricrux-central/core/fca_payment_intake.py WORKSPACE_PLANS / ACADEMY_OFFERS. */
export const CHECKOUT_AMOUNT_CATALOG = {
  workspace: {
    startup: { amount: 99, billingModel: "monthly" },
    pilot: { amount: 2500, billingModel: "one-time" },
    team: { amount: 499, billingModel: "monthly" },
    operations: { amount: 899, billingModel: "monthly" },
    growth: { amount: 1500, billingModel: "monthly" },
    enterprise: { amount: 3500, billingModel: "monthly" },
  },
};

/** Lane retail prices — mirror auricrux-central/core/academy_commerce.py LANE_BASE_PRICES. */
export const ACADEMY_LANE_PRICES = {
  apprenticeship: 99,
  certification: 99,
  degree: 59,
  licensure: 179,
  professional: 49,
  "fca-how-to": 29,
};

const TRADE_PREFIXES = [
  "electrical", "plumbing", "hvac", "carpentry", "masonry",
  "welding", "pipefitting", "sheet-metal", "fire-sprinkler",
];

export function inferAcademyLane(programKey = "") {
  const key = String(programKey || "").toLowerCase();
  if (key.startsWith("deg-")) return "degree";
  if (key.startsWith("cert-")) return "certification";
  if (key.startsWith("lic-")) return "licensure";
  if (TRADE_PREFIXES.some((prefix) => key.startsWith(`${prefix}-`))) return "apprenticeship";
  return "professional";
}

export function resolveAcademyCourseAmount(programKey, retailPrice) {
  if (retailPrice != null && retailPrice !== "") return Number(retailPrice);
  const lane = inferAcademyLane(programKey);
  return ACADEMY_LANE_PRICES[lane] ?? 79;
}

export function formatCheckoutAmount(amount, billingModel = "one-time") {
  const value = Number(amount);
  if (!Number.isFinite(value)) return String(amount || "");
  const formatted = value % 1 === 0 ? value.toLocaleString("en-US") : value.toFixed(2);
  return billingModel === "monthly" ? `$${formatted}/mo` : `$${formatted} one-time`;
}

export function parseCheckoutAmountLabel(label = "") {
  const match = String(label).replace(/,/g, "").match(/\$?\s*([\d.]+)/);
  return match ? Number(match[1]) : null;
}

function humanizeKey(key = "") {
  return key
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function checkoutHref({ plan, program, pathway, email, ref } = {}) {
  const params = new URLSearchParams();
  if (plan) params.set("plan", plan);
  if (program) params.set("program", program);
  if (pathway) params.set("pathway", pathway);
  if (email) params.set("email", email);
  if (ref) params.set("ref", ref);
  const query = params.toString();
  return query ? `/checkout?${query}` : "/checkout";
}

export function workspaceCheckoutHref(planKey, options = {}) {
  const params = new URLSearchParams({ plan: planKey });
  if (options.email) params.set("email", options.email);
  if (options.ref) params.set("ref", options.ref);
  if (options.cancelled) params.set("cancelled", "1");
  return `/checkout?${params.toString()}`;
}

export function academyCheckoutHref({ programKey, pathwayKey, email, ref } = {}) {
  return checkoutHref({
    program: programKey,
    pathway: pathwayKey,
    email,
    ref,
  });
}

export function findWorkspaceTier(planKey) {
  return pricingTiers.find((tier) => tier.planKey === planKey) || null;
}

export function resolveWorkspaceOffer(planKey) {
  const tier = findWorkspaceTier(planKey);
  const preset = pricingPlanCatalog[planKey];
  const catalog = CHECKOUT_AMOUNT_CATALOG.workspace[planKey];
  if (!tier && !preset && !catalog) return null;

  const billingModel = catalog?.billingModel || preset?.billingModel || (tier?.price?.includes("one-time") ? "one-time" : "monthly");
  const amount = catalog?.amount ?? parseCheckoutAmountLabel(tier?.price || preset?.price);
  const priceLabel = amount != null ? formatCheckoutAmount(amount, billingModel) : tier?.price || preset?.price || "Contact for pricing";

  return {
    kind: "workspace",
    key: planKey,
    name: tier?.name || preset?.name || humanizeKey(planKey),
    priceLabel,
    amount,
    billingModel,
    summary: tier?.detail || `FCA ${humanizeKey(planKey)} rollout package.`,
    includes: tier?.includes || [],
    products: tier?.products || [],
    comms: tier?.comms || [],
    academyAccess: tier?.academyAccess || "",
    auricruxRole: tier?.auricruxRole || "",
    bestFor: tier?.bestFor || "",
  };
}

export function resolveAcademyOffer({ programKey, pathwayKey, retailPrice, title } = {}) {
  if (pathwayKey) {
    const amount = retailPrice != null ? Number(retailPrice) : null;
    return {
      kind: "academy-pathway",
      key: pathwayKey,
      name: title || humanizeKey(pathwayKey),
      priceLabel: amount != null ? formatCheckoutAmount(amount, "one-time") : "Pathway bundle",
      amount,
      billingModel: "one-time",
      summary: `Full FCA Academy pathway: ${humanizeKey(pathwayKey)}.`,
      includes: [
        "Structured credential pathway",
        "Portal-connected learning continuity",
        "Auricrux-guided progression support",
      ],
    };
  }

  if (programKey) {
    const amount = resolveAcademyCourseAmount(programKey, retailPrice);
    return {
      kind: "academy-course",
      key: programKey,
      name: title || humanizeKey(programKey),
      priceLabel: formatCheckoutAmount(amount, "one-time"),
      amount,
      billingModel: "one-time",
      summary: `FCA Academy course: ${humanizeKey(programKey)}.`,
      includes: [
        "Self-paced or cohort-aligned modules",
        "Workspace-linked lab surfaces",
        "Credential progress tracking",
      ],
    };
  }

  return null;
}

export function resolveCheckoutOffer(searchParams) {
  if (!(searchParams instanceof URLSearchParams)) {
    return resolveCheckoutOffer(new URLSearchParams(searchParams || ""));
  }

  const plan = searchParams.get("plan");
  const program = searchParams.get("program");
  const pathway = searchParams.get("pathway");

  if (plan) return resolveWorkspaceOffer(plan);
  if (program || pathway) return resolveAcademyOffer({ programKey: program, pathwayKey: pathway });
  return null;
}

export function checkoutSuccessHref(offer, sessionId) {
  const params = new URLSearchParams();
  if (offer?.kind === "workspace") params.set("plan", offer.key);
  if (offer?.kind === "academy-course") params.set("program", offer.key);
  if (offer?.kind === "academy-pathway") params.set("pathway", offer.key);
  if (sessionId) params.set("session_id", sessionId);
  const query = params.toString();
  return query ? `/checkout/success?${query}` : "/checkout/success";
}

export function checkoutCancelHref(offer) {
  if (!offer) return "/pricing";
  if (offer.kind === "workspace") {
    return workspaceCheckoutHref(offer.key, { cancelled: "1" });
  }
  const params = new URLSearchParams();
  if (offer.kind === "academy-course") params.set("program", offer.key);
  if (offer.kind === "academy-pathway") params.set("pathway", offer.key);
  params.set("cancelled", "1");
  return `/checkout?${params.toString()}`;
}
