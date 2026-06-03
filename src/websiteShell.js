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
    price: "Founder-guided",
    detail: "Best for early FCA pilot customers who want a live walkthrough, configured shell access, and close execution support.",
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
  "Strengthens founder walkthrough clarity by explaining workflow state",
];

export const contactPaths = [
  {
    title: "Founder Review",
    detail: "Walk through the live FCA workspace and show how FCA can support a contractor from first touch through delivery and training.",
    cta: "mailto:hello@futurecontractorsofamerica.com?subject=Founder%20Review%20Request",
    label: "Request Founder Review",
  },
  {
    title: "Pilot Discussion",
    detail: "Discuss pilot scope, customer fit, and where the current workspace can create immediate value.",
    cta: "mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Pilot%20Discussion",
    label: "Start Pilot Conversation",
  },
  {
    title: "Platform Review",
    detail: "Review portal, bid, academy, and Auricrux operating surfaces for a broader rollout conversation.",
    cta: "mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Platform%20Review",
    label: "Schedule Platform Review",
  },
];

export const shellJourney = [
  { key: "public", label: "Public Entry", href: "/" },
  { key: "platform", label: "Platform Framing", href: "/platform" },
  { key: "workspace", label: "Workspace Login", href: "/login" },
  { key: "portal", label: "Portal Flow", href: "/portal" },
  { key: "academy", label: "Academy Continuity", href: "/academy" },
  { key: "conversion", label: "Founder Review", href: "/contact" },
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
    label: "Start Rollout",
    href: "/contact",
    variant: "primary",
  },
  {
    label: "Open Platform Dashboard",
    href: "/portal/platform",
    variant: "secondary",
  },
  {
    label: "Email FCA",
    href: "mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Production%20Rollout",
    variant: "light",
  },
];
