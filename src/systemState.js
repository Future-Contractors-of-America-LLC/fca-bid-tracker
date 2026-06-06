export const portalTenant = {
  id: "TEN-FCA-001",
  name: "FCA Pilot Customer",
  roleSummary: "Owner/Admin workspace with customer portal, billing visibility, and academy continuity enabled.",
};

export const currentProject = {
  id: "PRJ-A117",
  name: "FCA Pilot Customer Tenant Improvement",
  customer: "FCA Pilot Customer",
  stage: "Estimating → Execution Handoff",
  fileSetLabel: "18 linked files and onboarding artifacts",
  fileSpineStatus: "Bid package summary, onboarding roster, and closeout checklist are attached to the same project context.",
  auditLabel: "Auricrux action log active",
  auditStatus: "Customer actions, billing transitions, and academy continuity cues are expected to write into one auditable timeline.",
  auricruxMode: "Context-aware workspace guidance",
  auricruxSummary: "Auricrux is reading the current tenant, project, stage, and next-action state from this shared shell context.",
};

export const workspaceContext = {
  currentStageLabel: "Estimating to execution handoff",
  stageSummary: "The current workspace is positioned between customer approval, operational setup, billing progression, and academy continuity.",
  currentNextAction: "Approve revised scope and release onboarding packet",
  nextActionOwner: "Estimator Team + Customer Success coordination",
  auditStatusLabel: "Shared timeline active",
  auditSummary: "Auricrux, customer-facing actions, and workspace transitions should resolve into one audit spine for PRJ-A117.",
};

export const auricruxRail = {
  systemState: "Auricrux online and context-aware",
  nextRecommendedAction: "Release approval request for Package A-117",
  recommendationReason: "Customer approval is the cleanest path to unlock project setup, file continuity, billing progression, and academy onboarding.",
  currentBlocker: "Open scope approval pending",
  blockerImpact: "Execution handoff, invoice readiness, and workforce assignment stay constrained until the customer decision is recorded.",
  lastAction: "Validated bid completeness and linked onboarding artifacts",
  lastActionResult: "The shared workspace now reflects bid, file, audit, and academy continuity state under PRJ-A117.",
  readinessState: "Production shell ready / backend spine in progress",
  readinessSummary: "The shell is positioned for permanent workspace use while deeper project, file, audit, and academy persistence continue to harden behind it.",
};

