import { navigateTo } from "./navigation";

const SUPPORT_COMMAND_KEY = "fca_customer_support_command_v3";
const BILLING_COMMAND_KEY = "fca_customer_billing_command_v2";

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
