import { pricingTiers } from "./websiteShell.js";
import { pricingPlanCatalog } from "./pricingPlans.js";

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
  if (!tier && !preset) return null;

  return {
    kind: "workspace",
    key: planKey,
    name: tier?.name || preset?.name || humanizeKey(planKey),
    priceLabel: tier?.price || preset?.price || "Contact for pricing",
    billingModel: preset?.billingModel || (tier?.price?.includes("one-time") ? "one-time" : "monthly"),
    summary: tier?.detail || `FCA ${humanizeKey(planKey)} rollout package.`,
    includes: tier?.includes || [],
    products: tier?.products || [],
    comms: tier?.comms || [],
    academyAccess: tier?.academyAccess || "",
    auricruxRole: tier?.auricruxRole || "",
    bestFor: tier?.bestFor || "",
  };
}

export function resolveAcademyOffer({ programKey, pathwayKey } = {}) {
  if (pathwayKey) {
    return {
      kind: "academy-pathway",
      key: pathwayKey,
      name: humanizeKey(pathwayKey),
      priceLabel: "Program pathway",
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
    return {
      kind: "academy-course",
      key: programKey,
      name: humanizeKey(programKey),
      priceLabel: "Course enrollment",
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
