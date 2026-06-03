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
  contact: {
    label: "Open Contact & Rollout",
    href: "/contact",
    variant: "light",
  },
  walkthrough: {
    label: "Schedule a Walkthrough",
    href: "mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Walkthrough%20Request",
    variant: "light",
  },
  bidEntry: {
    label: "Open Bid Entry",
    href: "/bid-entry/",
    variant: "secondary",
  },
  bidStatus: {
    label: "Open Bid Status",
    href: "/bid-status/",
    variant: "light",
  },
  academyContinuity: {
    label: "Academy Continuity",
    href: "/portal/academy",
    variant: "light",
  },
  messages: {
    label: "Open Messages",
    href: "/portal/messages",
    variant: "primary",
  },
  billing: {
    label: "Open Billing",
    href: "/portal/billing",
    variant: "light",
  },
  projects: {
    label: "Open Project Flow",
    href: "/portal/projects",
    variant: "light",
  },
  files: {
    label: "Open Files",
    href: "/portal/files",
    variant: "light",
  },
  legacyIntake: {
    label: "Legacy intake route",
    href: "/fca-customer-entry/index.html",
    variant: "light",
  },
  legacyStatus: {
    label: "Legacy status route",
    href: "/fca-customer-status/index.html",
    variant: "light",
  },
};

export const publicFallbackCtaCards = [
  {
    title: "Return Home",
    detail: "Go back to the FCA public shell and restart from the main guided entry point.",
    href: "/",
    label: "Return Home",
  },
  {
    title: publicActionCatalog.workspace.label,
    detail: "Move directly into the FCA workspace entry flow instead of stopping at an invalid route.",
    href: publicActionCatalog.workspace.href,
    label: publicActionCatalog.workspace.label,
  },
  {
    title: publicActionCatalog.platformOverview.label,
    detail: "Use the platform route to continue through the supported product shell and customer journey.",
    href: publicActionCatalog.platformOverview.href,
    label: publicActionCatalog.platformOverview.label,
  },
  {
    title: publicActionCatalog.portal.label,
    detail: "Jump into the portal shell if you were trying to reach a workspace surface.",
    href: publicActionCatalog.portal.href,
    label: publicActionCatalog.portal.label,
  },
];

export const auricruxWalkthroughPath = [
  {
    step: 1,
    href: publicActionCatalog.platformOverview.href,
    label: publicActionCatalog.platformOverview.label,
  },
  {
    step: 2,
    href: publicActionCatalog.workspace.href,
    label: publicActionCatalog.workspace.label,
  },
  {
    step: 3,
    href: publicActionCatalog.platform.href,
    label: publicActionCatalog.platform.label,
  },
  {
    step: 4,
    href: publicActionCatalog.portal.href,
    label: publicActionCatalog.portal.label,
  },
  {
    step: 5,
    href: publicActionCatalog.academy.href,
    label: publicActionCatalog.academy.label,
  },
];

export const platformJourneyPath = [
  {
    step: 1,
    prefix: "Start on the public home page and review the",
    href: publicActionCatalog.platformOverview.href,
    label: publicActionCatalog.platformOverview.label,
    suffix: ".",
  },
  {
    step: 2,
    prefix: "Enter through",
    href: publicActionCatalog.workspace.href,
    label: "workspace login",
    suffix: ".",
  },
  {
    step: 3,
    prefix: "Open the",
    href: publicActionCatalog.portal.href,
    label: "customer portal",
    suffix: "for visibility into projects, files, and communications.",
  },
  {
    step: 4,
    prefix: "Continue into",
    href: publicActionCatalog.academyContinuity.href,
    label: "academy continuity",
    suffix: "for onboarding and workforce readiness.",
  },
  {
    step: 5,
    prefix: "Use the",
    href: publicActionCatalog.platform.href,
    label: "platform dashboard",
    suffix: "to summarize tenant, project, support, and admin state in one view.",
  },
];

export const platformLinkedProductAreas = [
  publicActionCatalog.portal,
  publicActionCatalog.platform,
  publicActionCatalog.academy,
  publicActionCatalog.bidEntry,
  publicActionCatalog.bidStatus,
];

export const portalNarrativeCtaSets = {
  bidSalesNarrative: [
    publicActionCatalog.messages,
    publicActionCatalog.billing,
  ],
  supportContext: [
    publicActionCatalog.messages,
    publicActionCatalog.billing,
  ],
  messageStream: [
    publicActionCatalog.billing,
    publicActionCatalog.academy,
    publicActionCatalog.contact,
  ],
  billingNarrative: [
    { ...publicActionCatalog.academy, variant: "primary" },
    publicActionCatalog.pricing,
    publicActionCatalog.contact,
  ],
};

