import { PILOT_CHECKOUT_URL, STARTUP_CHECKOUT_URL } from "./commercialOffers.js";

export const publicActionCatalog = {
  workspace: {
    label: "Open FCA Workspace",
    href: "/login",
    variant: "primary",
  },
  liveTestLogin: {
    label: "Open Live Test Login",
    href: "/login?seeded=1",
    variant: "secondary",
  },
  instantTestWorkspace: {
    label: "Instant Test Workspace",
    href: "/login?seeded=1&autologin=1&next=/portal/platform",
    variant: "secondary",
  },
  platform: {
    label: "Open Platform Dashboard",
    href: "/portal/platform",
    variant: "secondary",
  },
  operations: {
    label: "Open Operations Pipeline",
    href: "/portal/operations",
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
  warranty: {
    label: "Open Warranty Continuity",
    href: "/warranty",
    variant: "light",
  },
  referrals: {
    label: "Open Referral Continuity",
    href: "/referrals",
    variant: "light",
  },
  walkthrough: {
    label: "Schedule a Walkthrough",
    href: "mailto:sales@futurecontractorsofamerica.com?subject=FCA%20Walkthrough%20Request",
    variant: "light",
  },
  bidEntry: {
    label: "Open Bid Entry",
    href: "/bid-entry",
    variant: "secondary",
  },
  bidStatus: {
    label: "Open Bid Status",
    href: "/bid-status",
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
  support: {
    label: "Open Support",
    href: "/portal/support",
    variant: "secondary",
  },
  admin: {
    label: "Open Admin",
    href: "/portal/admin",
    variant: "secondary",
  },
  legacyIntake: {
    label: "Compatibility intake route",
    href: "/fca-customer-entry/index.html",
    variant: "light",
  },
  legacyStatus: {
    label: "Compatibility status route",
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
    title: publicActionCatalog.liveTestLogin.label,
    detail: "Open the real seeded test-account login page with credentials preloaded so public validation starts immediately.",
    href: publicActionCatalog.liveTestLogin.href,
    label: publicActionCatalog.liveTestLogin.label,
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
  { step: 1, href: publicActionCatalog.platformOverview.href, label: publicActionCatalog.platformOverview.label },
  { step: 2, href: publicActionCatalog.workspace.href, label: publicActionCatalog.workspace.label },
  { step: 3, href: publicActionCatalog.platform.href, label: publicActionCatalog.platform.label },
  { step: 4, href: publicActionCatalog.portal.href, label: publicActionCatalog.portal.label },
  { step: 5, href: publicActionCatalog.academy.href, label: publicActionCatalog.academy.label },
];

export const platformJourneyPath = [
  { step: 1, prefix: "Start on the public home page and review the", href: publicActionCatalog.platformOverview.href, label: publicActionCatalog.platformOverview.label, suffix: "." },
  { step: 2, prefix: "Enter through", href: publicActionCatalog.workspace.href, label: "workspace login", suffix: "." },
  { step: 3, prefix: "Open the", href: publicActionCatalog.portal.href, label: "customer portal", suffix: "for visibility into projects, files, RFIs, submittals, and customer communication." },
  { step: 4, prefix: "Continue into", href: publicActionCatalog.academyContinuity.href, label: "academy continuity", suffix: "for onboarding, safety reinforcement, and workforce readiness." },
  { step: 5, prefix: "Use the", href: publicActionCatalog.platform.href, label: "platform dashboard", suffix: "to summarize bid posture, project health, approvals, billing risk, and admin state in one view." },
];

export const platformLinkedProductAreas = [
  publicActionCatalog.portal,
  publicActionCatalog.platform,
  publicActionCatalog.operations,
  publicActionCatalog.academy,
  publicActionCatalog.bidEntry,
  publicActionCatalog.bidStatus,
];

export const portalNarrativeCtaSets = {
  bidSalesNarrative: [publicActionCatalog.messages, publicActionCatalog.billing],
  supportContext: [publicActionCatalog.messages, publicActionCatalog.billing],
  messageStream: [publicActionCatalog.billing, publicActionCatalog.academy, publicActionCatalog.contact],
  billingNarrative: [{ ...publicActionCatalog.academy, variant: "primary" }, publicActionCatalog.pricing, publicActionCatalog.contact],
};

export const academyCtaSets = {
  continuityActions: [{ ...publicActionCatalog.academyContinuity, label: "Open Academy", variant: "primary" }, publicActionCatalog.pricing],
  connectedPortalRoutes: [publicActionCatalog.projects, publicActionCatalog.files, publicActionCatalog.messages, publicActionCatalog.billing],
  productionClose: [{ ...publicActionCatalog.contact, variant: "primary" }],
};

export const homeCtaSets = {
  bidProduct: [{ ...publicActionCatalog.bidEntry, variant: "primary" }, publicActionCatalog.bidStatus],
  compatibilityRoutes: [publicActionCatalog.legacyIntake, publicActionCatalog.legacyStatus],
  testDrive: [
    { ...publicActionCatalog.liveTestLogin, variant: "primary" },
    publicActionCatalog.instantTestWorkspace,
  ],
};

export const portalShellCtas = {
  headerSecondary: { href: publicActionCatalog.academy.href, label: "Academy Workspace" },
  executiveSignal: { href: "/portal/bids", label: "Advance approval path" },
  journeyBanner: { href: publicActionCatalog.projects.href, label: "View Project Flow" },
};

export const portalEntryCtaSets = {
  quickActions: [
    { label: "Open Projects", href: publicActionCatalog.projects.href, variant: "primary" },
    { label: "Review Files", href: publicActionCatalog.files.href, variant: "secondary" },
    { label: "Check Billing", href: publicActionCatalog.billing.href, variant: "secondary" },
    { label: "Open Academy", href: publicActionCatalog.academyContinuity.href, variant: "light" },
  ],
  connectedWorkspaceFlow: [
    { step: 1, prefix: "Start on the public shell and enter through", href: publicActionCatalog.workspace.href, label: "Open FCA Workspace", suffix: "." },
    { step: 3, prefix: "Open", href: publicActionCatalog.projects.href, label: "Projects", suffix: "to show estimating handoff, job execution continuity, and schedule posture." },
    { step: 4, prefix: "Open", href: publicActionCatalog.files.href, label: "Files", suffix: "and", secondaryHref: publicActionCatalog.messages.href, secondaryLabel: "Messages", trailing: "to show drawing packages, submittals, RFIs, and coordination flow." },
    { step: 5, prefix: "Finish in", href: publicActionCatalog.academyContinuity.href, label: "Open Academy", suffix: "to prove workforce onboarding, safety readiness, and training follow-through." },
  ],
};

export const platformDashboardCtaSets = {
  quickActions: [
    { label: publicActionCatalog.portal.label, href: publicActionCatalog.portal.href, variant: "primary" },
    { label: publicActionCatalog.operations.label, href: publicActionCatalog.operations.href, variant: "secondary" },
    { label: publicActionCatalog.support.label, href: publicActionCatalog.support.href, variant: "secondary" },
    { label: publicActionCatalog.admin.label, href: publicActionCatalog.admin.href, variant: "secondary" },
    { label: publicActionCatalog.academy.label, href: publicActionCatalog.academy.href, variant: "light" },
  ],
  operationalCards: [
    { title: "Portal operations", detail: "Project visibility, file control, RFIs, messages, and billing continuity remain attached to one tenant and project spine.", href: publicActionCatalog.portal.href, label: publicActionCatalog.portal.label },
    { title: "Operations pipeline", detail: "Lead intake, qualification, preconstruction, award, document control, closeout, and service continuity are now visible in one contractor pipeline.", href: publicActionCatalog.operations.href, label: publicActionCatalog.operations.label },
    { title: "Academy continuity", detail: "Workforce readiness, learner assignment, and certification visibility now participate in the same shell state.", href: publicActionCatalog.academy.href, label: publicActionCatalog.academy.label },
    { title: "Support posture", detail: "Escalations, continuity recovery, and customer help remain inside the operating shell rather than outside it.", href: publicActionCatalog.support.href, label: publicActionCatalog.support.label },
  ],
};

export const shellHeaderCtaSets = {
  workspace: { primaryHref: publicActionCatalog.portal.href, primaryLabel: publicActionCatalog.portal.label, secondaryHref: publicActionCatalog.platform.href, secondaryLabel: publicActionCatalog.platform.label },
  conversion: { primaryHref: publicActionCatalog.walkthrough.href, primaryLabel: publicActionCatalog.walkthrough.label, secondaryHref: publicActionCatalog.platform.href, secondaryLabel: publicActionCatalog.platform.label },
  academy: { primaryHref: publicActionCatalog.portal.href, primaryLabel: publicActionCatalog.portal.label, secondaryHref: publicActionCatalog.contact.href, secondaryLabel: publicActionCatalog.contact.label },
};

export const executiveSignalCtaSets = {
  publicPlatform: { href: publicActionCatalog.portal.href, label: "Enter customer workspace" },
  publicAuricrux: { href: publicActionCatalog.platform.href, label: publicActionCatalog.platform.label },
  conversion: { href: publicActionCatalog.contact.href, label: publicActionCatalog.contact.label },
  contact: { href: publicActionCatalog.walkthrough.href, label: publicActionCatalog.walkthrough.label },
  academy: { href: publicActionCatalog.messages.href, label: "Preserve follow-through" },
  portal: { href: portalShellCtas.executiveSignal.href, label: portalShellCtas.executiveSignal.label },
};

export const founderJourneyCtaSets = {
  workspace: { href: publicActionCatalog.portal.href, label: publicActionCatalog.portal.label },
  conversion: { href: publicActionCatalog.contact.href, label: publicActionCatalog.contact.label },
  contact: { href: publicActionCatalog.walkthrough.href, label: publicActionCatalog.walkthrough.label },
  publicPlatform: { href: publicActionCatalog.workspace.href, label: "Continue to workspace login" },
  publicAuricrux: { href: publicActionCatalog.platform.href, label: publicActionCatalog.platform.label },
};

export const platformModules = [
  { title: "Lead to Bid", detail: "Capture opportunities, scope notes, estimator handoff, and approval posture before the job is won." },
  { title: "Project Delivery", detail: "Carry awarded work into job execution, document control, customer updates, billing, and closeout from one workspace." },
  { title: "Customer Portal", detail: "Give customers live visibility into projects, files, statuses, messages, and next actions without disconnected tools." },
  { title: "Field & Academy Readiness", detail: "Move onboarding, safety reinforcement, and workforce enablement into FCA Academy as part of the same lifecycle." },
];

export const pricingTiers = [
  {
    planKey: "startup",
    name: "Startup Workspace",
    price: "$99/mo",
    bestFor: "Owner-operator or very small teams moving off spreadsheets",
    auricruxRole: "Auricrux sets next actions and keeps intake-to-bid continuity visible.",
    academyAccess: "Academy Foundations + onboarding checkpoints",
    detail: "Low-friction entry for contractors who need real workflow control from lead intake through bid clarity without heavy overhead.",
    products: ["SaaS workspace", "Portal lite", "Auricrux guidance", "Academy foundations"],
    comms: ["Chat", "Email"],
    ctaHref: STARTUP_CHECKOUT_URL || "/login",
    ctaLabel: STARTUP_CHECKOUT_URL ? "Buy Startup — $99/mo" : "Start Startup Workspace",
    checkoutUrl: STARTUP_CHECKOUT_URL || null,
    includes: [
      "1 active workspace",
      "Lead and bid intake continuity",
      "Core project and file visibility",
      "Customer portal-lite visibility",
      "Academy foundations onboarding lane",
      "Auricrux daily next-action guidance",
    ],
  },
  {
    planKey: "starter-team",
    name: "Starter Team Workspace",
    price: "$249/mo",
    bestFor: "Small teams needing stronger handoffs across precon and customer updates",
    auricruxRole: "Auricrux drives bid, file, and communication follow-through.",
    academyAccess: "Academy Foundations + Qualification + Estimate modules",
    detail: "Bridges the gap between entry and full team rollout with stronger communication continuity and estimate readiness support.",
    products: ["SaaS workspace", "Customer portal", "Auricrux guidance", "Academy classroom access"],
    comms: ["Chat", "Email", "SMS"],
    ctaHref: "/contact",
    ctaLabel: "Choose Starter Team",
    includes: [
      "Up to 3 team seats",
      "Qualification and estimate continuity",
      "Shared file and task visibility",
      "Branded customer communication updates",
      "Academy learning path assignments",
      "Auricrux guided blocker recovery",
    ],
  },
  {
    planKey: "pilot",
    name: "Pilot Workspace",
    price: "$2,500 one-time",
    bestFor: "Teams that want guided launch, configuration, and adoption",
    auricruxRole: "Auricrux orchestrates rollout sequencing and adoption checkpoints.",
    academyAccess: "Academy launch classrooms + operator enablement",
    detail: "One-time guided activation package to implement FCA with real team setup, workflow wiring, and launch support.",
    products: ["Guided SaaS launch", "Portal activation", "Academy launch path", "Auricrux rollout guidance"],
    comms: ["Chat", "Email", "SMS", "Phone"],
    ctaHref: PILOT_CHECKOUT_URL,
    ctaLabel: "Buy Pilot — $2,500",
    checkoutUrl: PILOT_CHECKOUT_URL,
    includes: [
      "Structured implementation kickoff",
      "Workflow and role setup support",
      "Initial academy enablement plan",
      "Customer communication templates and routing",
      "Launch checkpoint review with next-action map",
      "Go-live readiness and handoff package",
    ],
  },
  {
    planKey: "team",
    name: "Team Workspace",
    price: "$499/mo",
    bestFor: "Active delivery teams with recurring estimating and execution flow",
    auricruxRole: "Auricrux continuously aligns bid, project, and customer-state transitions.",
    academyAccess: "Academy role-based tracks + weekly progression checks",
    detail: "Operational daily-driver tier for teams that need stronger internal coordination and customer-facing continuity.",
    products: ["SaaS workspace", "Customer portal", "Auricrux guidance", "Academy role tracks"],
    comms: ["Chat", "Email", "SMS"],
    ctaHref: "/contact",
    ctaLabel: "Choose Team Workspace",
    includes: [
      "Up to 5 active team seats",
      "Bid-to-project continuity",
      "Task and communication tracking",
      "Billing visibility and follow-through",
      "Role-based Academy assignments",
      "Auricrux operational recommendations",
    ],
  },
  {
    planKey: "operations",
    name: "Operations Workspace",
    price: "$899/mo",
    bestFor: "Mid-size contractor operations with higher coordination load",
    auricruxRole: "Auricrux monitors cross-team continuity and escalates high-risk blockers.",
    academyAccess: "Academy command-track curriculum + credential progression",
    detail: "Expands visibility and execution control across projects, support, billing, and workforce readiness.",
    products: ["SaaS workspace", "Customer portal", "Academy/LMS", "Auricrux guidance"],
    comms: ["Chat", "SMS", "Phone", "Email"],
    ctaHref: "/contact",
    ctaLabel: "Plan Operations Workspace",
    includes: [
      "Up to 12 active team seats",
      "Expanded project and operations control",
      "Support and billing continuity surfaces",
      "Academy credential and compliance tracking",
      "Communication routing across key channels",
      "Monthly operating review with Auricrux",
    ],
  },
  {
    planKey: "growth",
    name: "Growth Platform",
    price: "$1,500/mo",
    bestFor: "Growing teams expanding volume, complexity, and workforce scale",
    auricruxRole: "Auricrux drives growth-stage sequencing across operations, training, and retention lanes.",
    academyAccess: "Academy full operator tracks + leadership pathways",
    detail: "Growth-stage operating tier with broader communication lanes, stronger governance posture, and deeper academy integration.",
    products: ["SaaS workspace", "Customer portal", "Academy/LMS", "Auricrux guidance"],
    comms: ["Chat", "SMS", "Phone", "Email", "Teams"],
    ctaHref: "/contact",
    ctaLabel: "Plan Growth Rollout",
    includes: [
      "Up to 20 active team seats",
      "Cross-project continuity and milestone control",
      "Advanced communications and escalation posture",
      "Leadership and workforce Academy pathways",
      "Recurring-service and retention continuity support",
      "Growth optimization reviews",
    ],
  },
  {
    planKey: "scale",
    name: "Scale Operations Platform",
    price: "$2,400/mo",
    bestFor: "Multi-crew organizations preparing for enterprise standardization",
    auricruxRole: "Auricrux governs multi-workflow alignment and high-impact decision pathways.",
    academyAccess: "Academy multi-role governance, credential, and audit tracks",
    detail: "Narrows the step between growth and enterprise with stronger governance, deeper enablement, and broader comms orchestration.",
    products: ["SaaS workspace", "Customer portal", "Academy/LMS", "Auricrux advanced control layer"],
    comms: ["Chat", "SMS", "Phone", "Email", "Teams", "Conference"],
    ctaHref: "/contact",
    ctaLabel: "Plan Scale Operations",
    includes: [
      "Up to 35 active team seats",
      "Advanced route and workflow governance",
      "Multi-team support and billing continuity",
      "Academy governance + readiness dashboards",
      "Conference-ready training and rollout lanes",
      "Quarterly architecture alignment review",
    ],
  },
  {
    planKey: "enterprise",
    name: "Enterprise Rollout",
    price: "$3,500+/mo",
    bestFor: "Large organizations deploying FCA as their operating standard",
    auricruxRole: "Auricrux acts as executive operating intelligence across the full lifecycle.",
    academyAccess: "Academy enterprise command curriculum + organization-wide enablement",
    detail: "Enterprise-grade deployment path for multi-business-unit operations requiring unified control, continuity, and workforce transformation.",
    products: ["SaaS workspace", "Customer portal", "Academy/LMS", "Auricrux executive layer"],
    comms: ["Chat", "SMS", "Phone", "Email", "Teams", "Conference", "Lecture"],
    ctaHref: "/contact",
    ctaLabel: "Request Enterprise Rollout",
    includes: [
      "Multi-division rollout planning",
      "Executive communications orchestration",
      "Enterprise Academy enablement and adoption",
      "Governance and compliance visibility",
      "Strategic implementation sequencing",
      "Long-range optimization partnership",
    ],
  },
];

export const auricruxCapabilities = [
  "Surfaces next actions across estimating, delivery, and customer-facing workflows",
  "Maintains continuity between portal operations, communication, and academy readiness",
  "Acts as a visible operating layer inside the shell",
  "Explains blockers so teams know what should happen next before delay risk grows",
];

export const publicSurfaceLinks = [
  { key: "platform", title: "Platform Overview", detail: "See how FCA keeps bids, project visibility, communication, field documentation, and training connected in one operating system.", href: "/platform", ctaLabel: "Platform Overview" },
  { key: "auricrux", title: "Auricrux Guidance", detail: "See how the operating layer keeps next steps, customer visibility, and execution continuity clear.", href: "/auricrux", ctaLabel: "Meet Auricrux" },
  { key: "portal", title: "Customer Portal", detail: "Projects, files, notifications, billing follow-through, and customer-facing visibility.", href: "/portal", ctaLabel: "Open Portal Workspace" },
  { key: "operations", title: "Operations Pipeline", detail: "See the contractor execution stages from intake through warranty as one usable SaaS pathway.", href: "/portal/operations", ctaLabel: "Open Operations Pipeline" },
  { key: "academy", title: "FCA Academy", detail: "Training pathways, certification progress, safety reinforcement, and workforce readiness tied to the same customer journey.", href: "/academy", ctaLabel: "Open Academy" },
  { key: "warranty", title: "Warranty Continuity", detail: "Post-handover service, support posture, maintenance continuity, and recurring customer retention flow.", href: "/warranty", ctaLabel: "Open Warranty Continuity" },
  { key: "referrals", title: "Referral Continuity", detail: "Turn finished work into reviews, customer advocacy, and guided new-opportunity motion.", href: "/referrals", ctaLabel: "Open Referral Continuity" },
  { key: "pricing", title: "Plans & Rollout", detail: "Move from interest into rollout planning, guided setup, and next implementation steps.", href: "/pricing", ctaLabel: "Plans & Rollout" },
  { key: "contact", title: "Contact & Rollout", detail: "Start a walkthrough, pilot discussion, or rollout review from the same connected shell.", href: "/contact", ctaLabel: "Open Contact & Rollout" },
];

export const contactPaths = [
  { title: "Schedule a Walkthrough", detail: "Walk through the live FCA workspace and see how FCA can support your team from first opportunity through bid handoff, project delivery, customer visibility, training, communications routing, warranty continuity, and referral growth.", cta: publicActionCatalog.walkthrough.href, label: publicActionCatalog.walkthrough.label },
  { title: "Discuss Startup through Operations Plans", detail: "Talk through startup fit and team growth needs across Startup, Starter Team, Pilot, Team, and Operations paths with concrete products, comms lanes, and Academy depth.", cta: "mailto:info@futurecontractorsofamerica.com?subject=FCA%20Startup%20through%20Operations%20Plan%20Discussion", label: "Discuss Startup through Operations" },
  { title: "Review Growth, Scale, or Enterprise Rollout", detail: "Review Growth Platform, Scale Operations Platform, and Enterprise Rollout sequencing with Auricrux governance and Academy transformation in scope.", cta: "mailto:sales@futurecontractorsofamerica.com?subject=FCA%20Growth%20Scale%20or%20Enterprise%20Rollout", label: "Review Growth / Scale / Enterprise" },
];

export const shellJourney = [
  { key: "public", label: "Home", href: "/" },
  { key: "platform", label: "Platform", href: "/platform" },
  { key: "auricrux", label: "Auricrux", href: "/auricrux" },
  { key: "pricing", label: "Pricing", href: "/pricing" },
  { key: "warranty", label: "Warranty", href: "/warranty" },
  { key: "referrals", label: "Referrals", href: "/referrals" },
  { key: "workspace", label: "Workspace", href: "/login" },
  { key: "portal", label: "Portal", href: "/portal" },
  { key: "academy", label: "Academy", href: "/academy" },
  { key: "conversion", label: "Get Started", href: "/contact" },
];

export const shellPrimaryNav = [
  { label: "Home", href: "/", journeyKey: "public" },
  { label: "Platform", href: "/platform", journeyKey: "platform" },
  { label: "Auricrux", href: "/auricrux", journeyKey: "platform" },
  { label: "Warranty", href: "/warranty", journeyKey: "conversion", action: publicActionCatalog.warranty },
  { label: "Referrals", href: "/referrals", journeyKey: "conversion", action: publicActionCatalog.referrals },
  { label: "Pricing", href: "/pricing", journeyKey: "conversion" },
  { label: "Contact", href: "/contact", journeyKey: "conversion" },
  { label: "Login", href: "/login", journeyKey: "workspace" },
  { label: "Portal", href: "/portal", journeyKey: "portal" },
  { label: "Academy", href: "/academy", journeyKey: "academy" },
];

export const shellWorkspaceRoutes = [
  { label: "Enter Workspace", href: "/login" },
  { label: "Live Test Login", href: "/login?seeded=1" },
  { label: "Instant Test Workspace", href: "/login?seeded=1&autologin=1&next=/portal/platform" },
  { label: "Unified Platform Dashboard", href: "/portal/platform" },
  { label: "Operations Pipeline", href: "/portal/operations" },
  { label: "Customer Portal", href: "/portal" },
  { label: "FCA Academy", href: "/academy" },
  { label: "Bid Entry", href: "/bid-entry" },
  { label: "Bid Status", href: "/bid-status" },
];

export const shellCompatibilityRoutes = [
  { label: publicActionCatalog.legacyIntake.label, href: publicActionCatalog.legacyIntake.href },
  { label: publicActionCatalog.legacyStatus.label, href: publicActionCatalog.legacyStatus.href },
];

export const shellProductionActions = [publicActionCatalog.workspace, publicActionCatalog.liveTestLogin, publicActionCatalog.platform, publicActionCatalog.walkthrough];

export const publicRouteCtas = {
  public: { primaryHref: publicActionCatalog.liveTestLogin.href, primaryLabel: publicActionCatalog.liveTestLogin.label, secondaryHref: publicActionCatalog.instantTestWorkspace.href, secondaryLabel: publicActionCatalog.instantTestWorkspace.label },
  platform: { primaryHref: publicActionCatalog.liveTestLogin.href, primaryLabel: publicActionCatalog.liveTestLogin.label, secondaryHref: publicActionCatalog.instantTestWorkspace.href, secondaryLabel: publicActionCatalog.instantTestWorkspace.label },
  auricrux: { primaryHref: publicActionCatalog.platform.href, primaryLabel: publicActionCatalog.platform.label, secondaryHref: publicActionCatalog.portal.href, secondaryLabel: publicActionCatalog.portal.label },
  workspace: { primaryHref: publicActionCatalog.portal.href, primaryLabel: publicActionCatalog.portal.label, secondaryHref: publicActionCatalog.platform.href, secondaryLabel: publicActionCatalog.platform.label },
  conversion: { primaryHref: publicActionCatalog.walkthrough.href, primaryLabel: publicActionCatalog.walkthrough.label, secondaryHref: publicActionCatalog.platform.href, secondaryLabel: publicActionCatalog.platform.label },
};

export const publicBodyCtaSets = {
  home: [publicActionCatalog.liveTestLogin, publicActionCatalog.instantTestWorkspace, publicActionCatalog.platformOverview, publicActionCatalog.pricing],
  platformHero: [{ ...publicActionCatalog.liveTestLogin, variant: "primary" }, { ...publicActionCatalog.instantTestWorkspace, variant: "secondary" }, publicActionCatalog.portal],
  auricruxHero: [{ ...publicActionCatalog.platform, variant: "primary" }, publicActionCatalog.portal, publicActionCatalog.pricing],
  pricingHero: [{ ...publicActionCatalog.contact, variant: "primary" }, publicActionCatalog.platform, { ...publicActionCatalog.workspace, variant: "light" }],
  pricingImmediate: [{ ...publicActionCatalog.contact, variant: "primary" }, publicActionCatalog.platform, publicActionCatalog.portal],
  contactHero: [{ ...publicActionCatalog.platform, variant: "primary" }, publicActionCatalog.workspace, publicActionCatalog.walkthrough],
  contactImmediate: [publicActionCatalog.workspace, publicActionCatalog.platform, publicActionCatalog.walkthrough],
  loginWorkspace: [{ ...publicActionCatalog.portal, variant: "primary" }, publicActionCatalog.platform, publicActionCatalog.academy],
  portalEntry: [{ ...publicActionCatalog.platform, variant: "primary" }, publicActionCatalog.operations, publicActionCatalog.portal, publicActionCatalog.academy],
  portalCoordination: [{ ...publicActionCatalog.platform, variant: "primary" }, publicActionCatalog.portal, publicActionCatalog.contact],
  academyEntry: [{ ...publicActionCatalog.portal, variant: "primary" }, publicActionCatalog.platform, publicActionCatalog.contact],
};