export const routeStateOverlays = {
  platform: {
    title: "Unified platform dashboard state",
    summary: "This route summarizes the whole operating shell in one place so portal operations, academy continuity, support posture, admin readiness, and Auricrux state can be reviewed together.",
    status: "Platform state active",
    primaryFocus: "Executive and customer summary",
    primaryDetail: "This route is the clearest single-surface view of current tenant, project, readiness, and operating continuity.",
    dependency: "Shared route-state integrity",
    dependencyDetail: "The platform view depends on all specialized routes staying attached to the same tenant, project, file, audit, and Auricrux state.",
    auricruxRole: "Summarize and direct",
    auricruxDetail: "Auricrux uses this route to present system state clearly and direct the user into the next operational surface.",
  },
  overview: {
    title: "Workspace overview state",
    summary: "Overview emphasizes account-level continuity, active next actions, and readiness to move the customer into deeper operational routes.",
    status: "Overview active",
    primaryFocus: "Cross-route visibility",
    primaryDetail: "This route summarizes the shared tenant, project, and Auricrux state before deeper operational handling.",
    dependency: "Project and messaging continuity",
    dependencyDetail: "Overview depends on project context, message activity, and next-action sequencing staying aligned.",
    auricruxRole: "Sequence and explain",
    auricruxDetail: "Auricrux surfaces current priorities and explains what route should be opened next.",
  },
  bids: {
    title: "Bid route state",
    summary: "Bids specialize the shared workspace state around approval readiness, estimating blockers, and conversion into project setup.",
    status: "Bid state active",
    primaryFocus: "Approval progression",
    primaryDetail: "This route focuses on the decision path that turns estimating work into a true project record.",
    dependency: "Customer scope approval",
    dependencyDetail: "Until scope approval is recorded, downstream project, billing, and academy actions remain constrained.",
    auricruxRole: "Validate and recommend",
    auricruxDetail: "Auricrux checks bid completeness, explains blockers, and recommends the next approval move.",
  },
  projects: {
    title: "Project route state",
    summary: "Projects specialize the shared state around delivery coordination, stage ownership, and execution handoff readiness.",
    status: "Project state active",
    primaryFocus: "Operational handoff",
    primaryDetail: "This route anchors execution continuity and makes the project/job record the operational root.",
    dependency: "Bid-to-project conversion",
    dependencyDetail: "Project operations depend on approved bid state and clean linkage into the shared project object.",
    auricruxRole: "Track and correct",
    auricruxDetail: "Auricrux monitors stage movement, identifies missing handoff information, and preserves accountability.",
  },
  files: {
    title: "File route state",
    summary: "Files specialize the shared state around artifact linkage, project evidence continuity, and usable document access.",
    status: "File state active",
    primaryFocus: "Artifact attachment",
    primaryDetail: "This route ensures bid packages, onboarding documents, and project artifacts remain attached to one project spine.",
    dependency: "Project-linked file spine",
    dependencyDetail: "File handling depends on shared project identity and auditable attachment of documents to operational records.",
    auricruxRole: "Read and contextualize",
    auricruxDetail: "Auricrux reads file context, explains what each artifact means, and detects documentation gaps.",
  },
  messages: {
    title: "Message route state",
    summary: "Messages specialize the shared state around communication continuity, escalation awareness, and customer movement to the next step.",
    status: "Message state active",
    primaryFocus: "Communication follow-through",
    primaryDetail: "This route keeps customer-facing and internal communication from becoming a dead-end surface.",
    dependency: "Shared audit and next-action state",
    dependencyDetail: "Messages depend on knowing what was last done, what is pending, and who owns the next step.",
    auricruxRole: "Escalate and clarify",
    auricruxDetail: "Auricrux uses message state to explain urgency, preserve continuity, and route the customer forward.",
  },
  notifications: {
    title: "Notification route state",
    summary: "Notifications specialize the shared state around alert visibility, recent activity awareness, and continuity cues tied to the same customer workspace.",
    status: "Notification state active",
    primaryFocus: "Alert visibility",
    primaryDetail: "This route centralizes what changed most recently so the customer can react without losing project and Auricrux context.",
    dependency: "Message, audit, and route continuity",
    dependencyDetail: "Notifications depend on message activity, audit events, and shared route-state continuity remaining attached to the same customer and project spine.",
    auricruxRole: "Signal and prioritize",
    auricruxDetail: "Auricrux turns recent messages and audit events into a prioritized alert stream so the customer sees what matters next.",
  },
  billing: {
    title: "Billing route state",
    summary: "Billing specializes the shared state around revenue follow-through, invoice readiness, and customer retention continuity.",
    status: "Billing state active",
    primaryFocus: "Revenue progression",
    primaryDetail: "This route connects approved work to invoice review while keeping academy and long-term support in view.",
    dependency: "Project and audit readiness",
    dependencyDetail: "Billing depends on a clean operational record, linked files, and visible approval history.",
    auricruxRole: "Advance and verify",
    auricruxDetail: "Auricrux checks readiness, flags blockers, and keeps billing from breaking continuity with the rest of the shell.",
  },
  academy: {
    title: "Academy route state",
    summary: "Academy specializes the shared state around workforce enablement, learner readiness, and project-linked training continuity.",
    status: "Academy state active",
    primaryFocus: "Workforce readiness",
    primaryDetail: "This route keeps training, certification, and onboarding connected to the same project and tenant state as the portal.",
    dependency: "Project-linked learner context",
    dependencyDetail: "Academy continuity depends on shared tenant, project, file, and next-action data rather than isolated LMS state.",
    auricruxRole: "Coach and align",
    auricruxDetail: "Auricrux uses operational state to recommend learning actions and align workforce readiness to live work.",
  },
  support: {
    title: "Support route state",
    summary: "Support specializes the shared state around continuity recovery, escalation handling, and customer help inside the same shell.",
    status: "Support state active",
    primaryFocus: "Escalation continuity",
    primaryDetail: "This route keeps support requests attached to project, audit, and next-action context instead of leaving them isolated.",
    dependency: "Message and audit visibility",
    dependencyDetail: "Support depends on current blocker visibility, prior actions, and cross-route context staying available.",
    auricruxRole: "Recover and route",
    auricruxDetail: "Auricrux identifies the cleanest recovery path and sends the user to the next operational surface.",
  },
  admin: {
    title: "Admin route state",
    summary: "Admin specializes the shared state around tenant rollout, seat readiness, governance visibility, and production posture.",
    status: "Admin state active",
    primaryFocus: "Control and rollout",
    primaryDetail: "This route begins the broader platform spine for tenant-level administration inside the same shell.",
    dependency: "Tenant, project, and governance context",
    dependencyDetail: "Admin depends on persistent tenant identity, route continuity, and visible Auricrux governance state.",
    auricruxRole: "Govern and monitor",
    auricruxDetail: "Auricrux keeps administrative state legible and tied to live workspace readiness rather than detached settings.",
  },
};

