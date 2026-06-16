import { navigateTo } from "./navigation";

const SUPPORT_COMMAND_KEY = "fca_customer_support_command_v3";
const BILLING_COMMAND_KEY = "fca_customer_billing_command_v2";
const ESTIMATE_REVISION_QUEUE_KEY = "fca_customer_estimate_revision_queue_v1";
const PROPOSAL_FOLLOWUP_QUEUE_KEY = "fca_customer_proposal_followup_queue_v1";

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
