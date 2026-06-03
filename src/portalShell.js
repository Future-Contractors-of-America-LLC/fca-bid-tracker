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
    detail: "Monitoring bid status, portal requests, and academy handoff",
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
  },
  {
    id: "B-204",
    customer: "North Ridge Commercial",
    stage: "Execution",
    nextAction: "Release mobilization checklist",
    owner: "Project Coordinator",
    due: "Tomorrow",
  },
  {
    id: "C-332",
    customer: "Cedar Valley Schools",
    stage: "Closeout",
    nextAction: "Collect signed punch confirmation",
    owner: "Customer Success",
    due: "This week",
  },
];

export const portalBids = [
  {
    package: "Package A-117",
    value: "$148,000",
    status: "Awaiting Approval",
    blocker: "Customer approval pending",
  },
  {
    package: "Package B-204",
    value: "$322,500",
    status: "Quoted",
    blocker: "Need subcontractor pricing refresh",
  },
  {
    package: "Package C-410",
    value: "$96,300",
    status: "Won",
    blocker: "Convert to contract workspace",
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
    href: "/portal/billing",
    label: "Billing",
    description: "Invoices, review queue, and account follow-through",
  },
  {
    href: "/portal/academy",
    label: "Academy",
    description: "Training continuity tied to the same customer journey",
  },
];
