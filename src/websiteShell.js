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
    cta: "mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Walkthrough%20Request",
    label: "Schedule a Walkthrough",
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
  {
    label: "Open FCA Workspace",
    href: "/login",
    variant: "primary",
  },
  {
    label: "Open Platform Dashboard",
    href: "/portal/platform",
    variant: "secondary",
  },
  {
    label: "Schedule a Walkthrough",
    href: "mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Walkthrough%20Request",
    variant: "light",
  },
];

export const publicRouteCtas = {
  public: {
    primaryHref: "/login",
    primaryLabel: "Open FCA Workspace",
    secondaryHref: "/platform",
    secondaryLabel: "Platform Overview",
  },
  platform: {
    primaryHref: "/login",
    primaryLabel: "Open FCA Workspace",
    secondaryHref: "/portal/platform",
    secondaryLabel: "Open Platform Dashboard",
  },
  auricrux: {
    primaryHref: "/portal/platform",
    primaryLabel: "Open Platform Dashboard",
    secondaryHref: "/portal",
    secondaryLabel: "Open Portal Workspace",
  },
  workspace: {
    primaryHref: "/portal",
    primaryLabel: "Open Portal Workspace",
    secondaryHref: "/portal/platform",
    secondaryLabel: "Open Platform Dashboard",
  },
  conversion: {
    primaryHref: "mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Walkthrough%20Request",
    primaryLabel: "Schedule a Walkthrough",
    secondaryHref: "/portal/platform",
    secondaryLabel: "Open Platform Dashboard",
  },
};

export const publicBodyCtaSets = {
  home: [
    { label: "Open FCA Workspace", href: "/login", variant: "primary" },
    { label: "Platform Overview", href: "/platform", variant: "secondary" },
    { label: "Meet Auricrux", href: "/auricrux", variant: "light" },
    { label: "Plans & Rollout", href: "/pricing", variant: "light" },
  ],
  pricingHero: [
    { label: "Schedule a Walkthrough", href: "/contact", variant: "primary" },
    { label: "Open Platform Dashboard", href: "/portal/platform", variant: "secondary" },
    { label: "Open FCA Workspace", href: "/login", variant: "light" },
  ],
  pricingImmediate: [
    { label: "Schedule a Walkthrough", href: "/contact", variant: "primary" },
    { label: "Open Platform Dashboard", href: "/portal/platform", variant: "secondary" },
    { label: "Open Portal Workspace", href: "/portal", variant: "light" },
  ],
  contactImmediate: [
    { label: "Open FCA Workspace", href: "/login", variant: "primary" },
    { label: "Open Platform Dashboard", href: "/portal/platform", variant: "secondary" },
    { label: "Schedule a Walkthrough", href: "mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Walkthrough%20Request", variant: "light" },
  ],
  loginWorkspace: [
    { label: "Open Portal Workspace", href: "/portal", variant: "primary" },
    { label: "Open Platform Dashboard", href: "/portal/platform", variant: "secondary" },
    { label: "Open Academy", href: "/academy", variant: "light" },
  ],
};
