/**
 * Canonical FCA construction OS capability map.
 * Rule: if any construction product / AI / software can do it beneficially, FCA claims it here,
 * routes the customer to the live surface, and marks Auricrux automatable.
 *
 * depth:
 *  - live: real workspace surface
 *  - guided: API/tool surface that Auricrux can operate/teach now
 *  - expanding: visible + openable; depth still growing (never hidden)
 */

export const CAPABILITY_DOMAINS = [
  { id: "win-work", label: "Win work", summary: "Leads, prequal, estimating, bidding, proposals." },
  { id: "design-plans", label: "Design, plans & BIM", summary: "Plan rooms, markups, takeoff, immersive/VR review." },
  { id: "deliver", label: "Deliver the job", summary: "Scheduling, field, RFIs, COs, punch, closeout." },
  { id: "money", label: "Money & risk", summary: "Job cost, finance, billing, legal, warranty." },
  { id: "documents", label: "Documents & evidence", summary: "Files, formats, SharePoint, audit trail." },
  { id: "workforce", label: "Workforce & CTE", summary: "Academy, credentials, CTE, operator guides." },
  { id: "comms", label: "Communications", summary: "Messages, notifications, customer portal, support." },
  { id: "operate", label: "Operate & customize", summary: "Profile, branding, admin, Auricrux OS layer." },
];

/** @type {Array<{
 *  id: string,
 *  domain: string,
 *  label: string,
 *  customerPromise: string,
 *  href: string,
 *  depth: 'live'|'guided'|'expanding',
 *  formats?: string[],
 *  competitorsCovered?: string[],
 *  auricrux: { teach: boolean, automate: boolean, advise: boolean },
 *  automations?: string[],
 * }>} */
