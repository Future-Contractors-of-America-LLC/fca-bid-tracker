import { centralFetch } from "./backendBase";

async function readJsonSafe(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function unwrap(payload) {
  if (!payload?.ok) throw new Error(payload?.error || "Financial workspace request failed.");
  return payload;
}

export async function fetchFinancialWorkspace(view = "dashboard", params = {}) {
  const search = new URLSearchParams({ view });
  if (params.report) search.set("report", params.report);
  if (params.projectId) search.set("projectId", params.projectId);
  const response = await centralFetch(`/api/financial-workspace?${search.toString()}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to load financial workspace.");
  return unwrap(payload);
}

export async function mutateFinancialWorkspace(action, body = {}) {
  const response = await centralFetch("/api/financial-workspace", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to update financial workspace.");
  return unwrap(payload);
}

export async function createInvoiceFromEstimate(estimateId, projectId) {
  return mutateFinancialWorkspace("create-invoice-from-estimate", { estimateId, projectId, autoIssue: true });
}

export async function createPayAppFromSov(projectId, period) {
  return mutateFinancialWorkspace("create-pay-app-from-sov", { projectId, period });
}

export async function advancePayApp(payAppId, status, amountRequested) {
  return mutateFinancialWorkspace("advance-pay-app", { payAppId, status, amountRequested });
}

export async function upsertSovLine(projectId, line) {
  return mutateFinancialWorkspace("upsert-sov-line", { projectId, ...line });
}

export async function recordNativePayment(body) {
  return mutateFinancialWorkspace("record-native-payment", body);
}

export async function importBankCsv(body) {
  return mutateFinancialWorkspace("import-bank-csv", body);
}

export async function createRecurringInvoice(body) {
  return mutateFinancialWorkspace("create-recurring-invoice", body);
}

export async function runRecurringInvoice(recurringId) {
  return mutateFinancialWorkspace("run-recurring-invoice", { recurringId });
}

export async function generatePayAppDocument(projectId, payAppId) {
  return mutateFinancialWorkspace("generate-pay-app-document", { projectId, payAppId });
}

export async function postJournalEntry(body) {
  return mutateFinancialWorkspace("post-journal-entry", body);
}

export async function seedSovFromEstimate(estimateId, projectId) {
  return mutateFinancialWorkspace("seed-sov-from-estimate", { estimateId, projectId });
}

export async function fetchReportExport(reportType) {
  return fetchFinancialWorkspace("report-export", { report: reportType });
}
