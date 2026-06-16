import { navigateTo } from "./navigation";

const SUPPORT_COMMAND_KEY = "fca_customer_support_command_v3";
const BILLING_COMMAND_KEY = "fca_customer_billing_command_v2";
const ESTIMATE_REVISION_QUEUE_KEY = "fca_customer_estimate_revision_queue_v1";
const PROPOSAL_FOLLOWUP_QUEUE_KEY = "fca_customer_proposal_followup_queue_v1";
const FILE_INTAKE_DRAFTS_KEY = "fca_customer_file_intake_v1";
const MESSAGE_COMMAND_KEY = "fca_customer_message_command_v1";
const PROJECT_COMMAND_CENTER_QUEUE_KEY = "fca_customer_project_command_center_queue_v1";
const CHANGE_ORDER_REVIEW_QUEUE_KEY = "fca_customer_change_order_review_queue_v1";
const WARRANTY_CASE_QUEUE_KEY = "fca_customer_warranty_case_queue_v1";

function readLocalJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort only
  }
}

export function createPermitEscalationTool({ companyName = "Customer Workspace", projectId = "PRJ-A117", detail = "Permit review is blocking mobilization and customer follow-through." } = {}) {
  const current = readLocalJson(SUPPORT_COMMAND_KEY, { subject: "", priority: "normal", detail: "", tickets: [] });
  const ticket = {
    id: `ticket-${Date.now()}`,
    subject: `${companyName} permit escalation`,
    priority: "high",
    detail: `${detail} Project context: ${projectId}. Auricrux created this support request from the command center so recovery stays attached to live work.`,
    status: "Open",
  };

  writeLocalJson(SUPPORT_COMMAND_KEY, {
    ...current,
    tickets: [ticket, ...(current.tickets || [])],
  });

  navigateTo("/portal/support");
  return ticket;
}

export function stageMobilizationInvoiceTool({ companyName = "Customer Workspace", projectId = "PRJ-A117", amount = "$6,500" } = {}) {
  const current = readLocalJson(BILLING_COMMAND_KEY, { invoiceName: "", amount: "", note: "", invoices: [] });
  const invoice = {
    id: `invoice-${Date.now()}`,
    invoiceName: `${companyName} mobilization invoice`,
    amount,
    note: `Created from the command center for ${projectId}. Auricrux staged this billing action so mobilization, customer continuity, and revenue follow-through stay connected.`,
    status: "Draft",
  };

  writeLocalJson(BILLING_COMMAND_KEY, {
    ...current,
    invoices: [invoice, ...(current.invoices || [])],
  });

  navigateTo("/portal/billing");
  return invoice;
}

export function stageEstimateRevisionTool({ companyName = "Customer Workspace", projectId = "PRJ-A117", estimateId = "EST-1001", scope = "Add owner alternate pricing and revised allowance line." } = {}) {
  const current = readLocalJson(ESTIMATE_REVISION_QUEUE_KEY, { revisions: [] });
  const revision = {
    id: `revision-${Date.now()}`,
    companyName,
    projectId,
    estimateId,
    scope,
    status: "Queued",
    nextAction: "Estimator review required",
  };

  writeLocalJson(ESTIMATE_REVISION_QUEUE_KEY, {
    ...current,
    revisions: [revision, ...(current.revisions || [])],
  });

  navigateTo("/portal/estimates");
  return revision;
}

export function queueProposalFollowupTool({ companyName = "Customer Workspace", proposalId = "PRO-1001", contact = "owner@customer.com", objective = "Confirm approval timing and preserve project handoff momentum." } = {}) {
  const current = readLocalJson(PROPOSAL_FOLLOWUP_QUEUE_KEY, { followups: [] });
  const followup = {
    id: `followup-${Date.now()}`,
    companyName,
    proposalId,
    contact,
    objective,
    status: "Queued",
    nextAction: "Send branded follow-up",
  };

  writeLocalJson(PROPOSAL_FOLLOWUP_QUEUE_KEY, {
    ...current,
    followups: [followup, ...(current.followups || [])],
  });

  navigateTo("/portal/proposals");
  return followup;
}