export const CAPABILITIES = [
  // ——— Win work ———
  {
    id: "leads-crm",
    domain: "win-work",
    label: "Leads & contractor CRM",
    customerPromise: "Capture, qualify, and advance every lead without a separate CRM.",
    href: "/portal/leads",
    depth: "live",
    competitorsCovered: ["JobNimbus", "HubSpot lite", "ServiceTitan CRM"],
    auricrux: { teach: true, automate: true, advise: true },
    automations: ["Qualify lead", "Route owner", "Draft follow-up"],
  },
  {
    id: "commercial-pipeline",
    domain: "win-work",
    label: "Commercial pipeline (bid → bill)",
    customerPromise: "One guided spine from opportunity through invoice.",
    href: "/portal/pipeline",
    depth: "live",
    competitorsCovered: ["Procore Bidding", "BuildingConnected"],
    auricrux: { teach: true, automate: true, advise: true },
    automations: ["Advance stage", "Blocker check", "Handoff summary"],
  },
  {
    id: "bids",
    domain: "win-work",
    label: "Bid board & qualification",
    customerPromise: "Track invitations, qualify risk, and convert wins to projects.",
    href: "/portal/bids",
    depth: "live",
    competitorsCovered: ["BuildingConnected", "BidClerk workflows"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "estimating",
    domain: "win-work",
    label: "Estimating & pricing studio",
    customerPromise: "Build estimates, review pricing, and package for proposal.",
    href: "/portal/estimates",
    depth: "live",
    formats: ["CSV", "XLSX import/export", "PDF proposal pack"],
    competitorsCovered: ["STACK", "PlanSwift", "Excel estimating"],
    auricrux: { teach: true, automate: true, advise: true },
    automations: ["Seed line items", "Risk flagging", "Margin check"],
  },
  {
    id: "takeoff",
    domain: "win-work",
    label: "Digital takeoff (from plans)",
    customerPromise: "Measure from plan sheets and feed estimating without leaving FCA.",
    href: "/portal/design",
    depth: "live",
    formats: ["PDF sheets", "image plan packs"],
    competitorsCovered: ["Bluebeam takeoff", "PlanSwift"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "proposals",
    domain: "win-work",
    label: "Customer proposals",
    customerPromise: "Ship customer-ready proposals from estimate context.",
    href: "/portal/proposals",
    depth: "live",
    formats: ["PDF"],
    competitorsCovered: ["PandaDoc construction", "Proposal software"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "prequal",
    domain: "win-work",
    label: "Prequalification & capacity",
    customerPromise: "Collect licenses, insurance, and capacity signals before you bid.",
    href: "/portal/legal",
    depth: "guided",
    competitorsCovered: ["Highwire", "ISNetworld lite"],
    auricrux: { teach: true, automate: true, advise: true },
  },

  // ——— Design / plans / BIM ———
  {
    id: "plan-room",
    domain: "design-plans",
    label: "Plan room",
    customerPromise: "Store, version, and brief plan sets for every job.",
    href: "/portal/plans",
    depth: "live",
    formats: ["PDF", "PNG/JPG sheets", "SharePoint sync"],
    competitorsCovered: ["Procore Documents", "PlanGrid"],
    auricrux: { teach: true, automate: true, advise: true },
    automations: ["Plan briefing", "Version note", "Open in design"],
  },
  {
    id: "design-markups",
    domain: "design-plans",
    label: "Design workspace & markups",
    customerPromise: "Sheets, redlines, annotations, and design continuity.",
    href: "/portal/design",
    depth: "live",
    formats: ["PDF", "markup overlays"],
    competitorsCovered: ["Bluebeam Revu", "Autodesk Docs"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "bim-viewer",
    domain: "design-plans",
    label: "BIM / model review",
    customerPromise: "Review models and coordinate design intent beside the job spine.",
    href: "/portal/design",
    depth: "expanding",
    formats: ["IFC", "RVT (via export/PDF)", "NWD/NWC via published views"],
    competitorsCovered: ["BIM 360", "Navisworks review"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "immersive-vr",
    domain: "design-plans",
    label: "Immersive / VR field overlay",
    customerPromise: "WebXR and simulation labs for field overlay and owner walkthroughs.",
    href: "/portal/immersive",
    depth: "live",
    competitorsCovered: ["XR construction walkthrough tools"],
    auricrux: { teach: true, automate: true, advise: true },
  },

  // ——— Deliver ———
  {
    id: "projects",
    domain: "deliver",
    label: "Project / job execution",
    customerPromise: "Stage-tracked jobs with ownership and next actions.",
    href: "/portal/projects",
    depth: "live",
    competitorsCovered: ["Procore Project Management", "Buildertrend"],
    auricrux: { teach: true, automate: true, advise: true },
    automations: ["Project setup", "Stage advance", "Owner report"],
  },
  {
    id: "scheduling",
    domain: "deliver",
    label: "Scheduling & look-ahead",
    customerPromise: "Mobilization, milestones, and crew calendar continuity.",
    href: "/portal/scheduling",
    depth: "guided",
    formats: ["ICS export path", "CSV"],
    competitorsCovered: ["MS Project lite", "Primavera handoff via CSV"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "field-tasks",
    domain: "deliver",
    label: "Field tasks",
    customerPromise: "Assign and track field work visible to the customer workspace.",
    href: "/portal/field-tasks",
    depth: "guided",
    competitorsCovered: ["Fieldwire tasks"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "field-supervision",
    domain: "deliver",
    label: "Field supervision (photos & redlines)",
    customerPromise: "Site photos, plan compare, annotations, and redline proof.",
    href: "/portal/field-supervision",
    depth: "live",
    formats: ["JPG/PNG", "photo evidence packs"],
    competitorsCovered: ["CompanyCam", "Fieldwire"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "rfis",
    domain: "deliver",
    label: "RFIs",
    customerPromise: "Requests for information tied to sheets and field conditions.",
    href: "/portal/rfis",
    depth: "guided",
    competitorsCovered: ["Procore RFI"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "change-orders",
    domain: "deliver",
    label: "Change orders",
    customerPromise: "Scope, price, and approve changes without email chaos.",
    href: "/portal/change-orders",
    depth: "guided",
    competitorsCovered: ["Procore Change Events"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "submittals",
    domain: "deliver",
    label: "Submittals & shop drawings",
    customerPromise: "Track submittal packages and approvals inside document control.",
    href: "/portal/files",
    depth: "expanding",
    formats: ["PDF", "DWG attachments"],
    competitorsCovered: ["Procore Submittals"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "daily-logs",
    domain: "deliver",
    label: "Daily logs & weather",
    customerPromise: "Capture what happened on site as governed evidence.",
    href: "/portal/field-tasks",
    depth: "expanding",
    competitorsCovered: ["Procore Daily Log"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "punch",
    domain: "deliver",
    label: "Punch lists",
    customerPromise: "Create, assign, and close punch items with photo proof.",
    href: "/portal/punch",
    depth: "guided",
    competitorsCovered: ["Procore Punch", "Fieldwire Punch"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "closeout",
    domain: "deliver",
    label: "Closeout & turnover",
    customerPromise: "Turnover binders, artifact tracking, and handoff readiness.",
    href: "/portal/closeout",
    depth: "guided",
    formats: ["PDF binders", "ZIP evidence packs"],
    competitorsCovered: ["Procore Closeout"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "safety",
    domain: "deliver",
    label: "Safety, OSHA & incidents",
    customerPromise: "Safety documentation, incident continuity, and Academy OSHA prep.",
    href: "/academy/catalog?pathway=certification",
    depth: "expanding",
    competitorsCovered: ["SafetyCulture", "OSHA training LMS"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "qa-qc",
    domain: "deliver",
    label: "QA / QC inspections",
    customerPromise: "Inspection checklists and quality evidence on the job spine.",
    href: "/portal/field-supervision",
    depth: "expanding",
    competitorsCovered: ["Procore Inspections"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "materials-purchasing",
    domain: "deliver",
    label: "Materials, POs & procurement",
    customerPromise: "Create purchase orders, track deliveries, and keep material cost on the job.",
    href: "/portal/job-cost",
    depth: "expanding",
    formats: ["CSV PO export", "PDF PO"],
    competitorsCovered: ["Procore Commitments", "Buildertrend Purchasing"],
    auricrux: { teach: true, automate: true, advise: true },
    automations: ["Draft PO", "Flag late delivery", "Cost link"],
  },
  {
    id: "equipment-fleet",
    domain: "deliver",
    label: "Equipment & fleet assignment",
    customerPromise: "Assign tools/fleet to jobs and keep utilization visible.",
    href: "/portal/scheduling",
    depth: "expanding",
    competitorsCovered: ["Fleet management lite", "EquipmentShare logistics"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "timekeeping",
    domain: "deliver",
    label: "Timekeeping & crew hours",
    customerPromise: "Capture crew time against jobs for payroll and job cost.",
    href: "/portal/field-tasks",
    depth: "expanding",
    formats: ["CSV timesheet", "payroll handoff"],
    competitorsCovered: ["ExakTime", "ClockShark"],
    auricrux: { teach: true, automate: true, advise: true },
    automations: ["Approve timesheet", "Push to job cost"],
  },
  {
    id: "invite-to-bid",
    domain: "win-work",
    label: "Invite-to-bid & sub coverage",
    customerPromise: "Invite subs, track coverage, and close bid-day gaps.",
    href: "/portal/bids",
    depth: "expanding",
    competitorsCovered: ["BuildingConnected ITB", "SmartBid"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "specs-csi",
    domain: "design-plans",
    label: "Specs / CSI division review",
    customerPromise: "Attach and review specification books beside the plan set.",
    href: "/portal/files",
    depth: "expanding",
    formats: ["PDF specifications", "CSI division tags"],
    competitorsCovered: ["SpecLink review", "Bluebeam specs"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "cad-dwg",
    domain: "design-plans",
    label: "CAD / DWG sheet packs",
    customerPromise: "Intake DWG/DXF plot sheets and published views into the plan room.",
    href: "/portal/plans",
    depth: "expanding",
    formats: ["DWG", "DXF", "PDF plots"],
    competitorsCovered: ["AutoCAD sheet sets", "Bluebeam"],
    auricrux: { teach: true, automate: true, advise: true },
  },

  // ——— Money ———
  {
    id: "job-cost",
    domain: "money",
    label: "Job cost & WIP",
    customerPromise: "Post actuals, see rollups, and protect margin by job.",
    href: "/portal/job-cost",
    depth: "guided",
    formats: ["CSV", "GL export path"],
    competitorsCovered: ["Foundation", "Sage 300 CRE job cost"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "finance-books",
    domain: "money",
    label: "FCA Books / finance",
    customerPromise: "Contractor finance posture, bank import context, and continuity.",
    href: "/portal/finance",
    depth: "live",
    formats: ["OFX/CSV bank import path", "invoice PDF"],
    competitorsCovered: ["QuickBooks contractor", "Xero"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "billing",
    domain: "money",
    label: "Billing & collections",
    customerPromise: "Invoices, pay apps context, and follow-through in one queue.",
    href: "/portal/billing",
    depth: "live",
    formats: ["PDF invoices", "AIA G702/G703 style pay-app packs"],
    competitorsCovered: ["Bill.com lite", "Procore Commitment Billing"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "pay-apps",
    domain: "money",
    label: "Progress billing / pay applications",
    customerPromise: "Build owner/GC progress bill packages from job cost and contract values.",
    href: "/portal/billing",
    depth: "expanding",
    formats: ["PDF pay app", "CSV schedule of values"],
    competitorsCovered: ["GCPay", "Textura lite"],
    auricrux: { teach: true, automate: true, advise: true },
    automations: ["Draft SOV lines", "Retainage check"],
  },
  {
    id: "payroll-certified",
    domain: "money",
    label: "Payroll & certified payroll continuity",
    customerPromise: "Bridge timesheets into payroll evidence and certified-payroll style packets.",
    href: "/portal/finance",
    depth: "expanding",
    formats: ["CSV payroll export", "PDF certified payroll packet"],
    competitorsCovered: ["LCPtracker lite", "payroll+construction bridges"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "banking",
    domain: "money",
    label: "Banking import & reconciliation",
    customerPromise: "Import bank activity and reconcile toward contractor books.",
    href: "/portal/finance",
    depth: "guided",
    formats: ["OFX", "CSV"],
    competitorsCovered: ["QuickBooks bank feed"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "legal-compliance",
    domain: "money",
    label: "Legal, licenses & liens",
    customerPromise: "Entity, licenses, agreements, lien waivers, DPOR alignment.",
    href: "/portal/legal",
    depth: "live",
    formats: ["PDF agreements", "waiver packs"],
    competitorsCovered: ["Levelset / Billd lien tools"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "warranty",
    domain: "money",
    label: "Warranty & service",
    customerPromise: "Post-handover cases, retention, and recurring service.",
    href: "/portal/warranty",
    depth: "live",
    competitorsCovered: ["ServiceTitan warranty lite"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "insurance-bonding",
    domain: "money",
    label: "Insurance & bonding packets",
    customerPromise: "Keep COIs and bonding evidence in governed document control.",
    href: "/portal/files",
    depth: "expanding",
    formats: ["PDF COI"],
    competitorsCovered: ["myCOI"],
    auricrux: { teach: true, automate: true, advise: true },
  },

  // ——— Documents ———
  {
    id: "files",
    domain: "documents",
    label: "Document control & evidence",
    customerPromise: "Bid packages, permits, legal docs, photos — versioned and auditable.",
    href: "/portal/files",
    depth: "live",
    formats: ["PDF", "DOCX", "XLSX", "CSV", "JPG/PNG", "ZIP", "SharePoint"],
    competitorsCovered: ["Procore Documents", "SharePoint DIY"],
    auricrux: { teach: true, automate: true, advise: true },
    automations: ["Plan briefing", "File classify", "Evidence link"],
  },
  {
    id: "audit",
    domain: "documents",
    label: "Audit & continuity timeline",
    customerPromise: "Every action leave a recoverable evidence trail.",
    href: "/portal/audit",
    depth: "live",
    competitorsCovered: ["Compliance binders"],
    auricrux: { teach: true, automate: true, advise: true },
  },

  // ——— Workforce ———
  {
    id: "academy",
    domain: "workforce",
    label: "FCA Academy (1,245 programs)",
    customerPromise: "Apprenticeship, certification, degree, licensure, and operator training.",
    href: "/academy/catalog",
    depth: "live",
    competitorsCovered: ["LMS vendors", "trade school portals"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "cte",
    domain: "workforce",
    label: "VDOE CTE programs",
    customerPromise: "33 CTE pathways for schools and workforce partners.",
    href: "/cte/portal",
    depth: "live",
    competitorsCovered: ["CTE LMS portals"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "credentials",
    domain: "workforce",
    label: "Credentials & transcripts",
    customerPromise: "Issue and track workforce credentials tied to the same workspace.",
    href: "/academy/credentials",
    depth: "live",
    auricrux: { teach: true, automate: true, advise: true },
  },

  // ——— Comms ———
  {
    id: "messages",
    domain: "comms",
    label: "Team & customer messages",
    customerPromise: "Keep job communication inside the OS, not buried in email.",
    href: "/portal/messages",
    depth: "live",
    competitorsCovered: ["email + Slack DIY"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "notifications",
    domain: "comms",
    label: "Notifications & alerts",
    customerPromise: "See blockers, messages, and continuity signals in one stream.",
    href: "/portal/notifications",
    depth: "live",
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "support",
    domain: "comms",
    label: "Support & recovery",
    customerPromise: "Escalation tickets with continuity context.",
    href: "/portal/support",
    depth: "live",
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "customer-visibility",
    domain: "comms",
    label: "Customer-facing portal visibility",
    customerPromise: "Owners and GCs see projects, files, and status without a second system.",
    href: "/portal/projects",
    depth: "live",
    auricrux: { teach: true, automate: true, advise: true },
  },

  // ——— Operate ———
  {
    id: "profile-branding",
    domain: "operate",
    label: "Profile, branding & entitlements",
    customerPromise: "Customize company look, roles, products, and communications — this is how your account acts.",
    href: "/portal/profile",
    depth: "live",
    auricrux: { teach: true, automate: true, advise: true },
    automations: ["Brand apply", "Entitlement recommend"],
  },
  {
    id: "admin",
    domain: "operate",
    label: "Admin & governance",
    customerPromise: "Tenant control, rollout status, and governed access.",
    href: "/portal/admin",
    depth: "live",
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "auricrux-os",
    domain: "operate",
    label: "Auricrux (teach · advise · automate)",
    customerPromise: "Ask Auricrux to explain, guide, or run the next move on any capability.",
    href: "/portal/auricrux",
    depth: "live",
    competitorsCovered: ["ChatGPT DIY", "copilot bolted onto Procore"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "mobile",
    domain: "operate",
    label: "Mobile companion (Android first)",
    customerPromise: "Field access to the same Track A API for leads, jobs, billing, and Auricrux.",
    href: "/features",
    depth: "expanding",
    competitorsCovered: ["native field apps"],
    auricrux: { teach: true, automate: true, advise: true },
  },
  {
    id: "capability-directory",
    domain: "operate",
    label: "Full capability directory",
    customerPromise: "See everything FCA can do — obvious, searchable, one click away.",
    href: "/portal/capabilities",
    depth: "live",
    auricrux: { teach: true, automate: true, advise: true },
  },
];

export function getCapabilitiesByDomain(domainId) {
  return CAPABILITIES.filter((item) => item.domain === domainId);
}

export function findCapability(idOrHref) {
  const key = String(idOrHref || "").trim().toLowerCase();
  return CAPABILITIES.find((item) => item.id === key || item.href.toLowerCase() === key) || null;
}

export function getPortalDirectoryModules() {
  const seen = new Set();
  const modules = [];
  for (const item of CAPABILITIES) {
    if (!item.href.startsWith("/portal") && !item.href.startsWith("/academy") && !item.href.startsWith("/cte")) {
      continue;
    }
    if (seen.has(item.href)) continue;
    seen.add(item.href);
    modules.push({
      href: item.href,
      label: item.label,
      description: item.customerPromise,
      depth: item.depth,
      domain: item.domain,
    });
  }
  return modules;
}

export function getAuricruxCapabilityStatements() {
  return CAPABILITIES.filter((item) => item.auricrux?.teach || item.auricrux?.automate || item.auricrux?.advise)
    .map((item) => `${item.label}: teach, advise, and automate from ${item.href}`);
}

/** Compact doctrine string for Auricrux chat context (keeps payload bounded). */
export function getAuricruxCapabilityDoctrineContext() {
  const brief = buildAuricruxCapabilityBrief();
  const byDomain = CAPABILITY_DOMAINS.map((domain) => {
    const labels = CAPABILITIES.filter((item) => item.domain === domain.id).map((item) => item.label);
    return `${domain.label}: ${labels.join("; ")}`;
  });
  return {
    doctrine: brief.doctrine,
    totalCapabilities: brief.total,
    domains: brief.domains,
    directoryHref: "/portal/capabilities",
    accountActsHref: "/portal/profile",
    domainIndex: byDomain,
    sampleAutomations: CAPABILITIES.flatMap((item) => (item.automations || []).map((name) => `${item.label} → ${name}`)).slice(0, 40),
  };
}

export function buildAuricruxCapabilityBrief(query = "") {
  const q = String(query || "").trim().toLowerCase();
  const hits = q
    ? CAPABILITIES.filter((item) =>
      `${item.label} ${item.customerPromise} ${(item.formats || []).join(" ")} ${(item.competitorsCovered || []).join(" ")}`
        .toLowerCase()
        .includes(q))
    : CAPABILITIES;
  return {
    total: CAPABILITIES.length,
    domains: CAPABILITY_DOMAINS.length,
    matched: hits.length,
    highlights: hits.slice(0, 12).map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      depth: item.depth,
      promise: item.customerPromise,
      auricrux: item.auricrux,
      automations: item.automations || [],
    })),
    doctrine:
      "If any construction product, AI, or software workflow can beneficially do it, FCA claims it, surfaces it, and Auricrux can teach, advise, and automate it.",
  };
}

export const ACCOUNT_ACTS = [
  {
    title: "Identity & workspace",
    detail: "Your customer ID, company, role, and selected plan determine what SaaS, Academy, and Auricrux lanes open.",
    href: "/portal/profile",
  },
  {
    title: "Brand look",
    detail: "Company name, welcome message, colors, and dashboard density apply across customer-facing workspace pages.",
    href: "/portal/profile",
  },
  {
    title: "Product entitlements",
    detail: "Toggle or verify SaaS, LMS, and Auricrux product access for this account.",
    href: "/portal/profile",
  },
  {
    title: "Communications posture",
    detail: "Chat, SMS, phone, email, Teams, conference, and lecture lanes follow this account’s enabled communications.",
    href: "/portal/profile",
  },
  {
    title: "Session security",
    detail: "Auth is tab-scoped on the web (sessionStorage + httpOnly cookie). Closing the browser clears client auth.",
    href: "/security",
  },
  {
    title: "Full OS directory",
    detail: "Every construction capability FCA covers — searchable and one click from the hub.",
    href: "/portal/capabilities",
  },
];