export const projectAuditEvents = [
  {
    time: "Today · 8:10 AM",
    action: "Auricrux validated bid completeness",
    detail: "Package A-117 was checked for missing scope fields before customer approval routing.",
  },
  {
    time: "Today · 9:25 AM",
    action: "Customer document set linked",
    detail: "Bid package summary and onboarding roster were attached to project PRJ-A117 for shared visibility.",
  },
  {
    time: "Today · 11:05 AM",
    action: "Billing readiness advanced",
    detail: "Invoice review path and academy continuity prompts were prepared from the same project context.",
  },
  {
    time: "Today · 1:40 PM",
    action: "Academy continuity synchronized",
    detail: "Learner assignment, readiness coaching, and workforce enablement were aligned to project PRJ-A117.",
  },
];

export const portalMetrics = [
  {
    label: "Active Projects",
    value: "4",
    detail: "2 in estimating, 1 in execution, 1 in closeout",
  },
  {
    label: "Unread Messages",
    value: "7",
    detail: "Sales, project coordination, and onboarding updates",
  },
  {
    label: "Documents Ready",
    value: "18",
    detail: "Bids, permits, onboarding forms, and training docs",
  },
  {
    label: "Auricrux Status",
    value: "Online",
    detail: "Monitoring bid status, portal requests, academy handoff, and support escalation",
  },
];

export const portalProjects = [
  {
    id: "A-117",
    customer: "FCA Pilot Customer",
    stage: "Estimating",
    nextAction: "Approve revised scope",
    owner: "Estimator Team",
    due: "Today",
    superintendent: "Pending assignment",
    permitStatus: "Permit set not submitted",
    siteStatus: "Awaiting customer approval before mobilization",
    commercialFocus: "Tenant improvement pricing and long-lead approvals",
  },
  {
    id: "B-204",
    customer: "North Ridge Commercial",
    stage: "Execution",
    nextAction: "Release mobilization checklist",
    owner: "Project Coordinator",
    due: "Tomorrow",
    superintendent: "M. Alvarez",
    permitStatus: "Permit approved",
    siteStatus: "Mobilization scheduled for Monday",
    commercialFocus: "Subcontractor alignment and field kickoff readiness",
  },
  {
    id: "C-332",
    customer: "Cedar Valley Schools",
    stage: "Closeout",
    nextAction: "Collect signed punch confirmation",
    owner: "Customer Success",
    due: "This week",
    superintendent: "R. Carter",
    permitStatus: "Final inspection pending",
    siteStatus: "Punch items down to final owner signoff",
    commercialFocus: "Closeout package and retainage release tracking",
  },
];

export const portalBids = [
  {
    package: "Package A-117",
    value: "$148,000",
    status: "Awaiting Approval",
    blocker: "Customer approval pending",
    estimator: "J. Benton",
    scopePackage: "Interior demo, framing, MEP coordination",
    dueDate: "Today",
    tradeCoverage: "Mechanical quote still provisional",
    nextCommercialMove: "Release revised scope log and owner approval email",
  },
  {
    package: "Package B-204",
    value: "$322,500",
    status: "Quoted",
    blocker: "Need subcontractor pricing refresh",
    estimator: "L. Nguyen",
    scopePackage: "Exterior upgrades and site electrical",
    dueDate: "Monday",
    tradeCoverage: "Electrical and concrete numbers due for final leveling",
    nextCommercialMove: "Close trade leveling sheet and update fee carry",
  },
  {
    package: "Package C-410",
    value: "$96,300",
    status: "Won",
    blocker: "Convert to contract workspace",
    estimator: "A. Ramirez",
    scopePackage: "Finish carpentry and punch completion",
    dueDate: "Contract this week",
    tradeCoverage: "All coverage in hand; move to job-start packet",
    nextCommercialMove: "Issue startup packet, billing schedule, and field onboarding",
  },
];