export const academyCtaSets = {
  continuityActions: [
    { ...publicActionCatalog.academyContinuity, label: "Open Academy", variant: "primary" },
    publicActionCatalog.pricing,
  ],
  connectedPortalRoutes: [
    publicActionCatalog.projects,
    publicActionCatalog.files,
    publicActionCatalog.messages,
    publicActionCatalog.billing,
  ],
  productionClose: [
    { ...publicActionCatalog.contact, variant: "primary" },
  ],
};

export const homeCtaSets = {
  bidProduct: [
    { ...publicActionCatalog.bidEntry, variant: "primary" },
    publicActionCatalog.bidStatus,
  ],
  legacyCompatibility: [
    publicActionCatalog.legacyIntake,
    publicActionCatalog.legacyStatus,
  ],
};

export const portalShellCtas = {
  headerSecondary: {
    href: publicActionCatalog.academy.href,
    label: "Academy Workspace",
  },
  executiveSignal: {
    href: "/portal/bids",
    label: "Advance approval path",
  },
  journeyBanner: {
    href: publicActionCatalog.projects.href,
    label: "View Project Flow",
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

export const publicSurfaceLinks = [
  {
    key: "platform",
    title: "Platform Overview",
    detail: "See how FCA keeps bids, project visibility, communication, and training connected in one operating system.",
    href: "/platform",
    ctaLabel: "Platform Overview",
  },
  {
    key: "auricrux",
    title: "Auricrux Guidance",
    detail: "See how the operating layer keeps next steps, customer visibility, and execution continuity clear.",
    href: "/auricrux",
    ctaLabel: "Meet Auricrux",
  },
  {
    key: "portal",
    title: "Customer Portal",
    detail: "Projects, files, notifications, billing follow-through, and customer-facing visibility.",
    href: "/portal",
    ctaLabel: "Open Portal Workspace",
  },
  {
    key: "academy",
    title: "FCA Academy",
    detail: "Training pathways, certification progress, and workforce readiness tied to the same customer journey.",
    href: "/academy",
    ctaLabel: "Open Academy",
  },
  {
    key: "pricing",
    title: "Plans & Rollout",
    detail: "Move from interest into rollout planning, guided setup, and next implementation steps.",
    href: "/pricing",
    ctaLabel: "Plans & Rollout",
  },
  {
    key: "contact",
    title: "Contact & Rollout",
    detail: "Start a walkthrough, pilot discussion, or rollout review from the same connected shell.",
    href: "/contact",
    ctaLabel: "Open Contact & Rollout",
  },
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
  { label: publicActionCatalog.legacyIntake.label, href: publicActionCatalog.legacyIntake.href },
  { label: publicActionCatalog.legacyStatus.label, href: publicActionCatalog.legacyStatus.href },
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
  platformHero: [
    { ...publicActionCatalog.workspace, variant: "primary" },
    { ...publicActionCatalog.platform, variant: "secondary" },
    publicActionCatalog.portal,
  ],
  auricruxHero: [
    { ...publicActionCatalog.platform, variant: "primary" },
    publicActionCatalog.portal,
    publicActionCatalog.pricing,
  ],
  pricingHero: [
    { ...publicActionCatalog.contact, variant: "primary" },
    publicActionCatalog.platform,
    { ...publicActionCatalog.workspace, variant: "light" },
  ],
  pricingImmediate: [
    { ...publicActionCatalog.contact, variant: "primary" },
    publicActionCatalog.platform,
    publicActionCatalog.portal,
  ],
  contactHero: [
    { ...publicActionCatalog.platform, variant: "primary" },
    publicActionCatalog.workspace,
    publicActionCatalog.walkthrough,
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
  portalEntry: [
    { ...publicActionCatalog.platform, variant: "primary" },
    publicActionCatalog.portal,
    publicActionCatalog.academy,
  ],
  portalCoordination: [
    { ...publicActionCatalog.platform, variant: "primary" },
    publicActionCatalog.portal,
    publicActionCatalog.contact,
  ],
  academyEntry: [
    { ...publicActionCatalog.portal, variant: "primary" },
    publicActionCatalog.platform,
    publicActionCatalog.contact,
  ],
};