export function registerOwnerApprovalFileTool({ projectId = "PRJ-A117", fileName = "Owner_Approval_Log.pdf", discipline = "Document Control" } = {}) {
  const current = readLocalJson(FILE_INTAKE_DRAFTS_KEY, {
    name: "",
    category: "Document",
    discipline: "Document Control",
    owner: "Project Coordinator",
    linkedEvidenceTarget: "",
    stagedRecords: [],
  });

  const stagedRecord = {
    id: `file-${Date.now()}`,
    name: fileName,
    category: "Document",
    discipline,
    owner: "Project Coordinator",
    linkedEvidenceTarget: `${projectId} governed evidence chain`,
    status: "Registered",
    evidenceStatus: "Pending review",
  };

  writeLocalJson(FILE_INTAKE_DRAFTS_KEY, {
    ...current,
    stagedRecords: [stagedRecord, ...(current.stagedRecords || [])],
    name: fileName,
    category: "Document",
    discipline,
    owner: "Project Coordinator",
    linkedEvidenceTarget: `${projectId} governed evidence chain`,
  });

  navigateTo("/portal/files");
  return stagedRecord;
}

export function sendCustomerScheduleUpdateTool({ companyName = "Customer Workspace", channel = "email", subject = "Updated project schedule", message = "Auricrux prepared an updated schedule notice with next milestones and customer commitments." } = {}) {
  const current = readLocalJson(MESSAGE_COMMAND_KEY, { subject: "", message: "", channel: "email", sent: [] });
  const outbound = {
    id: `msg-${Date.now()}`,
    subject: `${companyName} · ${subject}`,
    message,
    channel,
  };

  writeLocalJson(MESSAGE_COMMAND_KEY, {
    ...current,
    sent: [outbound, ...(current.sent || [])],
    subject: outbound.subject,
    message,
    channel,
  });

  navigateTo("/portal/messages");
  return outbound;
}

export function stageCloseoutPrepTool({ companyName = "Customer Workspace", projectId = "PRJ-A117", checklist = "Collect owner approvals, O&M documents, punch resolution, and turnover packet." } = {}) {
  const current = readLocalJson(PROJECT_COMMAND_CENTER_QUEUE_KEY, { closeouts: [], approvals: [] });
  const closeout = {
    id: `closeout-${Date.now()}`,
    companyName,
    projectId,
    checklist,
    status: "Queued",
    nextAction: "Prepare closeout packet",
  };

  writeLocalJson(PROJECT_COMMAND_CENTER_QUEUE_KEY, {
    ...current,
    closeouts: [closeout, ...(current.closeouts || [])],
  });

  navigateTo("/portal/projects");
  return closeout;
}

export function queueCustomerApprovalReminderTool({ companyName = "Customer Workspace", projectId = "PRJ-A117", contact = "owner@customer.com", objective = "Customer approval reminder for active decision gate." } = {}) {
  const current = readLocalJson(PROJECT_COMMAND_CENTER_QUEUE_KEY, { closeouts: [], approvals: [] });
  const reminder = {
    id: `approval-${Date.now()}`,
    companyName,
    projectId,
    contact,
    objective,
    status: "Queued",
    nextAction: "Send branded approval reminder",
  };

  writeLocalJson(PROJECT_COMMAND_CENTER_QUEUE_KEY, {
    ...current,
    approvals: [reminder, ...(current.approvals || [])],
  });

  navigateTo("/portal/projects");
  return reminder;
}

export function queueChangeOrderPricingReviewTool({ projectId = "PRJ-A117", estimateId = "EST-1001", changeOrderTitle = "Electrical scope revision", detail = "Review added scope, pricing impact, and customer decision path." } = {}) {
  const current = readLocalJson(CHANGE_ORDER_REVIEW_QUEUE_KEY, { items: [] });
  const item = {
    id: `co-${Date.now()}`,
    projectId,
    estimateId,
    changeOrderTitle,
    detail,
    status: "Queued",
    nextAction: "Price and send change order",
  };

  writeLocalJson(CHANGE_ORDER_REVIEW_QUEUE_KEY, {
    ...current,
    items: [item, ...(current.items || [])],
  });

  navigateTo("/portal/estimates");
  return item;
}

export function stageWarrantyServiceCaseTool({ companyName = "Customer Workspace", projectId = "PRJ-A117", issue = "Document post-closeout service concern and response path." } = {}) {
  const current = readLocalJson(WARRANTY_CASE_QUEUE_KEY, { cases: [] });
  const warrantyCase = {
    id: `warranty-${Date.now()}`,
    companyName,
    projectId,
    issue,
    status: "Open",
    nextAction: "Assign service response",
  };

  writeLocalJson(WARRANTY_CASE_QUEUE_KEY, {
    ...current,
    cases: [warrantyCase, ...(current.cases || [])],
  });

  navigateTo("/portal/support");
  return warrantyCase;
}