export const portalFiles = [
  {
    name: "Bid package summary.pdf",
    category: "Bid",
    updated: "18 minutes ago",
    action: "Review and approve",
  },
  {
    name: "Onboarding roster.xlsx",
    category: "Workforce",
    updated: "1 hour ago",
    action: "Assign learners",
  },
  {
    name: "Project closeout checklist.docx",
    category: "Project",
    updated: "Yesterday",
    action: "Finalize closeout",
  },
];

export const portalMessages = [
  {
    from: "Estimator Team",
    subject: "Bid review updated",
    preview: "Scope assumptions were tightened and ready for customer review.",
    time: "18 min ago",
  },
  {
    from: "Customer Success",
    subject: "Training seats confirmed",
    preview: "Monday onboarding seats are reserved for two new field users.",
    time: "43 min ago",
  },
  {
    from: "Auricrux",
    subject: "One approval is ready",
    preview: "Package A-117 is positioned for approval and portal follow-through.",
    time: "Now",
  },
];

export const portalBilling = [
  {
    invoice: "INV-1042",
    customer: "North Ridge Commercial",
    amount: "$24,800",
    status: "Draft",
  },
  {
    invoice: "INV-1043",
    customer: "Cedar Valley Schools",
    amount: "$11,200",
    status: "Sent",
  },
  {
    invoice: "INV-1044",
    customer: "FCA Pilot Customer",
    amount: "$6,500",
    status: "Ready for review",
  },
];

export const auricruxActions = [
  "Review pending customer approval for Bid Package A-117.",
  "Send onboarding packet to 2 newly assigned field users.",
  "Confirm safety certification progress before project mobilization.",
  "Follow up on one open RFI blocking subcontractor pricing.",
];

export const portalModules = [
  {
    href: "/portal/platform",
    label: "Platform",
    description: "Unified executive and customer shell summary",
  },
  {
    href: "/portal",
    label: "Overview",
    description: "Customer account summary and next actions",
  },
  {
    href: "/portal/projects",
    label: "Projects",
    description: "Execution visibility and stage tracking",
  },
  {
    href: "/portal/bids",
    label: "Bids",
    description: "Pipeline, approvals, and conversion readiness",
  },
  {
    href: "/portal/files",
    label: "Files",
    description: "Bid packages, permits, and onboarding docs",
  },
  {
    href: "/portal/messages",
    label: "Messages",
    description: "Customer communications and Auricrux updates",
  },
  {
    href: "/portal/notifications",
    label: "Notifications",
    description: "Alert stream for messages, audits, and continuity signals",
  },
  {
    href: "/portal/billing",
    label: "Billing",
    description: "Invoices, review queue, and account follow-through",
  },
  {
    href: "/portal/academy",
    label: "Academy",
    description: "Training continuity tied to the same customer journey",
  },
  {
    href: "/portal/support",
    label: "Support",
    description: "Escalation, recovery, and continuity support",
  },
  {
    href: "/portal/admin",
    label: "Admin",
    description: "Tenant control, rollout status, and governance visibility",
  },
];

export const portalJourney = [
  { key: "lead", label: "Lead / Intake", href: "/login" },
  { key: "bid", label: "Bid / Estimate", href: "/portal/bids" },
  { key: "job", label: "Project / Job", href: "/portal/projects" },
  { key: "coordination", label: "Files + Messages", href: "/portal/files" },
  { key: "finance", label: "Billing / Admin", href: "/portal/billing" },
  { key: "academy", label: "Academy / Support", href: "/portal/academy" },
];

export const STORAGE_KEY = "fca_workspace_state_v1";

export const defaultWorkspaceState = {
  tenant: portalTenant,
  project: currentProject,
  workspace: workspaceContext,
  auricrux: auricruxRail,
  meta: {
    backingSource: "localStorage",
    persistenceState: "Seeded from canonical shell state",
    lastSyncedAt: null,
  },
};
