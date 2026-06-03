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
