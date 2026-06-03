export const publicActionCatalog = {
  workspace: {
    label: "Open FCA Workspace",
    href: "/login",
    variant: "primary",
  },
  platform: {
    label: "Open Platform Dashboard",
    href: "/portal/platform",
    variant: "secondary",
  },
  portal: {
    label: "Open Portal Workspace",
    href: "/portal",
    variant: "light",
  },
  academy: {
    label: "Open Academy",
    href: "/academy",
    variant: "light",
  },
  platformOverview: {
    label: "Platform Overview",
    href: "/platform",
    variant: "secondary",
  },
  auricrux: {
    label: "Meet Auricrux",
    href: "/auricrux",
    variant: "light",
  },
  pricing: {
    label: "Plans & Rollout",
    href: "/pricing",
    variant: "light",
  },
  walkthrough: {
    label: "Schedule a Walkthrough",
    href: "mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Walkthrough%20Request",
    variant: "light",
  },
};

export const platformModules = [
  {
    title: "Lead to Bid",
    detail: "Capture opportunities, structure estimating workflows, and guide approvals with Auricrux visibility.",
  },
  {
    title: "Project Delivery",
    detail: "Carry awarded work into project coordination, documents, billing, and closeout from one workspace.",
  },
  {
    title: "Customer Portal",
    detail: "Give customers live visibility into projects, files, messages, and next actions without disconnected tools.",
  },
  {
    title: "Academy Continuity",
    detail: "Move onboarding and workforce enablement into FCA Academy as part of the same lifecycle.",
  },
];

export const pricingTiers = [
  {
    name: "Pilot Workspace",
    price: "Guided setup",
    detail: "Best for early FCA customers who want a live walkthrough, configured shell access, and close rollout support.",
    includes: [
      "Customer workspace shell",
      "Bid and project flow walkthrough",
      "Auricrux-guided next actions",
      "Academy continuity demo",
    ],
  },
  {
    name: "Growth Platform",
    price: "Custom scope",
    detail: "For contractors who need deeper operational rollout across portal, documents, communications, and training.",
    includes: [
      "Expanded portal modules",
      "Customer communication structure",
      "Billing and account continuity",
      "Training rollout planning",
    ],
  },
  {
    name: "Enterprise Rollout",
    price: "Strategic engagement",
    detail: "For larger organizations adopting FCA as a unified contractor lifecycle operating system.",
    includes: [
      "Multi-team rollout planning",
      "Auricrux operating visibility",
      "Cross-module workflow design",
      "Foundational integration planning",
    ],
  },
];

export const auricruxCapabilities = [
  "Surfaces next actions across customer-facing workflows",
  "Maintains continuity between portal, communications, and academy",
  "Acts as a visible operating layer inside the shell",
  "Explains workflow state so teams always know what should happen next",
];

export const contactPaths = [
  {
    title: "Schedule a Walkthrough",
    detail: "Walk through the live FCA workspace and see how FCA can support your team from first opportunity through delivery and training.",
    cta: publicActionCatalog.walkthrough.href,
    label: publicActionCatalog.walkthrough.label,
  },
  {
    title: "Discuss a Pilot",
    detail: "Talk through pilot scope, team fit, and where the current workspace can create immediate value.",
    cta: "mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Pilot%20Discussion",
    label: "Start Pilot Discussion",
  },
  {
    title: "Review Rollout Options",
    detail: "Review portal, bid, academy, and Auricrux operating surfaces for a broader rollout conversation.",
    cta: "mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Rollout%20Review",
    label: "Review Rollout Options",
  },
];

export const shellJourney = [
  { key: "public", label: "Home", href: "/" },
  { key: "platform", label: "Platform", href: "/platform" },
  { key: "workspace", label: "Workspace", href: "/login" },
  { key: "portal", label: "Portal", href: "/portal" },
  { key: "academy", label: "Academy", href: "/academy" },
  { key: "conversion", label: "Get Started", href: "/contact" },
];

export const shellPrimaryNav = [
  { label: "Home", href: "/", journeyKey: "public" },
  { label: "Platform", href: "/platform", journeyKey: "platform" },
  { label: "Auricrux", href: "/auricrux", journeyKey: "platform" },
  { label: "Pricing", href: "/pricing", journeyKey: "conversion" },
  { label: "Contact", href: "/contact", journeyKey: "conversion" },
  { label: "Login", href: "/login", journeyKey: "workspace" },
  { label: "Portal", href: "/portal", journeyKey: "portal" },
  { label: "Academy", href: "/academy", journeyKey: "academy" },
];

export const shellWorkspaceRoutes = [
  { label: "Enter Workspace", href: "/login" },
  { label: "Unified Platform Dashboard", href: "/portal/platform" },
  { label: "Customer Portal", href: "/portal" },
  { label: "FCA Academy", href: "/academy" },
  { label: "Bid Entry", href: "/bid-entry/" },
  { label: "Bid Status", href: "/bid-status/" },
];

export const shellCompatibilityRoutes = [
  { label: "Legacy intake route", href: "/fca-customer-entry/index.html" },
  { label: "Legacy status route", href: "/fca-customer-status/index.html" },
];

export const shellProductionActions = [
  publicActionCatalog.workspace,
  publicActionCatalog.platform,
  publicActionCatalog.walkthrough,
];

export const publicRouteCtas = {
  public: {
    primaryHref: publicActionCatalog.workspace.href,
    primaryLabel: publicActionCatalog.workspace.label,
    secondaryHref: publicActionCatalog.platformOverview.href,
    secondaryLabel: publicActionCatalog.platformOverview.label,
  },
  platform: {
    primaryHref: publicActionCatalog.workspace.href,
    primaryLabel: publicActionCatalog.workspace.label,
    secondaryHref: publicActionCatalog.platform.href,
    secondaryLabel: publicActionCatalog.platform.label,
  },
  auricrux: {
    primaryHref: publicActionCatalog.platform.href,
    primaryLabel: publicActionCatalog.platform.label,
    secondaryHref: publicActionCatalog.portal.href,
    secondaryLabel: publicActionCatalog.portal.label,
  },
  workspace: {
    primaryHref: publicActionCatalog.portal.href,
    primaryLabel: publicActionCatalog.portal.label,
    secondaryHref: publicActionCatalog.platform.href,
    secondaryLabel: publicActionCatalog.platform.label,
  },
  conversion: {
    primaryHref: publicActionCatalog.walkthrough.href,
    primaryLabel: publicActionCatalog.walkthrough.label,
    secondaryHref: publicActionCatalog.platform.href,
    secondaryLabel: publicActionCatalog.platform.label,
  },
};

export const publicBodyCtaSets = {
  home: [
    publicActionCatalog.workspace,
    publicActionCatalog.platformOverview,
    publicActionCatalog.auricrux,
    publicActionCatalog.pricing,
  ],
  pricingHero: [
    { ...publicActionCatalog.walkthrough, href: "/contact", variant: "primary" },
    publicActionCatalog.platform,
    { ...publicActionCatalog.workspace, variant: "light" },
  ],
  pricingImmediate: [
    { ...publicActionCatalog.walkthrough, href: "/contact", variant: "primary" },
    publicActionCatalog.platform,
    publicActionCatalog.portal,
  ],
  contactImmediate: [
    publicActionCatalog.workspace,
    publicActionCatalog.platform,
    publicActionCatalog.walkthrough,
  ],
  loginWorkspace: [
    { ...publicActionCatalog.portal, variant: "primary" },
    publicActionCatalog.platform,
    publicActionCatalog.academy,
  ],
};
