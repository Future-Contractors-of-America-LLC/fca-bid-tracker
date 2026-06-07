export const pricingPlanCatalog = {
  startup: {
    key: "startup",
    name: "Startup Workspace",
    price: "$99/mo",
    billingModel: "monthly",
    enabledProducts: { saas: true, lms: false, auricrux: true },
    enabledComms: { chat: true, sms: false, phone: false, email: true, teams: false, conference: false, lecture: false },
  },
  pilot: {
    key: "pilot",
    name: "Pilot Workspace",
    price: "$2,500 one-time",
    billingModel: "one-time",
    enabledProducts: { saas: true, lms: true, auricrux: true },
    enabledComms: { chat: true, sms: true, phone: false, email: true, teams: false, conference: false, lecture: false },
  },
  team: {
    key: "team",
    name: "Team Workspace",
    price: "$499/mo",
    billingModel: "monthly",
    enabledProducts: { saas: true, lms: false, auricrux: true },
    enabledComms: { chat: true, sms: true, phone: false, email: true, teams: false, conference: false, lecture: false },
  },
  operations: {
    key: "operations",
    name: "Operations Workspace",
    price: "$899/mo",
    billingModel: "monthly",
    enabledProducts: { saas: true, lms: true, auricrux: true },
    enabledComms: { chat: true, sms: true, phone: true, email: true, teams: false, conference: false, lecture: true },
  },
  growth: {
    key: "growth",
    name: "Growth Platform",
    price: "$1,500/mo",
    billingModel: "monthly",
    enabledProducts: { saas: true, lms: true, auricrux: true },
    enabledComms: { chat: true, sms: true, phone: true, email: true, teams: true, conference: false, lecture: true },
  },
  enterprise: {
    key: "enterprise",
    name: "Enterprise Rollout",
    price: "$3,500+/mo",
    billingModel: "monthly",
    enabledProducts: { saas: true, lms: true, auricrux: true },
    enabledComms: { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true },
  },
};

export const pricingPlanOptions = Object.values(pricingPlanCatalog);

export function resolvePlanPreset(planKey = "startup") {
  return pricingPlanCatalog[planKey] || pricingPlanCatalog.startup;
}
